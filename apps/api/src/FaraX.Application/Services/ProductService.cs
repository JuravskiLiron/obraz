using FaraX.Application.Common;
using FaraX.Application.Common.Interfaces;
using FaraX.Application.DTOs;
using FaraX.Domain.Entities;
using FaraX.Domain.Enums;

namespace FaraX.Application.Services;

public class ProductService
{
    private readonly IProductRepository _products;
    private readonly ICategoryRepository _categories;

    public ProductService(IProductRepository products, ICategoryRepository categories)
    {
        _products = products;
        _categories = categories;
    }

    public async Task<PlpResponse> GetListAsync(ProductFilter filter, CancellationToken ct = default)
    {
        await ResolveCategoryIdsAsync(filter, ct);

        var page = await _products.QueryAsync(filter, ct);
        var facets = await BuildFacetsAsync(filter, ct);

        var items = page.Items.Select(p => p.ToSummary()).ToList();

        return new PlpResponse(
            items,
            page.Total,
            page.Limit,
            page.Offset,
            page.HasMore,
            facets);
    }

    public async Task<ProductDetailDto> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var product = await _products.GetBySlugAsync(slug, ct)
            ?? throw new NotFoundException("Product not found");

        var related = await _products.GetRelatedAsync(product, 8, ct);
        return product.ToDetail(related);
    }

    public async Task<List<ProductSummaryDto>> GetNewInAsync(Gender? gender, int limit, CancellationToken ct = default)
    {
        var filter = new ProductFilter
        {
            Gender = gender,
            IsNew = true,
            Sort = ProductSort.NewIn,
            Limit = limit
        };
        var page = await _products.QueryAsync(filter, ct);
        return page.Items.Select(p => p.ToSummary()).ToList();
    }

    public async Task<List<ProductSummaryDto>> GetTrendingAsync(Gender? gender, int limit, CancellationToken ct = default)
    {
        var filter = new ProductFilter
        {
            Gender = gender,
            Sort = ProductSort.Recommended,
            Limit = limit
        };
        var page = await _products.QueryAsync(filter, ct);
        return page.Items.Select(p => p.ToSummary()).ToList();
    }

    // ---- Admin ----

    public async Task<ProductDetailDto> CreateAsync(AdminProductRequest req, CancellationToken ct = default)
    {
        var product = new Product();
        MapFromRequest(product, req);
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;

        await _products.CreateAsync(product, ct);
        return product.ToDetail(Array.Empty<Product>());
    }

    public async Task<ProductDetailDto> UpdateAsync(string id, AdminProductRequest req, CancellationToken ct = default)
    {
        var product = await _products.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Product not found");

        MapFromRequest(product, req);
        product.UpdatedAt = DateTime.UtcNow;

        await _products.UpdateAsync(product, ct);
        return product.ToDetail(Array.Empty<Product>());
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        var ok = await _products.DeleteAsync(id, ct);
        if (!ok) throw new NotFoundException("Product not found");
    }

    // ---- internals ----

    private async Task ResolveCategoryIdsAsync(ProductFilter filter, CancellationToken ct)
    {
        Category? root = null;

        if (!string.IsNullOrWhiteSpace(filter.CategoryId))
            root = await _categories.GetByIdAsync(filter.CategoryId!, ct);
        else if (!string.IsNullOrWhiteSpace(filter.CategorySlug))
            root = await _categories.GetBySlugAsync(filter.CategorySlug!, ct);

        if (root is null) return;

        var all = await _categories.GetAllAsync(ct);
        var ids = new HashSet<string> { root.Id };

        // Collect descendants (tree is shallow; iterate to fixpoint).
        bool added = true;
        while (added)
        {
            added = false;
            foreach (var c in all)
            {
                if (c.ParentId is not null && ids.Contains(c.ParentId) && ids.Add(c.Id))
                    added = true;
            }
        }

        filter.CategoryIds = ids.ToList();
        if (root.Gender != Gender.Unisex)
            filter.Gender ??= root.Gender;
    }

    private async Task<FacetsDto> BuildFacetsAsync(ProductFilter filter, CancellationToken ct)
    {
        var pool = await _products.GetBaseFilteredAsync(filter, ct);

        var sizeBuckets = new Dictionary<string, int>();
        var colorBuckets = new Dictionary<string, (string Hex, int Count)>();
        var brandBuckets = new Dictionary<string, int>();

        decimal min = decimal.MaxValue;
        decimal max = decimal.MinValue;

        foreach (var p in pool)
        {
            var eff = p.EffectivePrice();
            if (eff < min) min = eff;
            if (eff > max) max = eff;

            foreach (var size in p.Variants.Select(v => v.Size).Distinct())
                sizeBuckets[size] = sizeBuckets.GetValueOrDefault(size) + 1;

            foreach (var color in p.Colors)
            {
                var prev = colorBuckets.GetValueOrDefault(color.Name);
                colorBuckets[color.Name] = (color.Hex, prev.Count + 1);
            }

            if (!string.IsNullOrEmpty(p.Brand))
                brandBuckets[p.Brand] = brandBuckets.GetValueOrDefault(p.Brand) + 1;
        }

        if (pool.Count == 0) { min = 0; max = 0; }

        var sizes = sizeBuckets
            .Select(kv => new FacetBucketDto(kv.Key, null, kv.Value))
            .OrderBy(b => Mappings.SizeOrder(b.Value))
            .ThenBy(b => b.Value)
            .ToList();

        var colors = colorBuckets
            .Select(kv => new FacetBucketDto(kv.Key, kv.Value.Hex, kv.Value.Count))
            .OrderByDescending(b => b.Count)
            .ThenBy(b => b.Value)
            .ToList();

        var brands = brandBuckets
            .Select(kv => new FacetBucketDto(kv.Key, null, kv.Value))
            .OrderBy(b => b.Value)
            .ToList();

        return new FacetsDto(sizes, colors, brands, Math.Floor(min), Math.Ceiling(max));
    }

    private static void MapFromRequest(Product product, AdminProductRequest req)
    {
        product.Slug = req.Slug.Trim();
        product.Name = req.Name.Trim();
        product.Brand = req.Brand.Trim();
        product.BrandId = req.BrandId.Trim();
        product.Gender = Mappings.ParseGender(req.Gender);
        product.CategoryId = req.CategoryId.Trim();
        product.Description = req.Description;
        product.Price = req.Price;
        product.SalePrice = req.SalePrice;
        product.Currency = string.IsNullOrWhiteSpace(req.Currency) ? "USD" : req.Currency.Trim();
        product.Tags = req.Tags ?? new();
        product.IsNew = req.IsNew;
        product.IsActive = req.IsActive;

        product.Colors = (req.Colors ?? new()).Select(c => new ProductColor
        {
            Name = c.Name,
            Hex = c.Hex,
            Images = (c.Images ?? new()).Select(i => new ProductImage { Url = i.Url, Alt = i.Alt }).ToList()
        }).ToList();

        product.Variants = (req.Variants ?? new()).Select(v => new ProductVariant
        {
            Sku = v.Sku,
            Color = v.Color,
            Size = v.Size,
            Stock = v.Stock,
            Price = v.Price,
            SalePrice = v.SalePrice
        }).ToList();

        product.Attributes = new ProductAttributes
        {
            Fit = req.Attributes.Fit,
            Fabric = req.Attributes.Fabric,
            Care = req.Attributes.Care,
            ModelInfo = req.Attributes.ModelInfo,
            LengthCm = req.Attributes.LengthCm
        };
    }
}
