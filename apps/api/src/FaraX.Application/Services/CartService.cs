using FaraX.Application.Common;
using FaraX.Application.Common.Interfaces;
using FaraX.Application.DTOs;
using FaraX.Domain.Entities;

namespace FaraX.Application.Services;

public class CartService
{
    private readonly ICartRepository _carts;
    private readonly IProductRepository _products;

    public CartService(ICartRepository carts, IProductRepository products)
    {
        _carts = carts;
        _products = products;
    }

    public async Task<CartDto> GetAsync(string? userId, string? token, CancellationToken ct = default)
    {
        var cart = await ResolveAsync(userId, token, create: false, ct);
        return await ToDtoAsync(cart, ct);
    }

    public async Task<CartDto> AddAsync(string? userId, string? token, AddToCartRequest req, CancellationToken ct = default)
    {
        if (req.Qty <= 0) throw new AppException("Quantity must be positive");

        var product = await _products.GetByIdAsync(req.ProductId, ct)
            ?? throw new NotFoundException("Product not found");

        var variant = product.Variants.FirstOrDefault(v => v.Sku == req.Sku)
            ?? throw new NotFoundException("Variant not found");

        if (variant.Stock <= 0) throw new AppException("Out of stock");

        var cart = await ResolveAsync(userId, token, create: true, ct);
        var price = variant.SalePrice ?? variant.Price;

        var existing = cart.Items.FirstOrDefault(i => i.Sku == req.Sku);
        if (existing is null)
        {
            cart.Items.Add(new CartItem
            {
                ProductId = product.Id,
                Sku = variant.Sku,
                Color = variant.Color,
                Size = variant.Size,
                Qty = Math.Min(req.Qty, variant.Stock),
                PriceSnapshot = price
            });
        }
        else
        {
            existing.Qty = Math.Min(existing.Qty + req.Qty, variant.Stock);
            existing.PriceSnapshot = price;
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _carts.UpdateAsync(cart, ct);
        return await ToDtoAsync(cart, ct);
    }

    public async Task<CartDto> UpdateItemAsync(string? userId, string? token, string sku, int qty, CancellationToken ct = default)
    {
        var cart = await ResolveAsync(userId, token, create: true, ct);
        var item = cart.Items.FirstOrDefault(i => i.Sku == sku)
            ?? throw new NotFoundException("Item not in cart");

        if (qty <= 0)
        {
            cart.Items.Remove(item);
        }
        else
        {
            var product = await _products.GetByIdAsync(item.ProductId, ct);
            var variant = product?.Variants.FirstOrDefault(v => v.Sku == sku);
            var maxStock = variant?.Stock ?? qty;
            item.Qty = Math.Min(qty, maxStock);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _carts.UpdateAsync(cart, ct);
        return await ToDtoAsync(cart, ct);
    }

    public async Task<CartDto> RemoveItemAsync(string? userId, string? token, string sku, CancellationToken ct = default)
    {
        var cart = await ResolveAsync(userId, token, create: true, ct);
        cart.Items.RemoveAll(i => i.Sku == sku);
        cart.UpdatedAt = DateTime.UtcNow;
        await _carts.UpdateAsync(cart, ct);
        return await ToDtoAsync(cart, ct);
    }

    /// <summary>Merge a guest cart (by token) into the authenticated user's cart.</summary>
    public async Task<CartDto> MergeAsync(string userId, string token, CancellationToken ct = default)
    {
        var userCart = await ResolveAsync(userId, null, create: true, ct);
        var guestCart = string.IsNullOrWhiteSpace(token) ? null : await _carts.GetByTokenAsync(token, ct);

        if (guestCart is not null && guestCart.Id != userCart.Id)
        {
            foreach (var gi in guestCart.Items)
            {
                var existing = userCart.Items.FirstOrDefault(i => i.Sku == gi.Sku);
                var product = await _products.GetByIdAsync(gi.ProductId, ct);
                var variant = product?.Variants.FirstOrDefault(v => v.Sku == gi.Sku);
                var maxStock = variant?.Stock ?? gi.Qty;

                if (existing is null)
                {
                    gi.Qty = Math.Min(gi.Qty, maxStock);
                    userCart.Items.Add(gi);
                }
                else
                {
                    existing.Qty = Math.Min(existing.Qty + gi.Qty, maxStock);
                }
            }

            userCart.UpdatedAt = DateTime.UtcNow;
            await _carts.UpdateAsync(userCart, ct);
            await _carts.DeleteAsync(guestCart.Id, ct);
        }

        return await ToDtoAsync(userCart, ct);
    }

    // ---- internals ----

    private async Task<Cart> ResolveAsync(string? userId, string? token, bool create, CancellationToken ct)
    {
        Cart? cart = null;

        if (!string.IsNullOrWhiteSpace(userId))
            cart = await _carts.GetByUserIdAsync(userId!, ct);
        else if (!string.IsNullOrWhiteSpace(token))
            cart = await _carts.GetByTokenAsync(token!, ct);

        if (cart is not null) return cart;

        cart = new Cart
        {
            UserId = string.IsNullOrWhiteSpace(userId) ? null : userId,
            CartToken = string.IsNullOrWhiteSpace(userId) ? token : null,
            Items = new()
        };

        if (create)
            await _carts.CreateAsync(cart, ct);

        return cart;
    }

    private async Task<CartDto> ToDtoAsync(Cart cart, CancellationToken ct)
    {
        var items = new List<CartItemDto>();
        decimal subtotal = 0;
        int count = 0;

        if (cart.Items.Count > 0)
        {
            var products = await _products.GetByIdsAsync(cart.Items.Select(i => i.ProductId).Distinct(), ct);
            var byId = products.ToDictionary(p => p.Id);

            foreach (var item in cart.Items)
            {
                byId.TryGetValue(item.ProductId, out var product);
                var variant = product?.Variants.FirstOrDefault(v => v.Sku == item.Sku);
                var image = product?.Colors
                    .FirstOrDefault(c => c.Name == item.Color)?.Images.FirstOrDefault()?.Url
                    ?? product?.Colors.FirstOrDefault()?.Images.FirstOrDefault()?.Url
                    ?? string.Empty;

                items.Add(new CartItemDto(
                    item.ProductId,
                    product?.Slug ?? string.Empty,
                    item.Sku,
                    product?.Name ?? "Unavailable",
                    product?.Brand ?? string.Empty,
                    item.Color,
                    item.Size,
                    image,
                    item.Qty,
                    item.PriceSnapshot,
                    variant?.Stock ?? 0));

                subtotal += item.PriceSnapshot * item.Qty;
                count += item.Qty;
            }
        }

        return new CartDto(cart.Id, cart.UserId, cart.CartToken, items, subtotal, count);
    }
}
