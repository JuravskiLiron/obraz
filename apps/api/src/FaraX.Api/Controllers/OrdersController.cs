using FaraX.Api.Extensions;
using FaraX.Application.DTOs;
using FaraX.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FaraX.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orders;

    public OrdersController(OrderService orders) => _orders = orders;

    [HttpPost("checkout")]
    public async Task<ActionResult<OrderDto>> Checkout([FromBody] CreateOrderRequest req, CancellationToken ct) =>
        Ok(await _orders.CheckoutAsync(User.RequireUserId(), req, ct));

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> List(CancellationToken ct) =>
        Ok(await _orders.ListByUserAsync(User.RequireUserId(), ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById(string id, CancellationToken ct) =>
        Ok(await _orders.GetByIdAsync(User.RequireUserId(), id, ct));
}
