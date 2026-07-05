using FaraX.Application.Common;
using FaraX.Application.DTOs;
using FaraX.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FaraX.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly ProductService _products;

    public ProductsController(ProductService products) => _products = products;

    [HttpGet]
    public async Task<ActionResult<PlpResponse>> GetList(
        [FromQuery] string? gender,
        [FromQuery] string? category,
        [FromQuery] string? categoryId,
        [FromQuery] string? sizes,
        [FromQuery] string? colors,
        [FromQuery] string? brands,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] bool? onSale,
        [FromQuery] bool? isNew,
        [FromQuery] string? q,
        [FromQuery] string? sort,
        [FromQuery] int? limit,
        [FromQuery] int? offset,
        CancellationToken ct)
    {
        var filter = new ProductFilter
        {
            Gender = string.IsNullOrWhiteSpace(gender) ? null : Mappings.ParseGender(gender),
            CategorySlug = category,
            CategoryId = categoryId,
            Sizes = SplitCsv(sizes),
            Colors = SplitCsv(colors),
            Brands = SplitCsv(brands),
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            OnSale = onSale,
            IsNew = isNew,
            Search = q,
            Sort = ParseSort(sort),
            Limit = Math.Clamp(limit ?? 24, 1, 60),
            Offset = Math.Max(offset ?? 0, 0)
        };

        var result = await _products.GetListAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ProductDetailDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var product = await _products.GetBySlugAsync(slug, ct);
        return Ok(product);
    }

    [HttpGet("new-in")]
    public async Task<ActionResult<List<ProductSummaryDto>>> GetNewIn(
        [FromQuery] string? gender, [FromQuery] int? limit, CancellationToken ct)
    {
        var g = string.IsNullOrWhiteSpace(gender) ? (Domain.Enums.Gender?)null : Mappings.ParseGender(gender);
        return Ok(await _products.GetNewInAsync(g, Math.Clamp(limit ?? 12, 1, 40), ct));
    }

    [HttpGet("trending")]
    public async Task<ActionResult<List<ProductSummaryDto>>> GetTrending(
        [FromQuery] string? gender, [FromQuery] int? limit, CancellationToken ct)
    {
        var g = string.IsNullOrWhiteSpace(gender) ? (Domain.Enums.Gender?)null : Mappings.ParseGender(gender);
        return Ok(await _products.GetTrendingAsync(g, Math.Clamp(limit ?? 12, 1, 40), ct));
    }

    private static List<string> SplitCsv(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? new()
            : value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

    private static ProductSort ParseSort(string? sort) => (sort ?? "").Trim().ToLowerInvariant() switch
    {
        "newin" or "new-in" or "new_in" => ProductSort.NewIn,
        "priceasc" or "price-asc" or "price_asc" or "price-low-high" => ProductSort.PriceAsc,
        "pricedesc" or "price-desc" or "price_desc" or "price-high-low" => ProductSort.PriceDesc,
        _ => ProductSort.Recommended
    };
}
