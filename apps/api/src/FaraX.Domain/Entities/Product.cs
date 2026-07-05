using FaraX.Domain.Common;
using FaraX.Domain.Enums;

namespace FaraX.Domain.Entities;

public class Product : Entity
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    /// <summary>Display brand name (denormalized for fast listing/filtering).</summary>
    public string Brand { get; set; } = string.Empty;
    public string BrandId { get; set; } = string.Empty;

    public Gender Gender { get; set; } = Gender.Women;
    public string CategoryId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public List<ProductColor> Colors { get; set; } = new();
    public List<ProductVariant> Variants { get; set; } = new();

    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
    public string Currency { get; set; } = "USD";

    public ProductAttributes Attributes { get; set; } = new();
    public List<string> Tags { get; set; } = new();

    public bool IsNew { get; set; }
    public bool IsActive { get; set; } = true;

    public double? Rating { get; set; }
    public int? ReviewsCount { get; set; }
}

public class ProductColor
{
    public string Name { get; set; } = string.Empty;
    public string Hex { get; set; } = "#000000";
    public List<ProductImage> Images { get; set; } = new();
}

public class ProductImage
{
    public string Url { get; set; } = string.Empty;
    public string Alt { get; set; } = string.Empty;
}

public class ProductVariant
{
    public string Sku { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
}

public class ProductAttributes
{
    public string Fit { get; set; } = string.Empty;
    public string Fabric { get; set; } = string.Empty;
    public string Care { get; set; } = string.Empty;
    public string ModelInfo { get; set; } = string.Empty;
    public double? LengthCm { get; set; }
}
