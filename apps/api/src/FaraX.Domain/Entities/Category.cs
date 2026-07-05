using FaraX.Domain.Common;
using FaraX.Domain.Enums;

namespace FaraX.Domain.Entities;

public class Category : Entity
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ParentId { get; set; }
    public Gender Gender { get; set; } = Gender.Women;
    public int Order { get; set; }
    public string Image { get; set; } = string.Empty;
}
