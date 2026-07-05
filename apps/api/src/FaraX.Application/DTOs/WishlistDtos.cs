namespace FaraX.Application.DTOs;

public record WishlistDto(string Id, string UserId, List<ProductSummaryDto> Items);
public record AddWishlistRequest(string ProductId);
