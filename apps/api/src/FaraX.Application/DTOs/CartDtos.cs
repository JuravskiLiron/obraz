namespace FaraX.Application.DTOs;

public record CartItemDto(
    string ProductId,
    string Slug,
    string Sku,
    string Name,
    string Brand,
    string Color,
    string Size,
    string Image,
    int Qty,
    decimal Price,
    int Stock);

public record CartDto(
    string Id,
    string? UserId,
    string? CartToken,
    List<CartItemDto> Items,
    decimal Subtotal,
    int Count);

public record AddToCartRequest(string ProductId, string Sku, int Qty);
public record UpdateCartItemRequest(int Qty);
public record MergeCartRequest(string CartToken);
