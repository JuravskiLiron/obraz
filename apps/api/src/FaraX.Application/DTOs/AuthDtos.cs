namespace FaraX.Application.DTOs;

public record RegisterRequest(string Email, string Password, string FirstName, string LastName);
public record LoginRequest(string Email, string Password);
public record RefreshRequest(string RefreshToken);

public record AddressDto(
    string Label,
    string FullName,
    string Line1,
    string Line2,
    string City,
    string PostalCode,
    string Country,
    string Phone,
    bool IsDefault);

public record UserDto(
    string Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    List<AddressDto> Addresses);

public record AuthResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string RefreshToken,
    UserDto User);
