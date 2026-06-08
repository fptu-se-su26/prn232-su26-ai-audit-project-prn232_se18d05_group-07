using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.Interfaces;
using Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    public class ModerationManager : IModerationService
    {
        private readonly GroqModerationService _groqService;
        private readonly GeminiModerationService _geminiService;
        private readonly ILogger<ModerationManager> _logger;

        public ModerationManager(
            GroqModerationService groqService,
            GeminiModerationService geminiService,
            ILogger<ModerationManager> logger)
        {
            _groqService = groqService;
            _geminiService = geminiService;
            _logger = logger;
        }

        public async Task<ModerationResult> ModerateContentAsync(
            string title, string description, decimal price, decimal area)
        {
            var ruleCheck = ListingModerationRules.ValidateContentData(title, description, price, area);
            if (ruleCheck != null)
            {
                ruleCheck.UserMessage = ModerationMessageCatalog.ForRejected(ruleCheck.Reason);
                return ruleCheck;
            }

            var heuristicCheck = ListingContentHeuristics.Validate(title, description);
            if (heuristicCheck != null)
                return heuristicCheck;

            var textResult = await _groqService.ModerateTextAsync(title, description, price, area);
            if (textResult.Status == ModerationStatus.Rejected)
            {
                textResult.UserMessage = ModerationMessageCatalog.ForRejected(textResult.Reason);
                return textResult;
            }

            if (textResult.Status == ModerationStatus.Flagged)
            {
                _logger.LogWarning("Groq text unavailable for step validation, rules passed — skipping AI.");
                return new ModerationResult
                {
                    Status = ModerationStatus.Approved,
                    Reason = "Đã qua kiểm tra quy tắc. AI sẽ kiểm tra lại khi đăng tin.",
                    UserMessage = "Nội dung đạt yêu cầu cơ bản. AI sẽ kiểm tra đầy đủ khi bạn đăng tin.",
                    QualityScore = 70,
                    AutoFormattedText = description,
                    ExtractedAmenities = new List<string>()
                };
            }

            return new ModerationResult
            {
                Status = ModerationStatus.Approved,
                Reason = "Nội dung phù hợp",
                UserMessage = "Nội dung tin đăng hợp lệ.",
                QualityScore = textResult.QualityScore,
                AutoFormattedText = textResult.AutoFormattedText,
                ExtractedAmenities = textResult.ExtractedAmenities
            };
        }

        public async Task<ModerationResult> ModerateListingAsync(
            string title, string description, List<string> imageUrls, decimal price, decimal area)
        {
            _logger.LogInformation(
                "Moderation pipeline started | title={Title} | price={Price} | area={Area} | images={ImageCount}",
                title, price, area, imageUrls?.Count ?? 0);

            var checks = new List<ModerationCheck>();

            // ── Giai đoạn 1: Kiểm tra quy tắc nghiệp vụ (deterministic) ──
            var ruleResult = ListingModerationRules.ValidateListingData(title, description, price, area, imageUrls);
            if (ruleResult != null)
            {
                checks.Add(new ModerationCheck
                {
                    Stage = "Dữ liệu",
                    Passed = false,
                    Score = ruleResult.QualityScore,
                    Summary = ruleResult.Reason
                });
                return Finalize(ruleResult, checks, willPublish: false);
            }

            checks.Add(new ModerationCheck
            {
                Stage = "Dữ liệu",
                Passed = true,
                Score = 100,
                Summary = "Giá, diện tích, tiêu đề và ảnh hợp lệ"
            });

            // ── Giai đoạn 1b: Heuristic nội dung (deterministic, 0ms) ──
            var heuristicResult = ListingContentHeuristics.Validate(title, description);
            if (heuristicResult != null)
            {
                checks.Add(new ModerationCheck
                {
                    Stage = "Nội dung",
                    Passed = false,
                    Score = heuristicResult.QualityScore,
                    Summary = heuristicResult.Reason
                });
                return Finalize(heuristicResult, checks, willPublish: false);
            }

            // ── Giai đoạn 2: Phân tích nội dung văn bản (Groq LLM) ──
            var textResult = await _groqService.ModerateTextAsync(title, description, price, area);
            checks.Add(new ModerationCheck
            {
                Stage = "Nội dung",
                Passed = textResult.Status != ModerationStatus.Rejected,
                Score = textResult.QualityScore,
                Summary = textResult.Status == ModerationStatus.Rejected
                    ? textResult.Reason
                    : "Nội dung phù hợp tiêu chuẩn đăng tin"
            });

            if (textResult.Status == ModerationStatus.Rejected)
            {
                return Finalize(textResult, checks, willPublish: false);
            }

            if (imageUrls == null || imageUrls.Count == 0)
            {
                return Finalize(textResult, checks, willPublish: true);
            }

            // ── Giai đoạn 3: Phân tích hình ảnh (Gemini → Groq Vision fallback) ──
            var imageResult = await _geminiService.ModerateImagesAsync(imageUrls);

            if (imageResult.Status == ModerationStatus.Approved)
            {
                checks.Add(new ModerationCheck
                {
                    Stage = "Hình ảnh",
                    Passed = true,
                    Score = 100,
                    Summary = "Ảnh phù hợp tin cho thuê (Gemini)"
                });
                return Finalize(textResult, checks, willPublish: true);
            }

            if (!IsTechnicalFailure(imageResult))
            {
                checks.Add(new ModerationCheck
                {
                    Stage = "Hình ảnh",
                    Passed = false,
                    Score = 0,
                    Summary = imageResult.Reason
                });
                return Finalize(MergeImageFailure(textResult, imageResult), checks, willPublish: false);
            }

            _logger.LogWarning("Gemini image stage unavailable, trying Groq Vision fallback.");
            var groqImageResult = await _groqService.ModerateImagesAsync(imageUrls);

            if (groqImageResult.Status == ModerationStatus.Approved)
            {
                checks.Add(new ModerationCheck
                {
                    Stage = "Hình ảnh",
                    Passed = true,
                    Score = 90,
                    Summary = "Ảnh phù hợp tin cho thuê (Groq Vision)"
                });
                return Finalize(textResult, checks, willPublish: true);
            }

            if (!IsTechnicalFailure(groqImageResult))
            {
                checks.Add(new ModerationCheck
                {
                    Stage = "Hình ảnh",
                    Passed = false,
                    Score = 0,
                    Summary = groqImageResult.Reason
                });
                return Finalize(MergeImageFailure(textResult, groqImageResult), checks, willPublish: false);
            }

            // Cả hai provider ảnh đều lỗi kỹ thuật → chuyển Admin, không hiển thị lỗi API
            _logger.LogError(
                "All image providers unavailable. Gemini: {GeminiReason} | Groq: {GroqReason}",
                imageResult.Reason, groqImageResult.Reason);

            checks.Add(new ModerationCheck
            {
                Stage = "Hình ảnh",
                Passed = false,
                Score = 50,
                Summary = "Chưa xác minh được ảnh — chuyển Admin"
            });

            var flagged = new ModerationResult
            {
                Status = ModerationStatus.Flagged,
                Reason = ModerationMessageCatalog.ForImageUnavailable(),
                QualityScore = ComputeWeightedScore(checks),
                AutoFormattedText = textResult.AutoFormattedText,
                ExtractedAmenities = textResult.ExtractedAmenities
            };
            return Finalize(flagged, checks, willPublish: false);
        }

        private ModerationResult Finalize(ModerationResult result, List<ModerationCheck> checks, bool willPublish)
        {
            result.Checks = checks;
            result.QualityScore = ComputeWeightedScore(checks, result.QualityScore);

            result.UserMessage = result.Status switch
            {
                ModerationStatus.Approved => ModerationMessageCatalog.ForApproved(willPublish),
                ModerationStatus.Rejected => ModerationMessageCatalog.ForRejected(
                    checks.LastOrDefault(c => !c.Passed)?.Summary ?? result.Reason),
                ModerationStatus.Flagged => ModerationMessageCatalog.ForFlagged(result.Reason),
                _ => "Tin đăng đang chờ kiểm duyệt."
            };

            result.Reason = ModerationMessageCatalog.BuildAuditReport(checks, result.Status, result.QualityScore);

            _logger.LogInformation(
                "Moderation pipeline completed | status={Status} | score={Score}",
                result.Status, result.QualityScore);

            return result;
        }

        private static int ComputeWeightedScore(List<ModerationCheck> checks, int? aiScore = null)
        {
            if (checks.Count == 0) return aiScore ?? 0;

            var data = checks.FirstOrDefault(c => c.Stage == "Dữ liệu")?.Score ?? 0;
            var text = checks.FirstOrDefault(c => c.Stage == "Nội dung")?.Score ?? (aiScore ?? 0);
            var image = checks.FirstOrDefault(c => c.Stage == "Hình ảnh")?.Score ?? 100;

            if (!checks.Any(c => c.Stage == "Hình ảnh"))
                return (int)(data * 0.2 + text * 0.8);

            return (int)(data * 0.15 + text * 0.45 + image * 0.40);
        }

        private static bool IsTechnicalFailure(ModerationResult result) =>
            result.Status == ModerationStatus.Flagged
            && (result.Reason.Contains("Lỗi kiểm duyệt", StringComparison.OrdinalIgnoreCase)
                || result.Reason.Contains("Chưa cấu hình", StringComparison.OrdinalIgnoreCase)
                || result.Reason.Contains("provider", StringComparison.OrdinalIgnoreCase));

        private static ModerationResult MergeImageFailure(ModerationResult textResult, ModerationResult imageResult)
        {
            var userDetail = imageResult.Reason;
            if (userDetail.Contains("anime", StringComparison.OrdinalIgnoreCase)
                || userDetail.Contains("hoạt hình", StringComparison.OrdinalIgnoreCase)
                || userDetail.Contains("meme", StringComparison.OrdinalIgnoreCase))
            {
                userDetail = ModerationMessageCatalog.ForImageInvalid();
            }

            return new ModerationResult
            {
                Status = imageResult.Status == ModerationStatus.Flagged
                    ? ModerationStatus.Flagged
                    : ModerationStatus.Rejected,
                Reason = userDetail,
                QualityScore = Math.Max(0, textResult.QualityScore - 30),
                AutoFormattedText = textResult.AutoFormattedText,
                ExtractedAmenities = textResult.ExtractedAmenities
            };
        }
    }
}
