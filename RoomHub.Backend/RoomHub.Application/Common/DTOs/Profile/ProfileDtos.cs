using System;

namespace Application.Common.DTOs.Profile
{
    // Returned to the client when viewing the current user's profile.
    public class ProfileDto
    {
        public string Id { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Sent by the client to update the editable parts of the profile.
    // The user id is taken from the JWT, never from the request body.
    public class UpdateProfileDto
    {
        public string FullName { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }

    // Lightweight result wrapper so the API can surface Identity errors to the UI.
    public class ProfileResult
    {
        public bool Succeeded { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
