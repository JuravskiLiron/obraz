using FaraX.Domain.Common;
using FaraX.Domain.Enums;

namespace FaraX.Domain.Entities;

public class Order : Entity
{
    public string OrderNumber { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public List<OrderItem> Items { get; set; } = new();
    public ShippingAddress ShippingAddress { get; set; } = new();
    public DeliveryMethod DeliveryMethod { get; set; } = DeliveryMethod.Standard;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal Subtotal { get; set; }
    public decimal Shipping { get; set; }
    public decimal Total { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    public string Currency { get; set; } = "USD";
}

public class OrderItem
{
    public string ProductId { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public int Qty { get; set; }
    public decimal Price { get; set; }
}

public class ShippingAddress
{
    public string FullName { get; set; } = string.Empty;
    public string Line1 { get; set; } = string.Empty;
    public string Line2 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}
