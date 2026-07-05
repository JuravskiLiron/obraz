using FaraX.Application.Common.Interfaces;
using FaraX.Application.DTOs;
using FaraX.Domain.Entities;

namespace FaraX.Application.Services;

public class WishlistService
{
    private readonly IWishlistRepository _wishlists;
    private readonly IProductRepository _products;

    public WishlistService(IWishlistRepository wishlists, IProductRepository products)
    {
        _wishlists = wishlists;
        _products = products;
    }

    public async Task<WishlistDto> GetAsync(string userId, CancellationToken ct = default)
    {
        var wishlist = await ResolveAsync(userId, create: false, ct);
        return await ToDtoAsync(wishlist, ct);
    }

    public async Task<WishlistDto> AddAsync(string userId, string productId, CancellationToken ct = default)
    {
        var wishlist = await ResolveAsync(userId, create: true, ct);

        if (wishlist.Items.All(i => i.ProductId != productId))
        {
            wishlist.Items.Add(new WishlistItem { ProductId = productId, AddedAt = DateTime.UtcNow });
            wishlist.UpdatedAt = DateTime.UtcNow;
            await _wishlists.UpdateAsync(wishlist, ct);
        }

        return await ToDtoAsync(wishlist, ct);
    }

    public async Task<WishlistDto> RemoveAsync(string userId, string productId, CancellationToken ct = default)
    {
        var wishlist = await ResolveAsync(userId, create: true, ct);
        wishlist.Items.RemoveAll(i => i.ProductId == productId);
        wishlist.UpdatedAt = DateTime.UtcNow;
        await _wishlists.UpdateAsync(wishlist, ct);
        return await ToDtoAsync(wishlist, ct);
    }

    private async Task<Wishlist> ResolveAsync(string userId, bool create, CancellationToken ct)
    {
        var wishlist = await _wishlists.GetByUserIdAsync(userId, ct);
        if (wishlist is not null) return wishlist;

        wishlist = new Wishlist { UserId = userId, Items = new() };
        if (create) await _wishlists.CreateAsync(wishlist, ct);
        return wishlist;
    }

    private async Task<WishlistDto> ToDtoAsync(Wishlist wishlist, CancellationToken ct)
    {
        var items = new List<ProductSummaryDto>();

        if (wishlist.Items.Count > 0)
        {
            var ordered = wishlist.Items.OrderByDescending(i => i.AddedAt).Select(i => i.ProductId).ToList();
            var products = await _products.GetByIdsAsync(ordered, ct);
            var byId = products.ToDictionary(p => p.Id);

            foreach (var id in ordered)
                if (byId.TryGetValue(id, out var p))
                    items.Add(p.ToSummary());
        }

        return new WishlistDto(wishlist.Id, wishlist.UserId, items);
    }
}
