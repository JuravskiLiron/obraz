namespace FaraX.Application.DTOs;

public record ShippingAddressDto(
    string FullName,
    string Line1,
    string Line2,
    string City,
    string PostalCode,
    string Country,
    string Phone);

public record OrderItemDto(
    string ProductId,
    string Sku,
    string Name,
    string Brand,
    string Color,
    string Size,
    string Image,
    int Qty,
    decimal Price);

public record OrderDto(
    string Id,
    string OrderNumber,
    string UserId,
    List<OrderItemDto> Items,
    ShippingAddressDto ShippingAddress,
    string DeliveryMethod,
    string Status,
    decimal Subtotal,
    decimal Shipping,
    decimal Total,
    string PaymentStatus,
    string Currency,
    DateTime CreatedAt);

public record CreateOrderRequest(
    ShippingAddressDto ShippingAddress,
    string DeliveryMethod);

public record UpdateOrderStatusRequest(string Status);
