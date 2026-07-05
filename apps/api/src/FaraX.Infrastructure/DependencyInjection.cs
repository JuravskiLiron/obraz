using FaraX.Application.Common.Interfaces;
using FaraX.Infrastructure.Identity;
using FaraX.Infrastructure.Persistence;
using FaraX.Infrastructure.Persistence.Repositories;
using FaraX.Infrastructure.Seed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FaraX.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var mongoUri = config["MONGODB_URI"]
            ?? throw new InvalidOperationException("MONGODB_URI is not configured.");
        var mongoDb = config["MONGO_DB"] ?? "farax";

        var jwtSecret = config["JWT_SECRET"]
            ?? throw new InvalidOperationException("JWT_SECRET is not configured.");

        services.Configure<MongoSettings>(o =>
        {
            o.ConnectionString = mongoUri;
            o.Database = mongoDb;
        });

        services.Configure<JwtSettings>(o =>
        {
            o.Secret = jwtSecret;
            o.Issuer = config["JWT_ISSUER"] ?? "farax";
            o.Audience = config["JWT_AUDIENCE"] ?? "farax-client";
            o.AccessMinutes = int.TryParse(config["JWT_ACCESS_MINUTES"], out var am) ? am : 30;
            o.RefreshDays = int.TryParse(config["JWT_REFRESH_DAYS"], out var rd) ? rd : 14;
        });

        services.AddSingleton<MongoContext>();

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IWishlistRepository, WishlistRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        services.AddScoped<DataSeeder>();

        return services;
    }
}
