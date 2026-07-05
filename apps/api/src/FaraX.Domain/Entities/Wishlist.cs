using FaraX.Domain.Common;

namespace FaraX.Domain.Entities;

public class Wishlist : Entity
{
    public string UserId { get; set; } = string.Empty;
    public List<WishlistItem> Items { get; set; } = new();
}

public class WishlistItem
{
    public string ProductId { get; set; } = string.Empty;
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
