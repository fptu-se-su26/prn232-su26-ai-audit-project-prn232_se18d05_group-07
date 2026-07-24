using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Application.Common.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace RoomHub.API.Middlewares
{
    /// <summary>
    /// Safety net for actions that don't wrap their own try/catch (e.g. ListingsController's
    /// Update/TogglePublish/Duplicate) - without this, an unhandled exception fell through to
    /// ASP.NET Core's default HTML error page instead of the { message } JSON shape every other
    /// action already returns.
    /// </summary>
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception while processing {Method} {Path}", context.Request.Method, context.Request.Path);

                var statusCode = ex switch
                {
                    NotFoundException => HttpStatusCode.NotFound,
                    ForbiddenException => HttpStatusCode.Forbidden,
                    UnauthorizedAccessException => HttpStatusCode.Unauthorized,
                    ArgumentException => HttpStatusCode.BadRequest,
                    InvalidOperationException => HttpStatusCode.BadRequest,
                    _ => HttpStatusCode.InternalServerError
                };

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)statusCode;

                var payload = JsonSerializer.Serialize(new
                {
                    message = statusCode == HttpStatusCode.InternalServerError
                        ? "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau."
                        : ex.Message
                });

                await context.Response.WriteAsync(payload);
            }
        }
    }
}
