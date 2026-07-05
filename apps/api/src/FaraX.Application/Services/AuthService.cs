using System.Security.Cryptography;
using System.Text;
using FaraX.Application.Common;
using FaraX.Application.Common.Interfaces;
using FaraX.Application.DTOs;
using FaraX.Domain.Entities;
using FaraX.Domain.Enums;

namespace FaraX.Application.Services;

public class AuthService
{
    private const int MaxActiveTokens = 5;

    private readonly IUserRepository _users;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;

    public AuthService(IUserRepository users, IPasswordHasher hasher, IJwtTokenService jwt)
    {
        _users = users;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest req, CancellationToken ct = default)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        if (await _users.GetByEmailAsync(email, ct) is not null)
            throw new ConflictException("Email already registered");

        var user = new User
        {
            Email = email,
            PasswordHash = _hasher.Hash(req.Password),
            FirstName = req.FirstName.Trim(),
            LastName = req.LastName.Trim(),
            Role = UserRole.Customer
        };

        await _users.CreateAsync(user, ct);
        return await IssueAsync(user, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req, CancellationToken ct = default)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailAsync(email, ct);

        if (user is null || !_hasher.Verify(req.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password");

        return await IssueAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var parts = (refreshToken ?? "").Split('.', 2);
        if (parts.Length != 2)
            throw new UnauthorizedException("Invalid refresh token");

        var userId = parts[0];
        var user = await _users.GetByIdAsync(userId, ct)
            ?? throw new UnauthorizedException("Invalid refresh token");

        var hash = Sha256(refreshToken!);
        var stored = user.RefreshTokens.FirstOrDefault(t => t.TokenHash == hash);

        if (stored is null || !stored.IsActive)
            throw new UnauthorizedException("Refresh token expired or revoked");

        // Rotate: revoke the used token, issue a fresh pair.
        stored.RevokedAt = DateTime.UtcNow;
        return await IssueAsync(user, ct);
    }

    public async Task<UserDto> MeAsync(string userId, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("User not found");
        return user.ToDto();
    }

    private async Task<AuthResponse> IssueAsync(User user, CancellationToken ct)
    {
        var (accessToken, accessExpires) = _jwt.CreateAccessToken(user);

        var raw = $"{user.Id}.{Base64Url(RandomNumberGenerator.GetBytes(32))}";
        var refresh = new RefreshToken
        {
            TokenHash = Sha256(raw),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenDays),
            CreatedAt = DateTime.UtcNow
        };

        user.RefreshTokens.Add(refresh);

        // Keep only the most recent active tokens; drop expired/revoked.
        user.RefreshTokens = user.RefreshTokens
            .Where(t => t.IsActive)
            .OrderByDescending(t => t.CreatedAt)
            .Take(MaxActiveTokens)
            .ToList();

        user.UpdatedAt = DateTime.UtcNow;
        await _users.UpdateAsync(user, ct);

        return new AuthResponse(accessToken, accessExpires, raw, user.ToDto());
    }

    private static string Sha256(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes);
    }

    private static string Base64Url(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
