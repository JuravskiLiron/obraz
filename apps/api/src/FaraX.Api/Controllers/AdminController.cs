using FaraX.Application.DTOs;
using FaraX.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FaraX.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly ProductService _products;
    private readonly OrderService _orders;

    public AdminController(ProductService products, OrderService orders)
    {
        _products = products;
        _orders = orders;
    }

    [HttpPost("products")]
    public async Task<ActionResult<ProductDetailDto>> CreateProduct([FromBody] AdminProductRequest req, CancellationToken ct) =>
        Ok(await _products.CreateAsync(req, ct));

    [HttpPut("products/{id}")]
    public async Task<ActionResult<ProductDetailDto>> UpdateProduct(string id, [FromBody] AdminProductRequest req, CancellationToken ct) =>
        Ok(await _products.UpdateAsync(id, req, ct));

    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(string id, CancellationToken ct)
    {
        await _products.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpGet("orders")]
    public async Task<ActionResult<List<OrderDto>>> GetOrders(CancellationToken ct) =>
        Ok(await _orders.GetAllAsync(ct));

    [HttpPut("orders/{id}/status")]
    public async Task<ActionResult<OrderDto>> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusRequest req, CancellationToken ct) =>
        Ok(await _orders.UpdateStatusAsync(id, req.Status, ct));
}
