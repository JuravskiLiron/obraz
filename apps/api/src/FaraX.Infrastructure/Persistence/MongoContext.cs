using FaraX.Domain.Entities;
using FaraX.Infrastructure.Identity;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace FaraX.Infrastructure.Persistence;

public class MongoContext
{
    public IMongoCollection<Product> Products { get; }
    public IMongoCollection<Category> Categories { get; }
    public IMongoCollection<Brand> Brands { get; }
    public IMongoCollection<User> Users { get; }
    public IMongoCollection<Cart> Carts { get; }
    public IMongoCollection<Wishlist> Wishlists { get; }
    public IMongoCollection<Order> Orders { get; }

    public MongoContext(IOptions<MongoSettings> options)
    {
        MongoConfig.Configure();

        var settings = options.Value;
        var client = new MongoClient(settings.ConnectionString);
        var db = client.GetDatabase(settings.Database);

        Products = db.GetCollection<Product>("products");
        Categories = db.GetCollection<Category>("categories");
        Brands = db.GetCollection<Brand>("brands");
        Users = db.GetCollection<User>("users");
        Carts = db.GetCollection<Cart>("carts");
        Wishlists = db.GetCollection<Wishlist>("wishlists");
        Orders = db.GetCollection<Order>("orders");
    }

    public async Task EnsureIndexesAsync(CancellationToken ct = default)
    {
        await Products.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.Slug),
                new CreateIndexOptions { Unique = true, Name = "ux_product_slug" }),
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.CategoryId),
                new CreateIndexOptions { Name = "ix_product_category" }),
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.Gender),
                new CreateIndexOptions { Name = "ix_product_gender" }),
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.IsActive),
                new CreateIndexOptions { Name = "ix_product_active" }),
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.Brand),
                new CreateIndexOptions { Name = "ix_product_brand" })
        }, ct);

        await Categories.Indexes.CreateOneAsync(
            new CreateIndexModel<Category>(
                Builders<Category>.IndexKeys.Ascending(c => c.Slug),
                new CreateIndexOptions { Name = "ix_category_slug" }), cancellationToken: ct);

        await Brands.Indexes.CreateOneAsync(
            new CreateIndexModel<Brand>(
                Builders<Brand>.IndexKeys.Ascending(b => b.Slug),
                new CreateIndexOptions { Unique = true, Name = "ux_brand_slug" }), cancellationToken: ct);

        await Users.Indexes.CreateOneAsync(
            new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Unique = true, Name = "ux_user_email" }), cancellationToken: ct);

        await Carts.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Cart>(
                Builders<Cart>.IndexKeys.Ascending(c => c.CartToken),
                new CreateIndexOptions { Name = "ix_cart_token", Sparse = true }),
            new CreateIndexModel<Cart>(
                Builders<Cart>.IndexKeys.Ascending(c => c.UserId),
                new CreateIndexOptions { Name = "ix_cart_user", Sparse = true })
        }, ct);

        await Orders.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Order>(
                Builders<Order>.IndexKeys.Ascending(o => o.OrderNumber),
                new CreateIndexOptions { Unique = true, Name = "ux_order_number" }),
            new CreateIndexModel<Order>(
                Builders<Order>.IndexKeys.Ascending(o => o.UserId),
                new CreateIndexOptions { Name = "ix_order_user" })
        }, ct);
    }
}
