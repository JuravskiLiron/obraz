using FaraX.Application.DTOs;
using FaraX.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FaraX.Api.Controllers;

[ApiController]
[Route("api/brands")]
public class BrandsController : ControllerBase
{
    private readonly CatalogService _catalog;

    public BrandsController(CatalogService catalog) => _catalog = catalog;

    [HttpGet]
    public async Task<ActionResult<List<BrandDto>>> GetAll(CancellationToken ct) =>
        Ok(await _catalog.GetBrandsAsync(ct));
}
