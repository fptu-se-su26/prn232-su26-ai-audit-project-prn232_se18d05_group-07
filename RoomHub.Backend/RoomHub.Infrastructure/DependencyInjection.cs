using System.Text;
using Domain.Entities;
using Infrastructure.Persistence;
using Infrastructure.Authentication;
using Infrastructure.Services;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // Register DbContext
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString,
                    b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

            // Register Memory Cache for storing OTP and register session temporarily
            services.AddMemoryCache();

            // Configure Identity
            services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = true;
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

            // Configure JWT Token Services
            var jwtSecret = configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForRoomHubSplitArchitecture2026!";
            var key = Encoding.UTF8.GetBytes(jwtSecret);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["JwtSettings:Issuer"],
                    ValidAudience = configuration["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };
            });

            // Register Custom Services
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IProfileService, ProfileService>();

            // Register Repositories
            services.AddScoped<IBuildingRepository, Persistence.Repositories.BuildingRepository>();
            services.AddScoped<IRoomRepository, Persistence.Repositories.RoomRepository>();
            services.AddScoped<IInvoiceRepository, Persistence.Repositories.InvoiceRepository>();
            services.AddScoped<IContractRepository, Persistence.Repositories.ContractRepository>();
            services.AddScoped<IUtilityReadingRepository, Persistence.Repositories.UtilityReadingRepository>();
            services.AddScoped<IUnitOfWork, Persistence.Repositories.UnitOfWork>();

            // Register Business Services
            services.AddScoped<IPropertyService, Application.Services.PropertyService>();
            services.AddScoped<IContractService, Application.Services.ContractService>();
            services.AddScoped<IInvoiceService, Application.Services.InvoiceService>();
            services.AddScoped<IListingService, Application.Services.ListingService>();
            services.AddScoped<IDashboardService, Application.Services.DashboardService>();

            return services;
        }
    }
}
