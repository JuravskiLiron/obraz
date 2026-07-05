using FaraX.Api.Extensions;
using FaraX.Application.DTOs;
using FaraX.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FaraX.Api.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly CartService _cart;

    public CartController(CartService cart) => _cart = cart;

    // Authenticated users resolve by user id; guests pass an X-Cart-Token header.
    private (string? userId, string? token) Resolve()
    {
        var userId = User.GetUserId();
        var token = Request.Headers.TryGetValue("X-Cart-Token", out var v) ? v.ToString() : null;
        return (userId, string.IsNullOrWhiteSpace(token) ? null : token);
    }

    [HttpGet]
    public async Task<ActionResult<CartDto>> Get(CancellationToken ct)
    {
        var (userId, token) = Resolve();
        return Ok(await _cart.GetAsync(userId, token, ct));
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem([FromBody] AddToCartRequest req, CancellationToken ct)
    {
        var (userId, token) = Resolve();
        return Ok(await _cart.AddAsync(userId, token, req, ct));
    }

    [HttpPut("items/{sku}")]
    public async Task<ActionResult<CartDto>> UpdateItem(string sku, [FromBody] UpdateCartItemRequest req, CancellationToken ct)
    {
        var (userId, token) = Resolve();
        return Ok(await _cart.UpdateItemAsync(userId, token, sku, req.Qty, ct));
    }

    [HttpDelete("items/{sku}")]
    public async Task<ActionResult<CartDto>> RemoveItem(string sku, CancellationToken ct)
    {
        var (userId, token) = Resolve();
        return Ok(await _cart.RemoveItemAsync(userId, token, sku, ct));
    }

    [Authorize]
    [HttpPost("merge")]
    public async Task<ActionResult<CartDto>> Merge([FromBody] MergeCartRequest req, CancellationToken ct) =>
        Ok(await _cart.MergeAsync(User.RequireUserId(), req.CartToken, ct));
}
