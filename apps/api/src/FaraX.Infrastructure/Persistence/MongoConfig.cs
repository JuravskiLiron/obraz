using FaraX.Domain.Common;
using FaraX.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Serializers;

namespace FaraX.Infrastructure.Persistence;

/// <summary>
/// Idempotent, global Mongo serialization configuration.
/// Must run before any collection is touched.
/// </summary>
public static class MongoConfig
{
    private static readonly object Gate = new();
    private static bool _done;

    public static void Configure()
    {
        if (_done) return;
        lock (Gate)
        {
            if (_done) return;

            // Store decimals as Decimal128 (lossless for money).
            BsonSerializer.RegisterSerializer(new DecimalSerializer(BsonType.Decimal128));
            BsonSerializer.RegisterSerializer(
                new NullableSerializer<decimal>(new DecimalSerializer(BsonType.Decimal128)));

            var pack = new ConventionPack
            {
                new CamelCaseElementNameConvention(),
                new IgnoreExtraElementsConvention(true),
                new EnumRepresentationConvention(BsonType.String),
                new IgnoreIfNullConvention(false)
            };
            ConventionRegistry.Register("farax", pack, _ => true);

            RegisterRootId<Product>();
            RegisterRootId<Category>();
            RegisterRootId<Brand>();
            RegisterRootId<User>();
            RegisterRootId<Cart>();
            RegisterRootId<Wishlist>();
            RegisterRootId<Order>();

            _done = true;
        }
    }

    private static void RegisterRootId<T>() where T : Entity
    {
        if (BsonClassMap.IsClassMapRegistered(typeof(T))) return;

        BsonClassMap.RegisterClassMap<T>(cm =>
        {
            cm.AutoMap();
        });
    }
}
