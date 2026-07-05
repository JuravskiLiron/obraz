using FaraX.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FaraX.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ProductService>();
        services.AddScoped<CatalogService>();
        services.AddScoped<CartService>();
        services.AddScoped<WishlistService>();
        services.AddScoped<AuthService>();
        services.AddScoped<OrderService>();
        return services;
    }
}
