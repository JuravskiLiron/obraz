using FaraX.Domain.Common;

namespace FaraX.Domain.Entities;

public class Cart : Entity
{
    public string? UserId { get; set; }
    public string? CartToken { get; set; }
    public List<CartItem> Items { get; set; } = new();
}

public class CartItem
{
    public string ProductId { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Qty { get; set; }
    public decimal PriceSnapshot { get; set; }
}
