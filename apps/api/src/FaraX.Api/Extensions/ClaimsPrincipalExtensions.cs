using System.Security.Claims;
using FaraX.Application.Common;

namespace FaraX.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string? GetUserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier);

    public static string RequireUserId(this ClaimsPrincipal user) =>
        user.GetUserId() ?? throw new UnauthorizedException("Not authenticated");
}
