using FaraX.Application.Common;
using FaraX.Domain.Entities;

namespace FaraX.Application.Common.Interfaces;

public interface IProductRepository
{
    /// <summary>Full faceted query with sorting + pagination.</summary>
    Task<PagedResult<Product>> QueryAsync(ProductFilter filter, CancellationToken ct = default);

    /// <summary>Products matching only base filters (gender/category/search/sale/new/price),
    /// ignoring size/color/brand — used to compute facet counts.</summary>
    Task<List<Product>> GetBaseFilteredAsync(ProductFilter filter, CancellationToken ct = default);

    Task<Product?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<List<Product>> GetByIdsAsync(IEnumerable<string> ids, CancellationToken ct = default);
    Task<List<Product>> GetRelatedAsync(Product product, int limit, CancellationToken ct = default);
    Task<List<Product>> SearchAsync(string term, int limit, CancellationToken ct = default);

    Task CreateAsync(Product product, CancellationToken ct = default);
    Task<bool> UpdateAsync(Product product, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
}

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync(CancellationToken ct = default);
    Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<Category?> GetByIdAsync(string id, CancellationToken ct = default);
}

public interface IBrandRepository
{
    Task<List<Brand>> GetAllAsync(CancellationToken ct = default);
    Task<Brand?> GetBySlugAsync(string slug, CancellationToken ct = default);
}

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByIdAsync(string id, CancellationToken ct = default);
    Task CreateAsync(User user, CancellationToken ct = default);
    Task<bool> UpdateAsync(User user, CancellationToken ct = default);
}

public interface ICartRepository
{
    Task<Cart?> GetByUserIdAsync(string userId, CancellationToken ct = default);
    Task<Cart?> GetByTokenAsync(string token, CancellationToken ct = default);
    Task CreateAsync(Cart cart, CancellationToken ct = default);
    Task<bool> UpdateAsync(Cart cart, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
}

public interface IWishlistRepository
{
    Task<Wishlist?> GetByUserIdAsync(string userId, CancellationToken ct = default);
    Task CreateAsync(Wishlist wishlist, CancellationToken ct = default);
    Task<bool> UpdateAsync(Wishlist wishlist, CancellationToken ct = default);
}

public interface IOrderRepository
{
    Task CreateAsync(Order order, CancellationToken ct = default);
    Task<List<Order>> GetByUserIdAsync(string userId, CancellationToken ct = default);
    Task<Order?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default);
    Task<List<Order>> GetAllAsync(CancellationToken ct = default);
    Task<bool> UpdateAsync(Order order, CancellationToken ct = default);
}
