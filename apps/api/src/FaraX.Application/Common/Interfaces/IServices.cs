using FaraX.Domain.Entities;

namespace FaraX.Application.Common.Interfaces;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface IJwtTokenService
{
    (string token, DateTime expiresAt) CreateAccessToken(User user);
    int RefreshTokenDays { get; }
}
