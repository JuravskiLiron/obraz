namespace FaraX.Application.DTOs;

public record CategoryDto(
    string Id,
    string Slug,
    string Name,
    string? ParentId,
    string Gender,
    int Order,
    string Image,
    List<CategoryDto> Children);

public record BrandDto(
    string Id,
    string Slug,
    string Name,
    string LogoUrl,
    string Description);

public record SearchSuggestionDto(
    List<ProductSummaryDto> Products,
    List<BrandDto> Brands,
    List<CategoryDto> Categories);
