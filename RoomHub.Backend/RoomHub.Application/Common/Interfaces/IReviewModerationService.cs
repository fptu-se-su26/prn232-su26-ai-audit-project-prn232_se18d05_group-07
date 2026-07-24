using Application.Common.DTOs.Reviews;
namespace Application.Common.Interfaces;
public interface IReviewModerationService
{
    Task<PagedReviewReportsDto> GetReportsAsync(int page, int pageSize, string? status);
    Task<AdminReviewDto?> GetReviewAsync(int id);
    Task ModerateAsync(int id, string adminId, string action, string? reason, string? ip);
    Task DismissAsync(int reportId, string adminId, string? note, string? ip);
}
