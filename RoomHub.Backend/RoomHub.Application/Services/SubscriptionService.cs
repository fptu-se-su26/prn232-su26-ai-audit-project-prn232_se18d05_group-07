using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common.DTOs.Subscriptions;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ISubscriptionRepository _subscriptionRepository;
        private readonly IBuildingRepository _buildingRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly INotificationRepository _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;

        public SubscriptionService(
            UserManager<ApplicationUser> userManager,
            ISubscriptionRepository subscriptionRepository,
            IBuildingRepository buildingRepository,
            IRoomRepository roomRepository,
            INotificationRepository notificationRepository,
            IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _subscriptionRepository = subscriptionRepository;
            _buildingRepository = buildingRepository;
            _roomRepository = roomRepository;
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(string ownerId)
        {
            var user = await _userManager.FindByIdAsync(ownerId);
            if (user == null)
            {
                throw new InvalidOperationException("Không tìm thấy thông tin chủ nhà.");
            }

            var now = DateTime.UtcNow;
            // Check if subscription has expired
            if (user.CurrentPlan != SubscriptionPlan.Free && user.SubscriptionExpiry != null && user.SubscriptionExpiry.Value < now)
            {
                user.CurrentPlan = SubscriptionPlan.Free;
                user.SubscriptionExpiry = null;
                await _userManager.UpdateAsync(user);
            }

            // Fetch usage stats
            var buildings = await _buildingRepository.GetBuildingsByOwnerAsync(ownerId);
            var buildingsUsed = buildings.Count;
            var roomsUsed = buildings.Sum(b => b.Floors.SelectMany(f => f.Rooms).Count(r => !r.IsDeleted));

            // Check AI Audit limits
            if (user.LastAiAuditResetDate == null || 
                user.LastAiAuditResetDate.Value.Month != now.Month || 
                user.LastAiAuditResetDate.Value.Year != now.Year)
            {
                user.MonthlyAiAuditCount = 0;
                user.LastAiAuditResetDate = now;
                await _userManager.UpdateAsync(user);
            }

            var planName = user.CurrentPlan switch
            {
                SubscriptionPlan.Free => "Starter (Miễn phí)",
                SubscriptionPlan.Monthly => "Pro (Tháng)",
                SubscriptionPlan.Yearly => "Pro (Năm)",
                _ => user.CurrentPlan.ToString()
            };

            var expiryStr = user.SubscriptionExpiry?.ToString("dd/MM/yyyy");

            return new SubscriptionStatusDto
            {
                Plan = planName,
                ExpiryDate = expiryStr,
                BuildingsUsed = buildingsUsed,
                BuildingsLimit = Domain.Common.SubscriptionLimits.GetMaxBuildings(user.CurrentPlan),
                RoomsUsed = roomsUsed,
                RoomsLimit = Domain.Common.SubscriptionLimits.GetMaxRooms(user.CurrentPlan),
                AiAuditsUsed = user.MonthlyAiAuditCount,
                AiAuditsLimit = Domain.Common.SubscriptionLimits.GetMaxAiAudits(user.CurrentPlan),
                Status = user.CurrentPlan == SubscriptionPlan.Free ? "Free" : "Active"
            };
        }

        public async Task<UpgradeResponseDto> RequestUpgradeAsync(string ownerId, UpgradeRequestDto request)
        {
            var user = await _userManager.FindByIdAsync(ownerId);
            if (user == null)
            {
                throw new InvalidOperationException("Không tìm thấy thông tin chủ nhà.");
            }

            SubscriptionPlan plan;
            decimal amount;
            if (request.PlanType.Equals("Monthly", StringComparison.OrdinalIgnoreCase))
            {
                plan = SubscriptionPlan.Monthly;
                amount = 199000;
            }
            else if (request.PlanType.Equals("Yearly", StringComparison.OrdinalIgnoreCase))
            {
                plan = SubscriptionPlan.Yearly;
                amount = 1990000;
            }
            else
            {
                throw new ArgumentException("Loại gói cước không hợp lệ. Chỉ chấp nhận 'Monthly' hoặc 'Yearly'.");
            }

            var subscription = new Subscription
            {
                UserId = ownerId,
                PlanType = plan,
                Amount = amount,
                Status = SubscriptionStatus.Pending,
                TransactionProofUrl = request.ProofImageUrl,
                Note = request.Note,
                CreatedAt = DateTime.UtcNow
            };

            await _subscriptionRepository.AddAsync(subscription);
            await _unitOfWork.SaveChangesAsync();

            var response = new UpgradeResponseDto
            {
                Success = true,
                SubscriptionId = subscription.Id,
                Amount = amount,
                Message = "Yêu cầu đăng ký đã được ghi nhận."
            };

            if (request.PaymentMethod.Equals("VietQR", StringComparison.OrdinalIgnoreCase))
            {
                var memo = $"ROOMHUB_SUB_{subscription.Id}";
                var bankId = "MB";
                var accountNumber = "0987654321";
                var accountHolder = "CONG TY ROOMHUB";
                var encodedHolder = Uri.EscapeDataString(accountHolder);
                
                response.QrCodeUrl = $"https://api.vietqr.io/image/{bankId}-{accountNumber}-compact.jpg?amount={(int)amount}&addInfo={memo}&accountName={encodedHolder}";
                response.PaymentUrl = response.QrCodeUrl;
                response.Message = "Mã VietQR đã được tạo thành công. Vui lòng quét mã ngân hàng để hoàn thành thanh toán.";
            }
            else
            {
                response.BankAccountName = "CONG TY ROOMHUB";
                response.BankAccountNumber = "0987654321";
                response.BankName = "Ngân hàng TMCP Quân đội (MB)";
                response.Message = "Yêu cầu đăng ký thủ công đã ghi nhận. Vui lòng chuyển khoản ngân hàng và tải ảnh biên lai giao dịch.";
            }

            return response;
        }

        public async Task<bool> HandlePayOSWebhookAsync(string webhookData)
        {
            try
            {
                int subscriptionId = 0;
                if (int.TryParse(webhookData, out var id))
                {
                    subscriptionId = id;
                }
                else if (webhookData.Contains("ROOMHUB_SUB_"))
                {
                    var part = webhookData.Split("ROOMHUB_SUB_").LastOrDefault();
                    if (part != null)
                    {
                        var numericStr = new string(part.TakeWhile(char.IsDigit).ToArray());
                        int.TryParse(numericStr, out subscriptionId);
                    }
                }

                if (subscriptionId == 0) return false;

                var sub = await _subscriptionRepository.GetByIdAsync(subscriptionId);
                if (sub == null || sub.Status != SubscriptionStatus.Pending) return false;

                sub.Status = SubscriptionStatus.Active;
                sub.StartDate = DateTime.UtcNow;
                sub.EndDate = sub.PlanType == SubscriptionPlan.Monthly 
                    ? DateTime.UtcNow.AddMonths(1) 
                    : DateTime.UtcNow.AddYears(1);

                await _subscriptionRepository.UpdateAsync(sub);

                var user = sub.User;
                user.CurrentPlan = sub.PlanType;
                user.SubscriptionExpiry = sub.EndDate;

                await _userManager.UpdateAsync(user);

                var notification = new Notification
                {
                    UserId = user.Id,
                    Type = "SubscriptionApproved",
                    Title = "Kích hoạt gói dịch vụ thành công",
                    Content = $"Hệ thống đã tự động kích hoạt gói cước {(sub.PlanType == SubscriptionPlan.Monthly ? "Pro (Tháng)" : "Pro (Năm)")} của bạn qua thanh toán VietQR. Thời hạn sử dụng đến ngày {sub.EndDate.Value.ToString("dd/MM/yyyy")}.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationRepository.AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<AdminSubscriptionDto>> GetPendingSubscriptionsAsync()
        {
            var pending = await _subscriptionRepository.GetPendingSubscriptionsAsync();
            return pending.Select(s => new AdminSubscriptionDto
            {
                Id = s.Id,
                UserId = s.UserId,
                OwnerName = s.User?.FullName ?? "Chủ nhà ẩn danh",
                OwnerEmail = s.User?.Email ?? "owner@roomhub.vn",
                PlanType = s.PlanType switch
                {
                    SubscriptionPlan.Monthly => "Pro (Tháng)",
                    SubscriptionPlan.Yearly => "Pro (Năm)",
                    _ => s.PlanType.ToString()
                },
                Amount = s.Amount,
                Date = s.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                Status = "pending",
                TransactionProofUrl = s.TransactionProofUrl,
                Note = s.Note
            }).ToList();
        }

        public async Task<bool> ApproveSubscriptionAsync(int subscriptionId, string adminId)
        {
            var sub = await _subscriptionRepository.GetByIdAsync(subscriptionId);
            if (sub == null || sub.Status != SubscriptionStatus.Pending) return false;

            sub.Status = SubscriptionStatus.Active;
            sub.StartDate = DateTime.UtcNow;
            sub.EndDate = sub.PlanType == SubscriptionPlan.Monthly 
                ? DateTime.UtcNow.AddMonths(1) 
                : DateTime.UtcNow.AddYears(1);

            await _subscriptionRepository.UpdateAsync(sub);

            var user = sub.User;
            user.CurrentPlan = sub.PlanType;
            user.SubscriptionExpiry = sub.EndDate;

            await _userManager.UpdateAsync(user);

            var notification = new Notification
            {
                UserId = user.Id,
                Type = "SubscriptionApproved",
                Title = "Duyệt nâng cấp gói cước thành công",
                Content = $"Yêu cầu nâng cấp gói cước {(sub.PlanType == SubscriptionPlan.Monthly ? "Pro (Tháng)" : "Pro (Năm)")} của bạn đã được Quản trị viên phê duyệt. Thời hạn sử dụng đến ngày {sub.EndDate.Value.ToString("dd/MM/yyyy")}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await _notificationRepository.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RejectSubscriptionAsync(int subscriptionId, string rejectReason, string adminId)
        {
            var sub = await _subscriptionRepository.GetByIdAsync(subscriptionId);
            if (sub == null || sub.Status != SubscriptionStatus.Pending) return false;

            sub.Status = SubscriptionStatus.Rejected;
            sub.Note = rejectReason;
            await _subscriptionRepository.UpdateAsync(sub);

            var user = sub.User;

            var notification = new Notification
            {
                UserId = user.Id,
                Type = "SubscriptionRejected",
                Title = "Yêu cầu nâng cấp gói bị từ chối",
                Content = $"Yêu cầu nâng cấp gói của bạn đã bị từ chối. Lý do: {rejectReason}. Vui lòng kiểm tra lại ảnh biên lai chuyển khoản hoặc liên hệ ban quản trị để được hỗ trợ.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await _notificationRepository.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}
