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

                    var waterBillingType = room.WaterBillingType ?? building.WaterBillingType;
                    bool isWaterFixed = (waterBillingType == "PerPerson");

                    var elecCost = elecUsage > 0 ? elecUsage * elecPrice : 0;
                    var waterCost = isWaterFixed 
                        ? (waterPrice * room.MaxCapacity) 
                        : (waterUsage > 0 ? waterUsage * waterPrice : 0);

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
                        new InvoiceItem { InvoiceId = invoice.Id, ItemType = "Water", Amount = waterCost, Description = isWaterFixed ? $"Tiền nước (Cố định theo đầu người: {room.MaxCapacity} người x {waterPrice:N0}đ)" : $"Tiền nước (Chỉ số: {readingInput.OldWater} -> {readingInput.NewWater}, Sử dụng: {waterUsage} m³)" },
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
                        invoice.InvoiceItems.Add(item);
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

        private async Task<byte[]> GenerateExcelBytesAsync(Invoice invoice)
        {
            ExcelPackage.License.SetNonCommercialOrganization("RoomHub");
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
                worksheet.Cells["A7:C7"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells["A7:C7"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightSkyBlue);

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

        public async Task<byte[]> ExportInvoiceToExcelAsync(int invoiceId, string ownerId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null || invoice.Contract.OwnerId != ownerId)
                throw new Exception("Không tìm thấy hóa đơn này hoặc bạn không có quyền truy cập.");

            return await GenerateExcelBytesAsync(invoice);
        }

        public async Task<List<InvoiceHeaderDto>> GetTenantInvoicesAsync(string tenantId)
        {
            var invoices = await _invoiceRepository.GetInvoicesByTenantAsync(tenantId);

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

        public async Task<InvoiceDetailDto?> GetTenantInvoiceDetailAsync(int invoiceId, string tenantId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null || (invoice.Contract.TenantId != tenantId && invoice.Contract.TemporaryTenantEmail != tenantId))
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

        public async Task<bool> TenantPayInvoiceAsync(int invoiceId, RecordPaymentRequest request, string tenantId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null || (invoice.Contract.TenantId != tenantId && invoice.Contract.TemporaryTenantEmail != tenantId))
                return false;

            if (invoice.Status == InvoiceStatus.Paid)
                return true;

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var payment = new Payment
                {
                    InvoiceId = invoice.Id,
                    Amount = request.Amount,
                    PaymentMethod = request.PaymentMethod,
                    TransactionId = request.TransactionId ?? ("MOCK-TXN-" + DateTime.UtcNow.Ticks),
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

        public async Task<byte[]> ExportTenantInvoiceToExcelAsync(int invoiceId, string tenantId)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
            if (invoice == null || (invoice.Contract.TenantId != tenantId && invoice.Contract.TemporaryTenantEmail != tenantId))
                throw new Exception("Không tìm thấy hóa đơn này hoặc bạn không có quyền truy cập.");

            return await GenerateExcelBytesAsync(invoice);
        }

        public async Task<byte[]> ExportBatchInvoicesToExcelAsync(int buildingId, int month, int year, string ownerId)
        {
            var invoices = await _invoiceRepository.GetInvoicesByBuildingAndMonthAsync(buildingId, month, year, ownerId);
            if (invoices == null || invoices.Count == 0)
                throw new Exception("Không tìm thấy dữ liệu hóa đơn nào trong tháng/năm yêu cầu.");

            var buildingName = invoices.First().Contract.Room.Floor.Building.Name;

            ExcelPackage.License.SetNonCommercialOrganization("RoomHub");
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("BaoCaoTongHop");

                worksheet.Cells.Style.Font.Name = "Arial";
                worksheet.Cells.Style.Font.Size = 11;

                // Title
                worksheet.Cells["A1:L1"].Merge = true;
                worksheet.Cells["A1"].Value = $"BÁO CÁO TỔNG HỢP HÓA ĐƠN DỊCH VỤ - THÁNG {month:D2}/{year}";
                worksheet.Cells["A1"].Style.Font.Size = 15;
                worksheet.Cells["A1"].Style.Font.Bold = true;
                worksheet.Cells["A1"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

                worksheet.Cells["A2:L2"].Merge = true;
                worksheet.Cells["A2"].Value = $"Tòa nhà: {buildingName}";
                worksheet.Cells["A2"].Style.Font.Size = 12;
                worksheet.Cells["A2"].Style.Font.Italic = true;
                worksheet.Cells["A2"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

                // Headers
                string[] headers = {
                    "STT", "Phòng trọ", "Khách thuê", "Tiền phòng (đ)",
                    "Tiền điện (đ)", "Tiền nước (đ)", "Tiền mạng (đ)",
                    "Tiền rác (đ)", "Phụ thu (đ)", "Giảm trừ (đ)",
                    "Tổng cộng (đ)", "Trạng thái"
                };

                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[4, i + 1].Value = headers[i];
                }

                worksheet.Cells["A4:L4"].Style.Font.Bold = true;
                worksheet.Cells["A4:L4"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells["A4:L4"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightSkyBlue);
                worksheet.Cells["A4:L4"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

                int row = 5;
                int stt = 1;
                foreach (var inv in invoices)
                {
                    worksheet.Cells[row, 1].Value = stt++;
                    worksheet.Cells[row, 2].Value = $"Phòng {inv.Contract.Room.RoomNumber}";
                    worksheet.Cells[row, 3].Value = inv.Contract.TemporaryTenantName ?? inv.Contract.Tenant?.FullName ?? "Chưa rõ";

                    var rentItem = inv.InvoiceItems.FirstOrDefault(i => i.ItemType == "Rent");
                    var elecItem = inv.InvoiceItems.FirstOrDefault(i => i.ItemType == "Electricity");
                    var waterItem = inv.InvoiceItems.FirstOrDefault(i => i.ItemType == "Water");
                    var netItem = inv.InvoiceItems.FirstOrDefault(i => i.ItemType == "Internet");
                    var garbageItem = inv.InvoiceItems.FirstOrDefault(i => i.ItemType == "Garbage");
                    var addItems = inv.InvoiceItems.Where(i => i.ItemType == "Add").Sum(i => i.Amount);
                    var reduceItems = inv.InvoiceItems.Where(i => i.ItemType == "Reduce").Sum(i => i.Amount);

                    worksheet.Cells[row, 4].Value = rentItem?.Amount ?? 0;
                    worksheet.Cells[row, 5].Value = elecItem?.Amount ?? 0;
                    worksheet.Cells[row, 6].Value = waterItem?.Amount ?? 0;
                    worksheet.Cells[row, 7].Value = netItem?.Amount ?? 0;
                    worksheet.Cells[row, 8].Value = garbageItem?.Amount ?? 0;
                    worksheet.Cells[row, 9].Value = addItems;
                    worksheet.Cells[row, 10].Value = reduceItems;
                    worksheet.Cells[row, 11].Value = inv.TotalAmount;
                    worksheet.Cells[row, 12].Value = inv.Status switch
                    {
                        InvoiceStatus.Paid => "Đã thanh toán",
                        InvoiceStatus.Unpaid => "Chưa thanh toán",
                        InvoiceStatus.Overdue => "Quá hạn",
                        InvoiceStatus.Pending => "Chờ xử lý",
                        InvoiceStatus.Cancelled => "Đã hủy",
                        _ => "Chưa thanh toán"
                    };

                    // Format numbers
                    for (int c = 4; c <= 11; c++)
                    {
                        worksheet.Cells[row, c].Style.Numberformat.Format = "#,##0";
                    }

                    row++;
                }

                // Dòng tổng cộng ở cuối
                worksheet.Cells[row, 3].Value = "TỔNG CỘNG:";
                worksheet.Cells[row, 3].Style.Font.Bold = true;

                for (int c = 4; c <= 11; c++)
                {
                    string colLetter = ((char)('A' + c - 1)).ToString();
                    worksheet.Cells[row, c].Formula = $"SUM({colLetter}5:{colLetter}{row - 1})";
                    worksheet.Cells[row, c].Style.Font.Bold = true;
                    worksheet.Cells[row, c].Style.Numberformat.Format = "#,##0";
                }

                worksheet.Cells.AutoFitColumns();

                return await Task.FromResult(package.GetAsByteArray());
            }
        }
    }
}
