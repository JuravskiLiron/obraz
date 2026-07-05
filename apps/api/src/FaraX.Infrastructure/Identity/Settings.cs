namespace FaraX.Infrastructure.Identity;

public class MongoSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string Database { get; set; } = "farax";
}

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "farax";
    public string Audience { get; set; } = "farax-client";
    public int AccessMinutes { get; set; } = 30;
    public int RefreshDays { get; set; } = 14;
}
