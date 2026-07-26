using System.Drawing;
using Application.Common.DTOs.Reports;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace Application.Services
{
    /// <summary>
    /// Dựng workbook 3 sheet (Doanh thu / Tỉ lệ lấp đầy / Công nợ) bằng EPPlus.
    /// Theo đúng cách dùng EPPlus sẵn có ở InvoiceService.GenerateExcelBytesAsync.
    /// </summary>
    internal static class OwnerReportExcelExporter
    {
        private const string MoneyFormat = "#,##0";
        private const string DateFormat = "dd/MM/yyyy";

        public static byte[] Build(RevenueReportDto revenue, OccupancyReportDto occupancy, DebtReportDto debt)
        {
            ExcelPackage.License.SetNonCommercialOrganization("RoomHub");
            using var package = new ExcelPackage();

            BuildRevenueSheet(package, revenue);
            BuildOccupancySheet(package, occupancy);
            BuildDebtSheet(package, debt);

            return package.GetAsByteArray();
        }

        // ==========================================
        // Sheet 1 — Doanh thu
        // ==========================================
        private static void BuildRevenueSheet(ExcelPackage package, RevenueReportDto report)
        {
            var sheet = package.Workbook.Worksheets.Add("Doanh thu");
            ApplyBaseFont(sheet);

            var scope = report.BuildingName ?? "Tất cả tài sản";
            WriteTitle(sheet, "A1:E1", "BÁO CÁO DOANH THU");
            sheet.Cells["A2"].Value = $"Phạm vi: {scope}  |  Kỳ báo cáo: {report.Period}";
            sheet.Cells["A2:E2"].Merge = true;
            sheet.Cells["A2"].Style.Font.Italic = true;

            WriteHeader(sheet, 4, "Tháng", "Số hóa đơn", "Đã xuất hóa đơn", "Đã thu", "Còn phải thu");

            var row = 5;
            foreach (var item in report.Rows)
            {
                sheet.Cells[row, 1].Value = item.Period;
                sheet.Cells[row, 2].Value = item.InvoiceCount;
                sheet.Cells[row, 3].Value = item.Invoiced;
                sheet.Cells[row, 4].Value = item.Collected;
                sheet.Cells[row, 5].Value = item.Outstanding;
                row++;
            }

            sheet.Cells[row, 1].Value = "TỔNG CỘNG";
            sheet.Cells[row, 2].Value = report.TotalInvoiceCount;
            sheet.Cells[row, 3].Value = report.TotalInvoiced;
            sheet.Cells[row, 4].Value = report.TotalCollected;
            sheet.Cells[row, 5].Value = report.TotalOutstanding;
            WriteTotalRow(sheet, row, 5);

            sheet.Cells[5, 3, row, 5].Style.Numberformat.Format = MoneyFormat;
            AutoFit(sheet, 5);
        }

        // ==========================================
        // Sheet 2 — Tỉ lệ lấp đầy
        // ==========================================
        private static void BuildOccupancySheet(ExcelPackage package, OccupancyReportDto report)
        {
            var sheet = package.Workbook.Worksheets.Add("Ti le lap day");
            ApplyBaseFont(sheet);

            WriteTitle(sheet, "A1:G1", "BÁO CÁO TỈ LỆ LẤP ĐẦY");
            WriteHeader(sheet, 3, "Tài sản", "Địa chỉ", "Tổng phòng", "Đang ở", "Đã cọc", "Còn trống", "Tỉ lệ lấp đầy (%)");

            var row = 4;
            foreach (var item in report.Rows)
            {
                sheet.Cells[row, 1].Value = item.BuildingName;
                sheet.Cells[row, 2].Value = item.Address;
                sheet.Cells[row, 3].Value = item.TotalRooms;
                sheet.Cells[row, 4].Value = item.OccupiedRooms;
                sheet.Cells[row, 5].Value = item.DepositedRooms;
                sheet.Cells[row, 6].Value = item.AvailableRooms;
                sheet.Cells[row, 7].Value = item.OccupancyRate;
                row++;
            }

            sheet.Cells[row, 1].Value = "TỔNG CỘNG";
            sheet.Cells[row, 3].Value = report.TotalRooms;
            sheet.Cells[row, 4].Value = report.TotalOccupiedRooms;
            sheet.Cells[row, 5].Value = report.TotalDepositedRooms;
            sheet.Cells[row, 6].Value = report.TotalAvailableRooms;
            sheet.Cells[row, 7].Value = report.OverallOccupancyRate;
            WriteTotalRow(sheet, row, 7);

            AutoFit(sheet, 7);
        }

        // ==========================================
        // Sheet 3 — Công nợ
        // ==========================================
        private static void BuildDebtSheet(ExcelPackage package, DebtReportDto report)
        {
            var sheet = package.Workbook.Worksheets.Add("Cong no");
            ApplyBaseFont(sheet);

            WriteTitle(sheet, "A1:H1", "BÁO CÁO CÔNG NỢ");
            sheet.Cells["A2"].Value =
                $"Tổng công nợ: {report.TotalDebt:#,##0} đ  |  Đã quá hạn: {report.OverdueDebt:#,##0} đ ({report.OverdueInvoices} hóa đơn)";
            sheet.Cells["A2:H2"].Merge = true;
            sheet.Cells["A2"].Style.Font.Italic = true;

            WriteHeader(sheet, 4, "Mã HĐ", "Tài sản", "Phòng", "Khách thuê", "Số điện thoại", "Số tiền", "Hạn đóng", "Số ngày quá hạn");

            var row = 5;
            foreach (var item in report.Rows)
            {
                sheet.Cells[row, 1].Value = item.InvoiceId;
                sheet.Cells[row, 2].Value = item.BuildingName;
                sheet.Cells[row, 3].Value = item.RoomNumber;
                sheet.Cells[row, 4].Value = item.TenantName;
                sheet.Cells[row, 5].Value = item.TenantPhone ?? "";
                sheet.Cells[row, 6].Value = item.Amount;
                sheet.Cells[row, 7].Value = item.DueDate;
                sheet.Cells[row, 7].Style.Numberformat.Format = DateFormat;
                sheet.Cells[row, 8].Value = item.DaysOverdue;

                if (item.DaysOverdue > 0)
                    sheet.Cells[row, 8].Style.Font.Color.SetColor(Color.Firebrick);

                row++;
            }

            sheet.Cells[row, 1].Value = "TỔNG CỘNG";
            sheet.Cells[row, 6].Value = report.TotalDebt;
            WriteTotalRow(sheet, row, 8);

            sheet.Cells[5, 6, row, 6].Style.Numberformat.Format = MoneyFormat;
            AutoFit(sheet, 8);
        }

        // ==========================================
        // Định dạng dùng chung
        // ==========================================
        private static void ApplyBaseFont(ExcelWorksheet sheet)
        {
            sheet.Cells.Style.Font.Name = "Arial";
            sheet.Cells.Style.Font.Size = 11;
        }

        private static void WriteTitle(ExcelWorksheet sheet, string range, string title)
        {
            sheet.Cells[range].Merge = true;
            var cell = sheet.Cells[range.Split(':')[0]];
            cell.Value = title;
            cell.Style.Font.Size = 16;
            cell.Style.Font.Bold = true;
            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }

        private static void WriteHeader(ExcelWorksheet sheet, int row, params string[] headers)
        {
            for (var i = 0; i < headers.Length; i++)
                sheet.Cells[row, i + 1].Value = headers[i];

            var header = sheet.Cells[row, 1, row, headers.Length];
            header.Style.Font.Bold = true;
            header.Style.Fill.PatternType = ExcelFillStyle.Solid;
            header.Style.Fill.BackgroundColor.SetColor(Color.LightSkyBlue);
        }

        private static void WriteTotalRow(ExcelWorksheet sheet, int row, int columns)
        {
            var total = sheet.Cells[row, 1, row, columns];
            total.Style.Font.Bold = true;
            total.Style.Fill.PatternType = ExcelFillStyle.Solid;
            total.Style.Fill.BackgroundColor.SetColor(Color.Gainsboro);
        }

        private static void AutoFit(ExcelWorksheet sheet, int columns)
        {
            sheet.Cells[1, 1, sheet.Dimension?.End.Row ?? 1, columns].AutoFitColumns(10, 40);
        }
    }
}
