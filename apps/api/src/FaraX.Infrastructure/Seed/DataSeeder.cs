using FaraX.Application.Common.Interfaces;
using FaraX.Domain.Entities;
using FaraX.Domain.Enums;
using FaraX.Infrastructure.Persistence;
using MongoDB.Driver;

namespace FaraX.Infrastructure.Seed;

public class DataSeeder
{
    private readonly MongoContext _ctx;
    private readonly IPasswordHasher _hasher;

    public DataSeeder(MongoContext ctx, IPasswordHasher hasher)
    {
        _ctx = ctx;
        _hasher = hasher;
    }

    public async Task RunAsync(bool reset, CancellationToken ct = default)
    {
        if (reset)
        {
            await _ctx.Products.DeleteManyAsync(FilterDefinition<Product>.Empty, ct);
            await _ctx.Categories.DeleteManyAsync(FilterDefinition<Category>.Empty, ct);
            await _ctx.Brands.DeleteManyAsync(FilterDefinition<Brand>.Empty, ct);
            await _ctx.Carts.DeleteManyAsync(FilterDefinition<Cart>.Empty, ct);
            await _ctx.Wishlists.DeleteManyAsync(FilterDefinition<Wishlist>.Empty, ct);
            await _ctx.Orders.DeleteManyAsync(FilterDefinition<Order>.Empty, ct);
            Console.WriteLine("Collections reset.");
        }

        await _ctx.EnsureIndexesAsync(ct);

        var existing = await _ctx.Products.CountDocumentsAsync(FilterDefinition<Product>.Empty, cancellationToken: ct);
        if (existing > 0 && !reset)
        {
            Console.WriteLine($"Products already present ({existing}). Use `-- seed --reset` to wipe and reseed.");
            await SeedAdminAsync(ct);
            return;
        }

        var brands = await SeedBrandsAsync(ct);
        var categories = await SeedCategoriesAsync(ct);
        await SeedProductsAsync(brands, categories, ct);
        await SeedAdminAsync(ct);

        Console.WriteLine("Seed complete.");
    }

    private async Task<List<Brand>> SeedBrandsAsync(CancellationToken ct)
    {
        var names = new[]
        {
            "Northline", "Maison Cler", "Atlas & Co", "Verve Studio",
            "Halcyon", "Rune Athletic", "Pale Society", "Kestrel"
        };

        var brands = names.Select((n, i) => new Brand
        {
            Slug = Slugify(n),
            Name = n,
            LogoUrl = $"https://picsum.photos/seed/brand-{i}/200/200",
            Description = $"{n} — contemporary essentials with a clean, modern aesthetic."
        }).ToList();

        await _ctx.Brands.InsertManyAsync(brands, cancellationToken: ct);
        Console.WriteLine($"Inserted {brands.Count} brands.");
        return brands;
    }

    private async Task<List<Category>> SeedCategoriesAsync(CancellationToken ct)
    {
        var categories = new List<Category>();

        void AddTree(Gender gender)
        {
            var roots = gender == Gender.Women
                ? new (string name, string[] kids)[]
                {
                    ("Clothing", new[] { "Dresses", "Tops", "Knitwear", "Trousers" }),
                    ("Shoes", new[] { "Trainers", "Boots", "Heels" }),
                    ("Accessories", new[] { "Bags", "Jewellery" })
                }
                : new (string name, string[] kids)[]
                {
                    ("Clothing", new[] { "T-Shirts", "Shirts", "Hoodies", "Trousers" }),
                    ("Shoes", new[] { "Trainers", "Boots" }),
                    ("Accessories", new[] { "Caps", "Watches" })
                };

            int order = 0;
            foreach (var (name, kids) in roots)
            {
                var parent = new Category
                {
                    Slug = $"{gender.ToString().ToLowerInvariant()}-{Slugify(name)}",
                    Name = name,
                    ParentId = null,
                    Gender = gender,
                    Order = order++,
                    Image = $"https://picsum.photos/seed/cat-{Slugify(name)}-{gender}/600/800"
                };
                categories.Add(parent);

                int childOrder = 0;
                foreach (var kid in kids)
                {
                    categories.Add(new Category
                    {
                        // ParentId is wired after insert (ids are assigned on insert).
                        Slug = $"{gender.ToString().ToLowerInvariant()}-{Slugify(kid)}",
                        Name = kid,
                        ParentId = parent.Slug, // temporary marker (slug); rewired below
                        Gender = gender,
                        Order = childOrder++,
                        Image = $"https://picsum.photos/seed/cat-{Slugify(kid)}-{gender}/600/800"
                    });
                }
            }
        }

        AddTree(Gender.Women);
        AddTree(Gender.Men);

        // Insert roots first so they get ids, then rewire children's ParentId from slug→id.
        var roots = categories.Where(c => c.ParentId is null).ToList();
        await _ctx.Categories.InsertManyAsync(roots, cancellationToken: ct);

        var slugToId = roots.ToDictionary(r => r.Slug, r => r.Id);

        var children = categories.Where(c => c.ParentId is not null).ToList();
        foreach (var child in children)
            child.ParentId = slugToId.TryGetValue(child.ParentId!, out var id) ? id : null;

        await _ctx.Categories.InsertManyAsync(children, cancellationToken: ct);

        Console.WriteLine($"Inserted {categories.Count} categories.");
        return categories;
    }

