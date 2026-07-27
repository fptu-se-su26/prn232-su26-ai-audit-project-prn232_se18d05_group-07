using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Infrastructure.Services;

/// <summary>
/// Kết xuất hợp đồng thuê ra PDF bằng QuestPDF (giấy phép Community).
/// Thuần đọc — không bao giờ ghi vào Contract.
/// </summary>
public sealed class ContractPdfService : IContractPdfService
{
    private const string FontFamily = "Arial";
    private static readonly TimeSpan SignatureFetchTimeout = TimeSpan.FromSeconds(5);

    private static int _licenseConfigured;

    private readonly ApplicationDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ContractPdfService> _logger;

    public ContractPdfService(
        ApplicationDbContext db,
        IHttpClientFactory httpClientFactory,
        ILogger<ContractPdfService> logger)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _logger = logger;

        if (Interlocked.Exchange(ref _licenseConfigured, 1) == 0)
            QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<(byte[] Content, string FileName)> GenerateForTenantAsync(
        string tenantId, CancellationToken ct = default)
    {
        var contractId = await _db.Contracts.AsNoTracking()
            .Where(c => !c.IsDeleted
                     && c.TenantId == tenantId
                     && (c.Status == ContractStatus.Active || c.Status == ContractStatus.Pending))
            .OrderByDescending(c => c.StartDate)
            .Select(c => (int?)c.Id)
            .FirstOrDefaultAsync(ct)
            ?? throw new KeyNotFoundException("Bạn chưa có hợp đồng thuê nào.");

        return await GenerateAsync(contractId, tenantId, ct);
    }

    public async Task<(byte[] Content, string FileName)> GenerateForRoomAsync(
        int roomId, string ownerId, CancellationToken ct = default)
    {
        var contractId = await _db.Contracts.AsNoTracking()
            .Where(c => !c.IsDeleted
                     && c.RoomId == roomId
                     && c.OwnerId == ownerId
                     && (c.Status == ContractStatus.Active || c.Status == ContractStatus.Pending))
            .OrderByDescending(c => c.StartDate)
            .Select(c => (int?)c.Id)
            .FirstOrDefaultAsync(ct)
            ?? throw new KeyNotFoundException("Phòng này chưa có hợp đồng đang hiệu lực.");

        return await GenerateAsync(contractId, ownerId, ct);
    }

    public async Task<(byte[] Content, string FileName)> GenerateAsync(
        int contractId, string userId, CancellationToken ct = default)
    {
        var contract = await _db.Contracts
            .AsNoTracking()
            .Include(c => c.Room).ThenInclude(r => r.Floor).ThenInclude(f => f.Building)
            .Include(c => c.Tenant)
            .SingleOrDefaultAsync(c => c.Id == contractId && !c.IsDeleted, ct)
            ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng.");

        if (contract.OwnerId != userId && contract.TenantId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền xem hợp đồng này.");

        var owner = await _db.Users.AsNoTracking()
            .SingleOrDefaultAsync(u => u.Id == contract.OwnerId, ct);

        var signature = await TryFetchSignatureAsync(contract.SignaturePath, ct);
        var bytes = Compose(contract, owner, signature).GeneratePdf();

        var roomNumber = contract.Room?.RoomNumber ?? contract.RoomId.ToString();
        return (bytes, $"HopDong_Phong_{roomNumber}_{contract.Id}.pdf");
    }

    // ==========================================
    // Bố cục tài liệu
    // ==========================================
    private static IDocument Compose(Contract contract, ApplicationUser? owner, byte[]? signature) =>
        Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily(FontFamily));

