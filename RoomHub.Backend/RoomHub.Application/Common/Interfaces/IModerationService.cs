using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Enums;

namespace Application.Common.Interfaces
{
    public class ModerationCheck
    {
        public string Stage { get; set; } = "";
        public bool Passed { get; set; }
        public int Score { get; set; }
        public string Summary { get; set; } = "";
    }

    public class ModerationResult
    {
        public ModerationStatus Status { get; set; }
        public string Reason { get; set; } = "";
        public string UserMessage { get; set; } = "";
        public int QualityScore { get; set; } = 100;
        public string AutoFormattedText { get; set; } = "";
        public List<string> ExtractedAmenities { get; set; } = new();
        public List<ModerationCheck> Checks { get; set; } = new();
    }

    public interface IModerationService
    {
        Task<ModerationResult> ModerateListingAsync(string title, string description, List<string> imageUrls, decimal price, decimal area);
        Task<ModerationResult> ModerateContentAsync(string title, string description, decimal price, decimal area);
    }
}
