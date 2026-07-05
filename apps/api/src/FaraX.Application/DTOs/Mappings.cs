using FaraX.Domain.Entities;
using FaraX.Domain.Enums;

namespace FaraX.Application.DTOs;

public static class Mappings
{
    private static readonly string[] SizeOrderRef =
        { "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL" };

    public static string ToApi(this Gender g) => g switch
    {
        Gender.Women => "women",
        Gender.Men => "men",
        _ => "unisex"
    };

    public static Gender ParseGender(string? value) => (value ?? "").Trim().ToLowerInvariant() switch
    {
        "men" => Gender.Men,
        "unisex" => Gender.Unisex,
        "women" => Gender.Women,
        _ => Gender.Women
    };

    public static int SizeOrder(string size)
    {
        var idx = Array.IndexOf(SizeOrderRef, size.Trim().ToUpperInvariant());
        return idx < 0 ? 999 : idx;
    }

    public static ImageDto ToDto(this ProductImage i) => new(i.Url, i.Alt);

    public static ColorDto ToDto(this ProductColor c) =>
        new(c.Name, c.Hex, c.Images.Select(ToDto).ToList());

    public static VariantDto ToDto(this ProductVariant v) =>
        new(v.Sku, v.Color, v.Size, v.Stock, v.Price, v.SalePrice);

    public static AttributesDto ToDto(this ProductAttributes a) =>
        new(a.Fit, a.Fabric, a.Care, a.ModelInfo, a.LengthCm);

    public static decimal EffectivePrice(this Product p) => p.SalePrice ?? p.Price;

    public static ProductSummaryDto ToSummary(this Product p)
    {
        var totalStock = p.Variants.Sum(v => v.Stock);

        // Trim each color to its first 2 images (front + hover-swap).
        var colors = p.Colors
            .Select(c => new ColorDto(
                c.Name,
                c.Hex,
                c.Images.Take(2).Select(ToDto).ToList()))
            .ToList();

        var sizes = p.Variants
            .Select(v => v.Size)
            .Distinct()
            .OrderBy(SizeOrder)
            .ThenBy(s => s)
            .ToList();

        return new ProductSummaryDto(
            p.Id,
            p.Slug,
            p.Name,
            p.Brand,
            p.Gender.ToApi(),
            p.CategoryId,
            p.Price,
            p.SalePrice,
            p.Currency,
            colors,
            sizes,
            p.IsNew,
            p.SalePrice is not null,
            totalStock is > 0 and <= 5,
            totalStock,
            p.Rating,
            p.ReviewsCount);
    }

    public static ProductDetailDto ToDetail(this Product p, IEnumerable<Product> related) =>
        new(
            p.Id,
            p.Slug,
            p.Name,
            p.Brand,
            p.BrandId,
            p.Gender.ToApi(),
            p.CategoryId,
            p.Description,
            p.Colors.Select(ToDto).ToList(),
            p.Variants.Select(ToDto).ToList(),
            p.Price,
            p.SalePrice,
            p.Currency,
            p.Attributes.ToDto(),
            p.Tags,
            p.IsNew,
            p.SalePrice is not null,
            p.Rating,
            p.ReviewsCount,
            related.Select(ToSummary).ToList());

    public static AddressDto ToDto(this Address a) =>
        new(a.Label, a.FullName, a.Line1, a.Line2, a.City, a.PostalCode, a.Country, a.Phone, a.IsDefault);

    public static UserDto ToDto(this User u) =>
        new(u.Id, u.Email, u.FirstName, u.LastName,
            u.Role == UserRole.Admin ? "admin" : "customer",
            u.Addresses.Select(ToDto).ToList());

    public static BrandDto ToDto(this Brand b) =>
        new(b.Id, b.Slug, b.Name, b.LogoUrl, b.Description);

    public static OrderItemDto ToDto(this OrderItem i) =>
        new(i.ProductId, i.Sku, i.Name, i.Brand, i.Color, i.Size, i.Image, i.Qty, i.Price);

    public static ShippingAddressDto ToDto(this ShippingAddress a) =>
        new(a.FullName, a.Line1, a.Line2, a.City, a.PostalCode, a.Country, a.Phone);

    public static string ToApi(this OrderStatus s) => s.ToString().ToLowerInvariant();
    public static string ToApi(this PaymentStatus s) => s.ToString().ToLowerInvariant();

    public static string ToApi(this DeliveryMethod m) => m switch
    {
        DeliveryMethod.Express => "express",
        DeliveryMethod.PickupPoint => "pickupPoint",
        _ => "standard"
    };

    public static DeliveryMethod ParseDeliveryMethod(string? value) => (value ?? "").Trim().ToLowerInvariant() switch
    {
        "express" => DeliveryMethod.Express,
        "pickuppoint" => DeliveryMethod.PickupPoint,
        _ => DeliveryMethod.Standard
    };

    public static OrderStatus ParseOrderStatus(string? value) => (value ?? "").Trim().ToLowerInvariant() switch
    {
        "paid" => OrderStatus.Paid,
        "shipped" => OrderStatus.Shipped,
        "delivered" => OrderStatus.Delivered,
        "cancelled" => OrderStatus.Cancelled,
        _ => OrderStatus.Pending
    };

    public static OrderDto ToDto(this Order o) =>
        new(
            o.Id,
            o.OrderNumber,
            o.UserId,
            o.Items.Select(ToDto).ToList(),
            o.ShippingAddress.ToDto(),
            o.DeliveryMethod.ToApi(),
            o.Status.ToApi(),
            o.Subtotal,
            o.Shipping,
            o.Total,
            o.PaymentStatus.ToApi(),
            o.Currency,
            o.CreatedAt);
}
