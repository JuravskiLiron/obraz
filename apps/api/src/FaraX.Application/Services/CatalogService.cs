using FaraX.Application.Common.Interfaces;
using FaraX.Application.DTOs;
using FaraX.Domain.Entities;
using FaraX.Domain.Enums;

namespace FaraX.Application.Services;

public class CatalogService
{
    private readonly ICategoryRepository _categories;
    private readonly IBrandRepository _brands;
    private readonly IProductRepository _products;

    public CatalogService(
        ICategoryRepository categories,
        IBrandRepository brands,
        IProductRepository products)
    {
        _categories = categories;
        _brands = brands;
        _products = products;
    }

    public async Task<List<CategoryDto>> GetTreeAsync(Gender? gender, CancellationToken ct = default)
    {
        var all = await _categories.GetAllAsync(ct);
        if (gender is not null)
            all = all.Where(c => c.Gender == gender).ToList();

        var byParent = all
            .GroupBy(c => c.ParentId ?? "__root__")
            .ToDictionary(g => g.Key, g => g.OrderBy(c => c.Order).ThenBy(c => c.Name).ToList());

        List<CategoryDto> Build(string key) =>
            byParent.TryGetValue(key, out var nodes)
                ? nodes.Select(c => new CategoryDto(
                    c.Id, c.Slug, c.Name, c.ParentId, c.Gender.ToApi(), c.Order, c.Image,
                    Build(c.Id))).ToList()
                : new List<CategoryDto>();

        return Build("__root__");
    }

    public async Task<List<string>> GetDescendantIdsAsync(string categoryId, CancellationToken ct = default)
    {
        var all = await _categories.GetAllAsync(ct);
        var ids = new HashSet<string> { categoryId };

        bool added = true;
        while (added)
        {
            added = false;
            foreach (var c in all)
                if (c.ParentId is not null && ids.Contains(c.ParentId) && ids.Add(c.Id))
                    added = true;
        }
        return ids.ToList();
    }

    public async Task<List<BrandDto>> GetBrandsAsync(CancellationToken ct = default)
    {
        var brands = await _brands.GetAllAsync(ct);
        return brands.OrderBy(b => b.Name).Select(b => b.ToDto()).ToList();
    }

    public async Task<SearchSuggestionDto> SuggestAsync(string term, CancellationToken ct = default)
    {
        term = (term ?? "").Trim();
        if (term.Length < 2)
            return new SearchSuggestionDto(new(), new(), new());

        var products = await _products.SearchAsync(term, 6, ct);

        var brands = (await _brands.GetAllAsync(ct))
            .Where(b => b.Name.Contains(term, StringComparison.OrdinalIgnoreCase))
            .Take(5)
            .Select(b => b.ToDto())
            .ToList();

        var categories = (await _categories.GetAllAsync(ct))
            .Where(c => c.Name.Contains(term, StringComparison.OrdinalIgnoreCase))
            .Take(5)
            .Select(c => new CategoryDto(c.Id, c.Slug, c.Name, c.ParentId, c.Gender.ToApi(), c.Order, c.Image, new()))
            .ToList();

        return new SearchSuggestionDto(
            products.Select(p => p.ToSummary()).ToList(),
            brands,
            categories);
    }
}
