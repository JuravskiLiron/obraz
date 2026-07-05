using System.Text.RegularExpressions;
using FaraX.Application.Common;
using FaraX.Application.Common.Interfaces;
using FaraX.Domain.Entities;
using MongoDB.Driver;

namespace FaraX.Infrastructure.Persistence.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly IMongoCollection<Product> _col;

    public ProductRepository(MongoContext ctx) => _col = ctx.Products;

    public async Task<PagedResult<Product>> QueryAsync(ProductFilter filter, CancellationToken ct = default)
    {
        var f = BuildFull(filter);
        var sort = BuildSort(filter.Sort);

        var total = await _col.CountDocumentsAsync(f, cancellationToken: ct);

        var items = await _col.Find(f)
            .Sort(sort)
            .Skip(filter.Offset)
            .Limit(filter.Limit)
            .ToListAsync(ct);

        return new PagedResult<Product>
        {
            Items = items,
            Total = total,
            Limit = filter.Limit,
            Offset = filter.Offset
        };
    }

    public async Task<List<Product>> GetBaseFilteredAsync(ProductFilter filter, CancellationToken ct = default)
    {
        var f = BuildBase(filter);
        return await _col.Find(f).Limit(2000).ToListAsync(ct);
    }

    public async Task<Product?> GetByIdAsync(string id, CancellationToken ct = default) =>
        await _col.Find(p => p.Id == id).FirstOrDefaultAsync(ct);

    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        await _col.Find(p => p.Slug == slug && p.IsActive).FirstOrDefaultAsync(ct);

    public async Task<List<Product>> GetByIdsAsync(IEnumerable<string> ids, CancellationToken ct = default)
    {
        var list = ids.Distinct().ToList();
        if (list.Count == 0) return new();
        return await _col.Find(Builders<Product>.Filter.In(p => p.Id, list)).ToListAsync(ct);
    }

    public async Task<List<Product>> GetRelatedAsync(Product product, int limit, CancellationToken ct = default)
    {
        var f = Builders<Product>.Filter.And(
            Builders<Product>.Filter.Eq(p => p.IsActive, true),
            Builders<Product>.Filter.Eq(p => p.CategoryId, product.CategoryId),
            Builders<Product>.Filter.Ne(p => p.Id, product.Id));

        var related = await _col.Find(f).Limit(limit).ToListAsync(ct);

        if (related.Count < limit)
        {
            var extra = await _col.Find(Builders<Product>.Filter.And(
                    Builders<Product>.Filter.Eq(p => p.IsActive, true),
                    Builders<Product>.Filter.Eq(p => p.Gender, product.Gender),
                    Builders<Product>.Filter.Ne(p => p.Id, product.Id)))
                .Limit(limit * 2)
                .ToListAsync(ct);

            foreach (var e in extra)
            {
                if (related.Count >= limit) break;
                if (related.All(r => r.Id != e.Id)) related.Add(e);
            }
        }

        return related.Take(limit).ToList();
    }

    public async Task<List<Product>> SearchAsync(string term, int limit, CancellationToken ct = default)
    {
        var rx = new MongoDB.Bson.BsonRegularExpression(Regex.Escape(term), "i");
        var f = Builders<Product>.Filter.And(
            Builders<Product>.Filter.Eq(p => p.IsActive, true),
            Builders<Product>.Filter.Or(
                Builders<Product>.Filter.Regex(p => p.Name, rx),
                Builders<Product>.Filter.Regex(p => p.Brand, rx)));

        return await _col.Find(f).Limit(limit).ToListAsync(ct);
    }

    public async Task CreateAsync(Product product, CancellationToken ct = default) =>
        await _col.InsertOneAsync(product, cancellationToken: ct);

    public async Task<bool> UpdateAsync(Product product, CancellationToken ct = default)
    {
        var res = await _col.ReplaceOneAsync(p => p.Id == product.Id, product, cancellationToken: ct);
        return res.ModifiedCount > 0 || res.MatchedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var res = await _col.DeleteOneAsync(p => p.Id == id, ct);
        return res.DeletedCount > 0;
    }

    // ---- filter builders ----

    private static FilterDefinition<Product> BuildBase(ProductFilter filter)
    {
        var b = Builders<Product>.Filter;
        var clauses = new List<FilterDefinition<Product>> { b.Eq(p => p.IsActive, true) };

        if (filter.Gender is not null)
            clauses.Add(b.Eq(p => p.Gender, filter.Gender.Value));

        if (filter.CategoryIds.Count > 0)
            clauses.Add(b.In(p => p.CategoryId, filter.CategoryIds));

        if (filter.MinPrice is not null)
            clauses.Add(b.Gte(p => p.Price, filter.MinPrice.Value));

        if (filter.MaxPrice is not null)
            clauses.Add(b.Lte(p => p.Price, filter.MaxPrice.Value));

        if (filter.OnSale is true)
            clauses.Add(b.Ne(p => p.SalePrice, null));

        if (filter.IsNew is true)
            clauses.Add(b.Eq(p => p.IsNew, true));

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var rx = new MongoDB.Bson.BsonRegularExpression(Regex.Escape(filter.Search.Trim()), "i");
            clauses.Add(b.Or(
                b.Regex(p => p.Name, rx),
                b.Regex(p => p.Brand, rx)));
        }

        return b.And(clauses);
    }

    private static FilterDefinition<Product> BuildFull(ProductFilter filter)
    {
        var b = Builders<Product>.Filter;
        var clauses = new List<FilterDefinition<Product>> { BuildBase(filter) };

        if (filter.Sizes.Count > 0)
            clauses.Add(b.ElemMatch(p => p.Variants, b2 => filter.Sizes.Contains(b2.Size)));

        if (filter.Colors.Count > 0)
            clauses.Add(b.ElemMatch(p => p.Colors, c => filter.Colors.Contains(c.Name)));

        if (filter.Brands.Count > 0)
            clauses.Add(b.In(p => p.Brand, filter.Brands));

        return b.And(clauses);
    }

    private static SortDefinition<Product> BuildSort(ProductSort sort)
    {
        var s = Builders<Product>.Sort;
        return sort switch
        {
            ProductSort.NewIn => s.Descending(p => p.CreatedAt),
            ProductSort.PriceAsc => s.Ascending(p => p.Price),
            ProductSort.PriceDesc => s.Descending(p => p.Price),
            _ => s.Descending(p => p.IsNew).Descending(p => p.Rating).Descending(p => p.CreatedAt)
        };
    }
}
