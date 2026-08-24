using System.ComponentModel.DataAnnotations;

namespace Muse.Api.Dtos;

public record RegisterRequest(
    [Required, MinLength(3), MaxLength(50)] string Username,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponse(string Token, DateTime ExpiresAt, string Username, string Email);
