namespace FaraX.Application.DTOs;

public record ImageDto(string Url, string Alt);

public record ColorDto(string Name, string Hex, List<ImageDto> Images);

public record VariantDto(
    string Sku,
    string Color,
    string Size,
    int Stock,
    decimal Price,
    decimal? SalePrice);

public record AttributesDto(
    string Fit,
    string Fabric,
    string Care,
    string ModelInfo,
    double? LengthCm);

public record ProductSummaryDto(
    string Id,
    string Slug,
    string Name,
    string Brand,
    string Gender,
    string CategoryId,
    decimal Price,
    decimal? SalePrice,
    string Currency,
    List<ColorDto> Colors,
    List<string> Sizes,
    bool IsNew,
    bool OnSale,
    bool LowStock,
    int TotalStock,
    double? Rating,
    int? ReviewsCount);

public record ProductDetailDto(
    string Id,
    string Slug,
    string Name,
    string Brand,
    string BrandId,
    string Gender,
    string CategoryId,
    string Description,
    List<ColorDto> Colors,
    List<VariantDto> Variants,
    decimal Price,
    decimal? SalePrice,
    string Currency,
    AttributesDto Attributes,
    List<string> Tags,
    bool IsNew,
    bool OnSale,
    double? Rating,
    int? ReviewsCount,
    List<ProductSummaryDto> Related);

public record FacetBucketDto(string Value, string? Hex, int Count);

public record FacetsDto(
    List<FacetBucketDto> Sizes,
    List<FacetBucketDto> Colors,
    List<FacetBucketDto> Brands,
    decimal MinPrice,
    decimal MaxPrice);

public record PlpResponse(
    List<ProductSummaryDto> Items,
    long Total,
    int Limit,
    int Offset,
    bool HasMore,
    FacetsDto Facets);

// ---- Admin write models ----

public record AdminImageInput(string Url, string Alt);
public record AdminColorInput(string Name, string Hex, List<AdminImageInput> Images);
public record AdminVariantInput(string Sku, string Color, string Size, int Stock, decimal Price, decimal? SalePrice);
public record AdminAttributesInput(string Fit, string Fabric, string Care, string ModelInfo, double? LengthCm);

public record AdminProductRequest(
    string Slug,
    string Name,
    string Brand,
    string BrandId,
    string Gender,
    string CategoryId,
    string Description,
    List<AdminColorInput> Colors,
    List<AdminVariantInput> Variants,
    decimal Price,
    decimal? SalePrice,
    string Currency,
    AdminAttributesInput Attributes,
    List<string> Tags,
    bool IsNew,
    bool IsActive);
