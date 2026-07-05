using FaraX.Domain.Enums;

namespace FaraX.Application.Common;

public enum ProductSort
{
    Recommended,
    NewIn,
    PriceAsc,
    PriceDesc
}

/// <summary>Resolved server-side filter for product queries.</summary>
public class ProductFilter
{
    public Gender? Gender { get; set; }

    /// <summary>Raw category slug from the request (resolved into ids by the service).</summary>
    public string? CategorySlug { get; set; }

    /// <summary>Raw category id from the request.</summary>
    public string? CategoryId { get; set; }

    /// <summary>Resolved set of category ids (selected category + descendants).</summary>
    public List<string> CategoryIds { get; set; } = new();

    public List<string> Sizes { get; set; } = new();
    public List<string> Colors { get; set; } = new();
    public List<string> Brands { get; set; } = new();

    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }

    public bool? OnSale { get; set; }
    public bool? IsNew { get; set; }

    public string? Search { get; set; }

    public ProductSort Sort { get; set; } = ProductSort.Recommended;

    public int Limit { get; set; } = 24;
    public int Offset { get; set; }
}

public class FacetBucket
{
    public string Value { get; set; } = string.Empty;
    public string? Hex { get; set; }
    public int Count { get; set; }
}

public class FacetResult
{
    public List<FacetBucket> Sizes { get; set; } = new();
    public List<FacetBucket> Colors { get; set; } = new();
    public List<FacetBucket> Brands { get; set; } = new();
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
}