    private async Task SeedProductsAsync(List<Brand> brands, List<Category> categories, CancellationToken ct)
    {
        // Only leaf categories (those that are someone's parent are excluded).
        var parentIds = categories.Where(c => c.ParentId is not null).Select(c => c.ParentId!).ToHashSet();
        var leaves = categories.Where(c => !parentIds.Contains(c.Id)).ToList();

        var colorPalette = new (string Name, string Hex)[]
        {
            ("Black", "#1a1a1a"), ("White", "#f5f5f0"), ("Navy", "#1f2a44"),
            ("Sand", "#cdbba4"), ("Olive", "#5b5e44"), ("Burgundy", "#5e2230"),
            ("Grey", "#8a8a8a"), ("Cream", "#e9e2d0"), ("Rust", "#9c4a2b"),
            ("Forest", "#27432f")
        };

        var sizesClothing = new[] { "XS", "S", "M", "L", "XL" };
        var sizesShoes = new[] { "39", "40", "41", "42", "43", "44" };

        var nameAdjectives = new[] { "Relaxed", "Tailored", "Oversized", "Slim", "Cropped", "Classic", "Ribbed", "Pleated", "Boxy", "Longline" };
        var rnd = new Random(42);

        var products = new List<Product>();
        int counter = 0;

        // ~3 products per leaf category, guaranteeing >12 total with rich variants.
        foreach (var cat in leaves)
        {
            var brandPool = brands.OrderBy(_ => rnd.Next()).Take(3).ToList();
            int perCat = 3;

            for (int n = 0; n < perCat; n++)
            {
                counter++;
                var brand = brandPool[n % brandPool.Count];
                var adj = nameAdjectives[rnd.Next(nameAdjectives.Length)];
                var baseName = $"{adj} {Singular(cat.Name)}";
                var slug = $"{Slugify(brand.Name)}-{Slugify(baseName)}-{counter}";

                bool isShoes = cat.Name is "Trainers" or "Boots" or "Heels";
                var sizes = isShoes ? sizesShoes : sizesClothing;

                // 2 or 3 colors per product.
                int colorCount = rnd.Next(2, 4);
                var chosenColors = colorPalette.OrderBy(_ => rnd.Next()).Take(colorCount).ToList();

                decimal basePrice = isShoes ? rnd.Next(45, 160) : rnd.Next(15, 120);
                basePrice = Math.Round(basePrice + 0.99m - 1m, 2) + 0.99m; // X.99 pricing
                bool onSale = counter % 3 == 0;
                decimal? salePrice = onSale ? Math.Round(basePrice * 0.7m, 2) : null;
                bool isNew = counter % 4 == 0;

                var colors = new List<ProductColor>();
                var variants = new List<ProductVariant>();

                foreach (var (cname, chex) in chosenColors)
                {
                    var seedBase = $"{slug}-{Slugify(cname)}";
                    colors.Add(new ProductColor
                    {
                        Name = cname,
                        Hex = chex,
                        Images = new()
                        {
                            // Portrait 3:4 fashion photos (deterministic per image).
                            // The web ProductImage component falls back gracefully if any URL 404s.
                            new ProductImage { Url = ImageUrl(seedBase, 1), Alt = $"{baseName} in {cname} — front" },
                            new ProductImage { Url = ImageUrl(seedBase, 2), Alt = $"{baseName} in {cname} — alt" },
                            new ProductImage { Url = ImageUrl(seedBase, 3), Alt = $"{baseName} in {cname} — detail" }
                        }
                    });

                    foreach (var size in sizes)
                    {
                        variants.Add(new ProductVariant
                        {
                            Sku = $"{slug}-{Slugify(cname)}-{size}".ToUpperInvariant(),
                            Color = cname,
                            Size = size,
                            Stock = rnd.Next(0, 12),
                            Price = basePrice,
                            SalePrice = salePrice
                        });
                    }
                }

                // Guarantee at least one low-stock variant on some products for the "Only N left" badge.
                if (counter % 5 == 0 && variants.Count > 0)
                    variants[0].Stock = rnd.Next(1, 3);

                products.Add(new Product
                {
                    Slug = slug,
                    Name = baseName,
                    Brand = brand.Name,
                    BrandId = brand.Id,
                    Gender = cat.Gender,
                    CategoryId = cat.Id,
                    Description = $"A {adj.ToLowerInvariant()} {Singular(cat.Name).ToLowerInvariant()} from {brand.Name}. Crafted for everyday wear with a considered fit and durable fabrication.",
                    Colors = colors,
                    Variants = variants,
                    Price = basePrice,
                    SalePrice = salePrice,
                    Currency = "USD",
                    Attributes = new ProductAttributes
                    {
                        Fit = isShoes ? "True to size" : (rnd.Next(2) == 0 ? "Regular fit" : "Relaxed fit"),
                        Fabric = isShoes ? "Leather upper, rubber sole" : "100% organic cotton",
                        Care = "Machine wash cold, do not tumble dry",
                        ModelInfo = "Model is 178cm and wears size M",
                        LengthCm = isShoes ? null : rnd.Next(60, 110)
                    },
                    Tags = new() { cat.Name, brand.Name, cat.Gender.ToString() },
                    IsNew = isNew,
                    IsActive = true,
                    Rating = Math.Round(3.5 + rnd.NextDouble() * 1.5, 1),
                    ReviewsCount = rnd.Next(0, 240)
                });
            }
        }

        await _ctx.Products.InsertManyAsync(products, cancellationToken: ct);
        Console.WriteLine($"Inserted {products.Count} products across {leaves.Count} categories.");
    }

