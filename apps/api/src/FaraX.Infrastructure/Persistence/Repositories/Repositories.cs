using FaraX.Application.Common.Interfaces;
using FaraX.Domain.Entities;
using MongoDB.Driver;

namespace FaraX.Infrastructure.Persistence.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly IMongoCollection<Category> _col;
    public CategoryRepository(MongoContext ctx) => _col = ctx.Categories;

    public async Task<List<Category>> GetAllAsync(CancellationToken ct = default) =>
        await _col.Find(FilterDefinition<Category>.Empty).ToListAsync(ct);

    public async Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        await _col.Find(c => c.Slug == slug).FirstOrDefaultAsync(ct);

    public async Task<Category?> GetByIdAsync(string id, CancellationToken ct = default) =>
        await _col.Find(c => c.Id == id).FirstOrDefaultAsync(ct);
}

public class BrandRepository : IBrandRepository
{
    private readonly IMongoCollection<Brand> _col;
    public BrandRepository(MongoContext ctx) => _col = ctx.Brands;

    public async Task<List<Brand>> GetAllAsync(CancellationToken ct = default) =>
        await _col.Find(FilterDefinition<Brand>.Empty).ToListAsync(ct);

    public async Task<Brand?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        await _col.Find(b => b.Slug == slug).FirstOrDefaultAsync(ct);
}

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _col;
    public UserRepository(MongoContext ctx) => _col = ctx.Users;

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        await _col.Find(u => u.Email == email).FirstOrDefaultAsync(ct);

    public async Task<User?> GetByIdAsync(string id, CancellationToken ct = default) =>
        await _col.Find(u => u.Id == id).FirstOrDefaultAsync(ct);

    public async Task CreateAsync(User user, CancellationToken ct = default) =>
        await _col.InsertOneAsync(user, cancellationToken: ct);

    public async Task<bool> UpdateAsync(User user, CancellationToken ct = default)
    {
        var res = await _col.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: ct);
        return res.MatchedCount > 0;
    }
}

public class CartRepository : ICartRepository
{
    private readonly IMongoCollection<Cart> _col;
    public CartRepository(MongoContext ctx) => _col = ctx.Carts;

    public async Task<Cart?> GetByUserIdAsync(string userId, CancellationToken ct = default) =>
        await _col.Find(c => c.UserId == userId).FirstOrDefaultAsync(ct);

    public async Task<Cart?> GetByTokenAsync(string token, CancellationToken ct = default) =>
        await _col.Find(c => c.CartToken == token).FirstOrDefaultAsync(ct);

    public async Task CreateAsync(Cart cart, CancellationToken ct = default) =>
        await _col.InsertOneAsync(cart, cancellationToken: ct);

    public async Task<bool> UpdateAsync(Cart cart, CancellationToken ct = default)
    {
        var res = await _col.ReplaceOneAsync(c => c.Id == cart.Id, cart, cancellationToken: ct);
        return res.MatchedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var res = await _col.DeleteOneAsync(c => c.Id == id, ct);
        return res.DeletedCount > 0;
    }
}

public class WishlistRepository : IWishlistRepository
{
    private readonly IMongoCollection<Wishlist> _col;
    public WishlistRepository(MongoContext ctx) => _col = ctx.Wishlists;

    public async Task<Wishlist?> GetByUserIdAsync(string userId, CancellationToken ct = default) =>
        await _col.Find(w => w.UserId == userId).FirstOrDefaultAsync(ct);

    public async Task CreateAsync(Wishlist wishlist, CancellationToken ct = default) =>
        await _col.InsertOneAsync(wishlist, cancellationToken: ct);

    public async Task<bool> UpdateAsync(Wishlist wishlist, CancellationToken ct = default)
    {
        var res = await _col.ReplaceOneAsync(w => w.Id == wishlist.Id, wishlist, cancellationToken: ct);
        return res.MatchedCount > 0;
    }
}

public class OrderRepository : IOrderRepository
{
    private readonly IMongoCollection<Order> _col;
    public OrderRepository(MongoContext ctx) => _col = ctx.Orders;

    public async Task CreateAsync(Order order, CancellationToken ct = default) =>
        await _col.InsertOneAsync(order, cancellationToken: ct);

    public async Task<List<Order>> GetByUserIdAsync(string userId, CancellationToken ct = default) =>
        await _col.Find(o => o.UserId == userId).ToListAsync(ct);

    public async Task<Order?> GetByIdAsync(string id, CancellationToken ct = default) =>
        await _col.Find(o => o.Id == id).FirstOrDefaultAsync(ct);

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default) =>
        await _col.Find(o => o.OrderNumber == orderNumber).FirstOrDefaultAsync(ct);

    public async Task<List<Order>> GetAllAsync(CancellationToken ct = default) =>
        await _col.Find(FilterDefinition<Order>.Empty).ToListAsync(ct);

    public async Task<bool> UpdateAsync(Order order, CancellationToken ct = default)
    {
        var res = await _col.ReplaceOneAsync(o => o.Id == order.Id, order, cancellationToken: ct);
        return res.MatchedCount > 0;
    }
}
