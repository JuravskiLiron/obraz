using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FaraX.Api.Middleware;
using FaraX.Application;
using FaraX.Application.Validators;
using FaraX.Infrastructure;
using FaraX.Infrastructure.Persistence;
using FaraX.Infrastructure.Seed;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

// Load .env (searches up the directory tree from the run location).
try { DotNetEnv.Env.TraversePath().Load(); } catch { /* no .env present — rely on real env vars */ }

var builder = WebApplication.CreateBuilder(args);
var port = Environment.GetEnvironmentVariable("PORT") ?? "5080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
// Surface environment variables through IConfiguration.
builder.Configuration.AddEnvironmentVariables();

builder.Services
    .AddControllers(options =>
    {
        options.Filters.Add<ValidationFilter>();
    })
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    });

builder.Services.AddScoped<ValidationFilter>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// ----- JWT auth -----
var jwtSecret = builder.Configuration["JWT_SECRET"]
    ?? throw new InvalidOperationException("JWT_SECRET is not configured.");
var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? "farax";
var jwtAudience = builder.Configuration["JWT_AUDIENCE"] ?? "farax-client";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// ----- CORS -----
var corsOrigins = (builder.Configuration["CORS_ORIGINS"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("web", policy =>
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ----- Swagger -----
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FaraX API", Version = "v1" });

    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter the JWT access token (without the 'Bearer ' prefix).",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };

    c.AddSecurityDefinition("Bearer", scheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { [scheme] = Array.Empty<string>() });
});

var app = builder.Build();

// ----- Seed mode: `dotnet run -- seed [--reset]` -----
if (args.Contains("seed"))
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    await seeder.RunAsync(reset: args.Contains("--reset"));
    return;
}

// ----- Ensure indexes at startup -----
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<MongoContext>();
    await ctx.EnsureIndexesAsync();
}

// ----- Pipeline -----
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "FaraX API v1"));
}

app.UseCors("web");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