    private async Task SeedAdminAsync(CancellationToken ct)
    {
        var email = (Environment.GetEnvironmentVariable("SEED_ADMIN_EMAIL") ?? "admin@farax.local").Trim().ToLowerInvariant();
        var password = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD") ?? "ChangeMe123!";

        var existing = await _ctx.Users.Find(u => u.Email == email).FirstOrDefaultAsync(ct);
        if (existing is not null)
        {
            Console.WriteLine($"Admin user already exists: {email}");
            return;
        }

        var admin = new User
        {
            Email = email,
            PasswordHash = _hasher.Hash(password),
            FirstName = "Admin",
            LastName = "FaraX",
            Role = UserRole.Admin
        };

        await _ctx.Users.InsertOneAsync(admin, cancellationToken: ct);
        Console.WriteLine($"Created admin user: {email}");
    }

    // Curated pool of real, verified Unsplash fashion photos (fast CDN, free license).
    // To change the catalog imagery, edit this list or the URL params below.
    private static readonly string[] _photoIds =
    {
        "1613915617430-8ab0fd7c6baf", "1515886657613-9f3515b0c78f",
        "1611042553484-d61f84d22784", "1627577279497-4b24bf1021b6",
        "1578632292335-df3abbb0d586", "1562572159-4efc207f5aff",
        "1627292441194-0280c19e74e4", "1619785292559-a15caa28bde6",
        "1568252542512-9fe8fe9c87bb", "1652184513381-9755426e7fd2",
        "1619086303291-0ef7699e4b31", "1529139574466-a303027c1d8b",
        "1629374029669-aab2f060553b", "1574015974293-817f0ebebb74",
        "1541519481457-763224276691",
    };

    /// <summary>Deterministic portrait 3:4 fashion photo from the Unsplash pool.</summary>
    private static string ImageUrl(string seedBase, int n)
    {
        var id = _photoIds[LockOf($"{seedBase}-{n}") % _photoIds.Length];
        return $"https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=800&h=1067&q=70";
    }

    /// <summary>Stable positive int hash used as the image-pool index.</summary>
    private static int LockOf(string s)
    {
        unchecked
        {
            int h = 17;
            foreach (var c in s) h = h * 31 + c;
            return h & 0x7fffffff;
        }
    }

    private static string Singular(string name) =>
        name.EndsWith("s") && name.Length > 3 ? name[..^1] : name;

    private static string Slugify(string input)
    {
        var lower = input.Trim().ToLowerInvariant();
        var chars = lower.Select(c => char.IsLetterOrDigit(c) ? c : '-').ToArray();
        var slug = new string(chars);
        while (slug.Contains("--")) slug = slug.Replace("--", "-");
        return slug.Trim('-');
    }
}