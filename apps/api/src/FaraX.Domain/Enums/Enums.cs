namespace FaraX.Domain.Enums;

public enum Gender
{
    Women,
    Men,
    Unisex
}

public enum UserRole
{
    Customer,
    Admin
}

public enum OrderStatus
{
    Pending,
    Paid,
    Shipped,
    Delivered,
    Cancelled
}

public enum PaymentStatus
{
    Unpaid,
    Paid,
    Refunded
}

public enum DeliveryMethod
{
    Standard,
    Express,
    PickupPoint
}
