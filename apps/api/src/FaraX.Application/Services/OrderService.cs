using FaraX.Application.Common;
using FaraX.Application.Common.Interfaces;
using FaraX.Application.DTOs;
using FaraX.Domain.Entities;
using FaraX.Domain.Enums;

namespace FaraX.Application.Services;

public class OrderService
{
    private readonly IOrderRepository _orders;
    private readonly ICartRepository _carts;
    private readonly IProductRepository _products;

    public OrderService(IOrderRepository orders, ICartRepository carts, IProductRepository products)
    {
        _orders = orders;
        _carts = carts;
        _products = products;
    }

    public async Task<OrderDto> CheckoutAsync(string userId, CreateOrderRequest req, CancellationToken ct = default)
    {
        var cart = await _carts.GetByUserIdAsync(userId, ct);
        if (cart is null || cart.Items.Count == 0)
            throw new AppException("Cart is empty");

        var products = await _products.GetByIdsAsync(cart.Items.Select(i => i.ProductId).Distinct(), ct);
        var byId = products.ToDictionary(p => p.Id);

        var items = new List<OrderItem>();
        decimal subtotal = 0;
        var currency = "USD";

        foreach (var ci in cart.Items)
        {
            if (!byId.TryGetValue(ci.ProductId, out var product))
                throw new AppException("A product in the cart is no longer available");

            var variant = product.Variants.FirstOrDefault(v => v.Sku == ci.Sku)
                ?? throw new AppException($"Variant {ci.Sku} is no longer available");

            if (variant.Stock < ci.Qty)
                throw new AppException($"Not enough stock for {product.Name} ({ci.Size})");

            var image = product.Colors.FirstOrDefault(c => c.Name == ci.Color)?.Images.FirstOrDefault()?.Url
                ?? product.Colors.FirstOrDefault()?.Images.FirstOrDefault()?.Url
                ?? string.Empty;

            currency = product.Currency;

            items.Add(new OrderItem
            {
                ProductId = product.Id,
                Sku = ci.Sku,
                Name = product.Name,
                Brand = product.Brand,
                Color = ci.Color,
                Size = ci.Size,
                Image = image,
                Qty = ci.Qty,
                Price = ci.PriceSnapshot
            });

            subtotal += ci.PriceSnapshot * ci.Qty;
        }

        var method = Mappings.ParseDeliveryMethod(req.DeliveryMethod);
        var shipping = ShippingFor(method, subtotal);

        var order = new Order
        {
            OrderNumber = GenerateOrderNumber(),
            UserId = userId,
            Items = items,
            ShippingAddress = new ShippingAddress
            {
                FullName = req.ShippingAddress.FullName,
                Line1 = req.ShippingAddress.Line1,
                Line2 = req.ShippingAddress.Line2,
                City = req.ShippingAddress.City,
                PostalCode = req.ShippingAddress.PostalCode,
                Country = req.ShippingAddress.Country,
                Phone = req.ShippingAddress.Phone
            },
            DeliveryMethod = method,
            Subtotal = subtotal,
            Shipping = shipping,
            Total = subtotal + shipping,
            Currency = currency,
            // Mock payment: mark as paid immediately.
            Status = OrderStatus.Paid,
            PaymentStatus = PaymentStatus.Paid
        };

        await _orders.CreateAsync(order, ct);

        // Decrement stock then clear the cart.
        foreach (var ci in cart.Items)
        {
            if (byId.TryGetValue(ci.ProductId, out var product))
            {
                var variant = product.Variants.FirstOrDefault(v => v.Sku == ci.Sku);
                if (variant is not null)
                {
                    variant.Stock = Math.Max(0, variant.Stock - ci.Qty);
                    product.UpdatedAt = DateTime.UtcNow;
                    await _products.UpdateAsync(product, ct);
                }
            }
        }

        cart.Items.Clear();
        cart.UpdatedAt = DateTime.UtcNow;
        await _carts.UpdateAsync(cart, ct);

        return order.ToDto();
    }

    public async Task<List<OrderDto>> ListByUserAsync(string userId, CancellationToken ct = default)
    {
        var orders = await _orders.GetByUserIdAsync(userId, ct);
        return orders.OrderByDescending(o => o.CreatedAt).Select(o => o.ToDto()).ToList();
    }

    public async Task<OrderDto> GetByIdAsync(string userId, string id, CancellationToken ct = default)
    {
        var order = await _orders.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Order not found");
        if (order.UserId != userId)
            throw new NotFoundException("Order not found");
        return order.ToDto();
    }

    public async Task<List<OrderDto>> GetAllAsync(CancellationToken ct = default)
    {
        var orders = await _orders.GetAllAsync(ct);
        return orders.OrderByDescending(o => o.CreatedAt).Select(o => o.ToDto()).ToList();
    }

    public async Task<OrderDto> UpdateStatusAsync(string id, string status, CancellationToken ct = default)
    {
        var order = await _orders.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Order not found");

        order.Status = Mappings.ParseOrderStatus(status);
        order.UpdatedAt = DateTime.UtcNow;
        await _orders.UpdateAsync(order, ct);
        return order.ToDto();
    }

    private static decimal ShippingFor(DeliveryMethod method, decimal subtotal) => method switch
    {
        DeliveryMethod.Express => 9.99m,
        DeliveryMethod.PickupPoint => 2.99m,
        _ => subtotal >= 75m ? 0m : 4.99m
    };

    private static string GenerateOrderNumber()
    {
        var rnd = Random.Shared.Next(1000, 9999);
        return $"FX{DateTime.UtcNow:yyMMdd}{rnd}";
    }
}
