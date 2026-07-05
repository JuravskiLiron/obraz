using FaraX.Domain.Common;

namespace FaraX.Domain.Entities;

public class Brand : Entity
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
