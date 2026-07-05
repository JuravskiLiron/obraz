using FaraX.Application.DTOs;
using FaraX.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FaraX.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly CatalogService _catalog;

    public CategoriesController(CatalogService catalog) => _catalog = catalog;

    [HttpGet("tree")]
    public async Task<ActionResult<List<CategoryDto>>> GetTree([FromQuery] string? gender, CancellationToken ct)
    {
        var g = string.IsNullOrWhiteSpace(gender) ? (Domain.Enums.Gender?)null : Mappings.ParseGender(gender);
        return Ok(await _catalog.GetTreeAsync(g, ct));
    }
}