                page.Header().Element(header => ComposeHeader(header, contract));
                page.Content().Element(content => ComposeBody(content, contract, owner, signature));
                page.Footer().AlignCenter().Text(text =>
                {
                    text.DefaultTextStyle(x => x.FontSize(9).FontColor(Colors.Grey.Medium));
                    text.Span("Trang ");
                    text.CurrentPageNumber();
                    text.Span(" / ");
                    text.TotalPages();
                });
            });
        });

    private static void ComposeHeader(IContainer container, Contract contract) =>
        container.Column(column =>
        {
            column.Item().AlignCenter().Text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM")
                .Bold().FontSize(12);
            column.Item().AlignCenter().Text("Độc lập - Tự do - Hạnh phúc")
                .Bold().FontSize(11);
            column.Item().AlignCenter().PaddingTop(2).Text("-----------------o0o-----------------")
                .FontSize(9).FontColor(Colors.Grey.Medium);

            column.Item().PaddingTop(16).AlignCenter().Text("HỢP ĐỒNG THUÊ PHÒNG TRỌ")
                .Bold().FontSize(16);
            column.Item().AlignCenter().PaddingBottom(12)
                .Text($"Số: {contract.Id:D6}/HĐTP — Ngày lập: {contract.CreatedAt:dd/MM/yyyy}")
                .FontSize(10).FontColor(Colors.Grey.Darken1);
        });

    private static void ComposeBody(IContainer container, Contract contract, ApplicationUser? owner, byte[]? signature)
    {
        var room = contract.Room;
        var building = room?.Floor?.Building;

        container.Column(column =>
        {
            column.Spacing(10);

            // --- Hai bên ---
            column.Item().Text("BÊN CHO THUÊ (Bên A)").Bold();
            column.Item().Element(c => Fields(c,
                ("Họ và tên", owner?.FullName ?? "—"),
                ("Số điện thoại", owner?.PhoneNumber ?? "—"),
                ("Email", owner?.Email ?? "—")));

            column.Item().PaddingTop(6).Text("BÊN THUÊ (Bên B)").Bold();
            column.Item().Element(c => Fields(c,
                ("Họ và tên", contract.TemporaryTenantName ?? contract.Tenant?.FullName ?? "—"),
                ("Số điện thoại", contract.TemporaryTenantPhone ?? contract.Tenant?.PhoneNumber ?? "—"),
                ("Email", contract.TemporaryTenantEmail ?? contract.Tenant?.Email ?? "—")));

            // --- Điều 1 ---
            column.Item().PaddingTop(8).Text("ĐIỀU 1: THÔNG TIN PHÒNG CHO THUÊ").Bold();
            column.Item().Element(c => Fields(c,
                ("Tài sản", building?.Name ?? "—"),
                ("Địa chỉ", building == null
                    ? "—"
                    : $"{building.Address}, {building.Ward}, {building.District}, {building.City}"),
                ("Số phòng", room?.RoomNumber ?? "—"),
                ("Diện tích", room?.SurfaceArea is { } area ? $"{area:0.##} m²" : "—"),
                ("Sức chứa tối đa", room == null ? "—" : $"{room.MaxCapacity} người")));

            // --- Điều 2 ---
            column.Item().PaddingTop(8).Text("ĐIỀU 2: THỜI HẠN THUÊ").Bold();
            column.Item().Element(c => Fields(c,
                ("Ngày bắt đầu", contract.StartDate.ToString("dd/MM/yyyy")),
                ("Ngày kết thúc", contract.EndDate.ToString("dd/MM/yyyy")),
                ("Thời hạn", $"{Math.Max(0, (int)Math.Round((contract.EndDate - contract.StartDate).TotalDays / 30d))} tháng")));

            // --- Điều 3 ---
            column.Item().PaddingTop(8).Text("ĐIỀU 3: GIÁ THUÊ VÀ TIỀN ĐẶT CỌC").Bold();
            column.Item().Element(c => Fields(c,
                ("Giá thuê hàng tháng", Money(contract.RentAmount)),
                ("Tiền đặt cọc", Money(contract.DepositAmount))));

            // --- Điều 4 ---
            column.Item().PaddingTop(8).Text("ĐIỀU 4: CHI PHÍ DỊCH VỤ").Bold();
            column.Item().Element(c => Fields(c,
                ("Tiền điện", UnitPrice(room?.ElectricityPrice ?? building?.ElectricityPrice, "kWh")),
                ("Tiền nước", UnitPrice(room?.WaterPrice ?? building?.WaterPrice,
                    (room?.WaterBillingType ?? building?.WaterBillingType) == "PerPerson" ? "người/tháng" : "m³")),
                ("Internet", UnitPrice(room?.InternetPrice ?? building?.InternetPrice, "tháng")),
                ("Rác & dịch vụ", UnitPrice(room?.GarbagePrice ?? building?.GarbagePrice, "tháng"))));

            // --- Điều 5 ---
            column.Item().PaddingTop(8).Text("ĐIỀU 5: ĐIỀU KHOẢN KHÁC").Bold();
            column.Item().Text(string.IsNullOrWhiteSpace(contract.Terms)
                ? "Hai bên thực hiện theo thỏa thuận và quy định pháp luật hiện hành."
                : contract.Terms).Justify();

            // --- Chữ ký ---
            column.Item().PaddingTop(24).Row(row =>
            {
                row.RelativeItem().Column(side =>
                {
                    side.Item().AlignCenter().Text("BÊN CHO THUÊ (Bên A)").Bold().FontSize(10);
                    side.Item().AlignCenter().Text("(Ký, ghi rõ họ tên)").FontSize(9).Italic();
                    side.Item().Height(80);
                    side.Item().AlignCenter().Text(owner?.FullName ?? "").FontSize(10);
                });

                row.RelativeItem().Column(side =>
                {
                    side.Item().AlignCenter().Text("BÊN THUÊ (Bên B)").Bold().FontSize(10);
                    side.Item().AlignCenter().Text("(Ký, ghi rõ họ tên)").FontSize(9).Italic();

                    if (signature != null)
                        side.Item().Height(80).AlignCenter().AlignMiddle().Image(signature).FitArea();
                    else if (!string.IsNullOrWhiteSpace(contract.SignaturePath))
                        side.Item().Height(80).AlignCenter().AlignMiddle()
                            .Text("(Đã ký điện tử)").FontSize(9).Italic().FontColor(Colors.Green.Darken1);
                    else
                        side.Item().Height(80);

                    side.Item().AlignCenter()
                        .Text(contract.TemporaryTenantName ?? contract.Tenant?.FullName ?? "").FontSize(10);
                });
            });

            column.Item().PaddingTop(14).AlignRight()
                .Text($"Xuất từ hệ thống RoomHub ngày {DateTime.Now:dd/MM/yyyy HH:mm}")
                .FontSize(8).Italic().FontColor(Colors.Grey.Medium);
        });
    }

    /// <summary>Danh sách "Nhãn: giá trị" căn cột đều nhau.</summary>
    private static void Fields(IContainer container, params (string Label, string Value)[] fields) =>
        container.Column(column =>
        {
            column.Spacing(3);
            foreach (var (label, value) in fields)
            {
                column.Item().Row(row =>
                {
                    row.ConstantItem(150).Text($"{label}:").FontColor(Colors.Grey.Darken2);
                    row.RelativeItem().Text(value);
                });
            }
        });

    // ==========================================
    // Helpers
    // ==========================================
    private static string Money(decimal value) => $"{value:#,##0} đ";

    private static string UnitPrice(decimal? value, string unit) =>
        value is null or 0 ? "Miễn phí / thỏa thuận" : $"{value:#,##0} đ / {unit}";

    /// <summary>
    /// Tải ảnh chữ ký về để nhúng. Chữ ký lưu dạng URL (Cloudinary hoặc /uploads),
    /// nên lỗi mạng là chuyện có thể xảy ra — khi đó vẫn xuất PDF, chỉ thay bằng dòng chữ.
    /// </summary>
    private async Task<byte[]?> TryFetchSignatureAsync(string? url, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return null;
        if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) return null;

        try
        {
            using var client = _httpClientFactory.CreateClient();
            client.Timeout = SignatureFetchTimeout;
            return await client.GetByteArrayAsync(uri, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Không tải được ảnh chữ ký cho hợp đồng, xuất PDF không kèm ảnh.");
            return null;
        }
    }
}
