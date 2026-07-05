using FaraX.Api.Extensions;
using FaraX.Application.DTOs;
using FaraX.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FaraX.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/wishlist")]
public class WishlistController : ControllerBase
{
    private readonly WishlistService _wishlist;

    public WishlistController(WishlistService wishlist) => _wishlist = wishlist;

    [HttpGet]
    public async Task<ActionResult<WishlistDto>> Get(CancellationToken ct) =>
        Ok(await _wishlist.GetAsync(User.RequireUserId(), ct));

    [HttpPost]
    public async Task<ActionResult<WishlistDto>> Add([FromBody] AddWishlistRequest req, CancellationToken ct) =>
        Ok(await _wishlist.AddAsync(User.RequireUserId(), req.ProductId, ct));

    [HttpDelete("{productId}")]
    public async Task<ActionResult<WishlistDto>> Remove(string productId, CancellationToken ct) =>
        Ok(await _wishlist.RemoveAsync(User.RequireUserId(), productId, ct));
}
