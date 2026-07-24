using System.ComponentModel.DataAnnotations;
using Application.Common.DTOs.AdminUsers;
using Microsoft.AspNetCore.Authorization;
using RoomHub.API.Controllers;
using Xunit;

namespace RoomHub.Application.Tests;

public sealed class AdminUserManagementTests
{
    [Fact]
    public void Controller_IsRestrictedToAdministratorRole()
    {
        var attribute = Assert.Single(typeof(AdminUsersController)
            .GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>());
        Assert.Equal("Administrator", attribute.Roles);
    }

    [Fact]
    public void Query_Defaults_EnableServerSidePagingAndCreatedDateSorting()
    {
        var query = new AdminUserQuery();
        Assert.Equal(1, query.Page);
        Assert.Equal(20, query.PageSize);
        Assert.Equal("createdAt", query.SortBy);
        Assert.Equal("desc", query.SortDir);
    }

    [Theory]
    [InlineData("")]
    [InlineData("too short")]
    [InlineData("123456789")]
    public void BanRequest_RejectsReasonShorterThanTenCharacters(string reason)
    {
        var request = new BanUserRequest { Reason = reason };
        var results = new List<ValidationResult>();
        Assert.False(Validator.TryValidateObject(request, new ValidationContext(request), results, true));
    }

    [Fact]
    public void UserDtos_DoNotExposeIdentitySecrets()
    {
        var names = typeof(AdminUserDetailDto).GetProperties().Select(p => p.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
        Assert.DoesNotContain("PasswordHash", names);
        Assert.DoesNotContain("RefreshToken", names);
        Assert.DoesNotContain("SecurityStamp", names);
        Assert.DoesNotContain("Otp", names);
    }
}
