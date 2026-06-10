using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    public interface IEmailService
    {
        Task SendOtpEmailAsync(string email, string otp);
        Task SendPasswordResetOtpAsync(string email, string otp);
        Task SendEmailAsync(string email, string subject, string body, bool isHtml = false);
    }
}
