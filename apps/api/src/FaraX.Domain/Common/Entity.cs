using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FaraX.Domain.Common;

/// <summary>Base type for all persisted root entities.</summary>
public abstract class Entity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
