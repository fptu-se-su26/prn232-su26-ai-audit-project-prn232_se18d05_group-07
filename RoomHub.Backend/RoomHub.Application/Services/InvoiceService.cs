using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Invoices;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using OfficeOpenXml;

namespace Application.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IContractRepository _contractRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IUtilityReadingRepository _utilityReadingRepository;
        private readonly IUnitOfWork _unitOfWork;

        public InvoiceService(
            IInvoiceRepository invoiceRepository,
            IContractRepository contractRepository,
            IRoomRepository roomRepository,
            IUtilityReadingRepository utilityReadingRepository,
            IUnitOfWork unitOfWork)
        {
            _invoiceRepository = invoiceRepository;
            _contractRepository = contractRepository;
            _roomRepository = roomRepository;
            _utilityReadingRepository = utilityReadingRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<InvoiceHeaderDto>> GetOwnerInvoicesAsync(string ownerId)
        {
            var invoices = await _invoiceRepository.GetInvoicesByOwnerAsync(ownerId);

            return invoices.Select(i => new InvoiceHeaderDto
            {
                Id = i.Id,
                RoomNumber = i.Contract.Room.RoomNumber,
                BuildingName = i.Contract.Room.Floor.Building.Name,
                Month = i.InvoiceDate.ToString("MM/yyyy"),
                TotalAmount = i.TotalAmount,
                Status = i.Status switch
                {
                    InvoiceStatus.Paid => "Đã thanh toán",
                    InvoiceStatus.Unpaid => "Chưa thanh toán",
                    InvoiceStatus.Overdue => "Quá hạn",
                    InvoiceStatus.Pending => "Chờ xử lý",
                    InvoiceStatus.Cancelled => "Đã hủy",
                    _ => "Chưa thanh toán"
                },
                DueDate = i.DueDate.ToString("dd/MM/yyyy"),
                TenantName = i.Contract.TemporaryTenantName ?? i.Contract.Tenant?.FullName ?? "Chưa rõ",
                TenantPhone = i.Contract.TemporaryTenantPhone ?? i.Contract.Tenant?.PhoneNumber ?? "",
                IsLinkedAccount = i.Contract.TenantId != null
            }).ToList();
        }

        public async Task<InvoiceDetailDto?> GetInvoiceDetailAsync(int invoiceId, string ownerId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null || invoice.Contract.OwnerId != ownerId)
                return null;

            var building = invoice.Contract.Room.Floor.Building;
            var tenantUser = invoice.Contract.Tenant;

            var dto = new InvoiceDetailDto
            {
                Id = invoice.Id,
                RoomNumber = invoice.Contract.Room.RoomNumber,
                BuildingName = building.Name,
                BuildingAddress = building.Address,
                TenantName = invoice.Contract.TemporaryTenantName ?? tenantUser?.FullName ?? "Chưa rõ",
                TenantPhone = invoice.Contract.TemporaryTenantPhone ?? tenantUser?.PhoneNumber ?? "",
                Month = invoice.InvoiceDate.ToString("MM/yyyy"),
                InvoiceDate = invoice.InvoiceDate.ToString("dd/MM/yyyy"),
                DueDate = invoice.DueDate.ToString("dd/MM/yyyy"),
                TotalAmount = invoice.TotalAmount,
                Status = invoice.Status switch
                {
                    InvoiceStatus.Paid => "Đã thanh toán",
                    InvoiceStatus.Unpaid => "Chưa thanh toán",
                    InvoiceStatus.Overdue => "Quá hạn",
                    InvoiceStatus.Pending => "Chờ xử lý",
                    InvoiceStatus.Cancelled => "Đã hủy",
                    _ => "Chưa thanh toán"
                },
                IsLinkedAccount = invoice.Contract.TenantId != null
            };

            foreach (var item in invoice.InvoiceItems)
            {
                dto.Items.Add(new InvoiceItemDto
                {
                    Description = item.Description ?? "",
                    Amount = item.Amount,
                    ItemType = item.ItemType
                });
            }

            foreach (var payment in invoice.Payments.Where(p => p.Status == "Completed"))
            {
                dto.Payments.Add(new InvoicePaymentDto
                {
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod switch
                    {
                        "BankTransfer" => "Chuyển khoản",
                        "Cash" => "Tiền mặt",
                        _ => "Ví điện tử"
                    },
                    PaidAt = payment.PaidAt?.ToString("dd/MM/yyyy HH:mm") ?? "",
                    TransactionId = payment.TransactionId ?? ""
                });
            }

            return dto;
        }

        public async Task<bool> CreateBatchInvoicesAsync(BatchInvoiceRequest request, string ownerId)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var buildingRooms = await _roomRepository.GetRoomsByBuildingAsync(request.BuildingId);
                var invoiceDate = new DateTime(request.Year, request.Month, 1, 0, 0, 0, DateTimeKind.Utc);

                foreach (var readingInput in request.RoomReadings)
                {
                    var room = buildingRooms.FirstOrDefault(r => r.Id == readingInput.RoomId);
                    if (room == null || room.IsDeleted)
                        continue;

                    var activeContract = await _contractRepository.GetActiveContractByRoomIdAsync(room.Id);
                    if (activeContract == null)
                        continue; // No active contract, skip billing this room

                    var building = room.Floor.Building;

                    // Calculate utilities costs
                    var elecUsage = readingInput.NewElectricity - readingInput.OldElectricity;
                    var waterUsage = readingInput.NewWater - readingInput.OldWater;

                    var elecPrice = room.ElectricityPrice ?? building.ElectricityPrice;
                    var waterPrice = room.WaterPrice ?? building.WaterPrice;
                    var internetPrice = room.InternetPrice ?? building.InternetPrice;
                    var garbagePrice = room.GarbagePrice ?? building.GarbagePrice;

                    var elecCost = elecUsage > 0 ? elecUsage * elecPrice : 0;
                    var waterCost = waterUsage > 0 ? waterUsage * waterPrice : 0;

                    var total = activeContract.RentAmount + elecCost + waterCost + internetPrice + garbagePrice
                                + readingInput.AdditionalPrice - readingInput.ReductionPrice;

                    // 1. Create Invoice
                    var invoice = new Invoice
                    {
                        ContractId = activeContract.Id,
                        InvoiceDate = invoiceDate,
                        DueDate = request.DueDate,
                        Status = InvoiceStatus.Unpaid,
                        TotalAmount = total,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _invoiceRepository.AddAsync(invoice);
                    await _unitOfWork.SaveChangesAsync(); // To get the invoice ID

                    // 2. Create Invoice Items
                    var items = new List<InvoiceItem>
                    {
                        new InvoiceItem { InvoiceId = invoice.Id, ItemType = "Rent", Amount = activeContract.RentAmount, Description = $"Tiền thuê phòng tháng {request.Month:D2}/{request.Year}" },
                        new InvoiceItem { InvoiceId = invoice.Id, ItemType = "Electricity", Amount = elecCost, Description = $"Tiền điện (Chỉ số: {readingInput.OldElectricity} -> {readingInput.NewElectricity}, Sử dụng: {elecUsage} kWh)" },
                        new InvoiceItem { InvoiceId = invoice.Id, ItemType = "Water", Amount = waterCost, Description = $"Tiền nước (Chỉ số: {readingInput.OldWater} -> {readingInput.NewWater}, Sử dụng: {waterUsage} m³)" },
                        new InvoiceItem { InvoiceId = invoice.Id, ItemType = "Internet", Amount = internetPrice, Description = "Tiền mạng Internet" },
                        new InvoiceItem { InvoiceId = invoice.Id, ItemType = "Garbage", Amount = garbagePrice, Description = "Phí vệ sinh & dịch vụ trọ" }
                    };

                    if (readingInput.AdditionalPrice > 0)
                    {
                        items.Add(new InvoiceItem { InvoiceId = invoice.Id, ItemType = "Add", Amount = readingInput.AdditionalPrice, Description = $"Phụ thu: {readingInput.Note ?? "Chi phí phát sinh"}" });
                    }

                    if (readingInput.ReductionPrice > 0)
                    {
                        items.Add(new InvoiceItem { InvoiceId = invoice.Id, ItemType = "Reduce", Amount = -readingInput.ReductionPrice, Description = $"Giảm trừ: {readingInput.Note ?? "Hỗ trợ giảm trừ"}" });
                    }

                    foreach (var item in items)
                    {
                        // Add directly to DbContext via room / building
                        activeContract.Invoices.Last().InvoiceItems.Add(item);
                    }

                    // 3. Save Utility readings
                    var elecReading = new UtilityReading
                    {
                        ContractId = activeContract.Id,
                        ReadingDate = DateTime.UtcNow,
                        UtilityType = UtilityType.Electricity,
                        OldIndex = readingInput.OldElectricity,
                        NewIndex = readingInput.NewElectricity,
                        Usage = elecUsage,
                        Amount = elecCost
                    };

                    var waterReading = new UtilityReading
                    {
                        ContractId = activeContract.Id,
                        ReadingDate = DateTime.UtcNow,
                        UtilityType = UtilityType.Water,
                        OldIndex = readingInput.OldWater,
                        NewIndex = readingInput.NewWater,
                        Usage = waterUsage,
                        Amount = waterCost
                    };

                    await _utilityReadingRepository.AddAsync(elecReading);
                    await _utilityReadingRepository.AddAsync(waterReading);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<bool> RecordPaymentAsync(int invoiceId, RecordPaymentRequest request, string ownerId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null || invoice.Contract.OwnerId != ownerId)
                return false;

            if (invoice.Status == InvoiceStatus.Paid)
                return true; // Already paid

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var payment = new Payment
                {
                    InvoiceId = invoice.Id,
                    Amount = request.Amount,
                    PaymentMethod = request.PaymentMethod,
                    TransactionId = request.TransactionId ?? ("TXN" + DateTime.UtcNow.Ticks),
                    Status = "Completed",
                    PaidAt = DateTime.UtcNow
                };

                invoice.Payments.Add(payment);

                // Update invoice status based on total paid amount
                var totalPaid = invoice.Payments.Where(p => p.Status == "Completed").Sum(p => p.Amount) + request.Amount;
                if (totalPaid >= invoice.TotalAmount)
                {
                    invoice.Status = InvoiceStatus.Paid;
                }
                else
                {
                    invoice.Status = InvoiceStatus.Unpaid; // Or PartiallyPaid if we had it, but InvoiceStatus doesn't have partial in backend
                }

                await _invoiceRepository.UpdateAsync(invoice);
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<bool> CancelInvoiceAsync(int invoiceId, string ownerId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null || invoice.Contract.OwnerId != ownerId)
                return false;

            invoice.Status = InvoiceStatus.Cancelled;

            await _invoiceRepository.UpdateAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<byte[]> ExportInvoiceToExcelAsync(int invoiceId, string ownerId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null || invoice.Contract.OwnerId != ownerId)
                throw new Exception("Không tìm thấy hóa đơn này hoặc bạn không có quyền truy cập.");

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add($"HoaDon-{invoice.Id}");

                worksheet.Cells.Style.Font.Name = "Arial";
                worksheet.Cells.Style.Font.Size = 11;

                // Title
                worksheet.Cells["A1:D1"].Merge = true;
                worksheet.Cells["A1"].Value = "HOÁ ĐƠN THANH TOÁN TIỀN PHÒNG";
                worksheet.Cells["A1"].Style.Font.Size = 16;
                worksheet.Cells["A1"].Style.Font.Bold = true;
                worksheet.Cells["A1"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

                // Info
                worksheet.Cells["A3"].Value = "Tên tài sản:";
                worksheet.Cells["B3"].Value = invoice.Contract.Room.Floor.Building.Name;
                worksheet.Cells["A4"].Value = "Phòng trọ:";
                worksheet.Cells["B4"].Value = $"Phòng {invoice.Contract.Room.RoomNumber}";

                worksheet.Cells["C3"].Value = "Khách thuê:";
                worksheet.Cells["D3"].Value = invoice.Contract.TemporaryTenantName ?? invoice.Contract.Tenant?.FullName ?? "Chưa rõ";
                worksheet.Cells["C4"].Value = "Số điện thoại:";
                worksheet.Cells["D4"].Value = invoice.Contract.TemporaryTenantPhone ?? invoice.Contract.Tenant?.PhoneNumber ?? "";

                worksheet.Cells["A5"].Value = "Tháng thanh toán:";
                worksheet.Cells["B5"].Value = invoice.InvoiceDate.ToString("MM/yyyy");
                worksheet.Cells["C5"].Value = "Hạn đóng tiền:";
                worksheet.Cells["D5"].Value = invoice.DueDate.ToString("dd/MM/yyyy");

                // Headers
                worksheet.Cells["A7"].Value = "Mục thanh toán";
                worksheet.Cells["B7"].Value = "Mô tả chi tiết";
                worksheet.Cells["C7"].Value = "Số tiền";
                
                worksheet.Cells["A7:C7"].Style.Font.Bold = true;
                worksheet.Cells["A7:C7"].Style.Fill.SetBackground(System.Drawing.Color.LightSkyBlue);

                int row = 8;
                foreach (var item in invoice.InvoiceItems)
                {
                    worksheet.Cells[row, 1].Value = item.ItemType switch
                    {
                        "Rent" => "Tiền phòng",
                        "Electricity" => "Tiền điện",
                        "Water" => "Tiền nước",
                        "Internet" => "Mạng Internet",
                        "Garbage" => "Rác & Dịch vụ",
                        "Add" => "Phụ thu",
                        "Reduce" => "Giảm trừ",
                        _ => item.ItemType
                    };
                    worksheet.Cells[row, 2].Value = item.Description;
                    worksheet.Cells[row, 3].Value = item.Amount;
                    worksheet.Cells[row, 3].Style.Numberformat.Format = "#,##0";
                    row++;
                }

                worksheet.Cells[row, 1].Value = "TỔNG CỘNG:";
                worksheet.Cells[row, 1].Style.Font.Bold = true;
                worksheet.Cells[row, 3].Value = invoice.TotalAmount;
                worksheet.Cells[row, 3].Style.Font.Bold = true;
                worksheet.Cells[row, 3].Style.Numberformat.Format = "#,##0";

                worksheet.Cells[row + 2, 1].Value = "Trạng thái hóa đơn:";
                worksheet.Cells[row + 2, 2].Value = invoice.Status switch
                {
                    InvoiceStatus.Paid => "Đã thanh toán",
                    InvoiceStatus.Unpaid => "Chưa thanh toán",
                    InvoiceStatus.Overdue => "Quá hạn",
                    InvoiceStatus.Pending => "Chờ xử lý",
                    InvoiceStatus.Cancelled => "Đã hủy",
                    _ => "Chưa thanh toán"
                };
                worksheet.Cells[row + 2, 2].Style.Font.Bold = true;

                worksheet.Cells.AutoFitColumns();

                return await Task.FromResult(package.GetAsByteArray());
            }
        }
    }
}
