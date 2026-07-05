using FaraX.Application.DTOs;
using FaraX.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FaraX.Api.Controllers;

[ApiController]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private readonly CatalogService _catalog;

    public SearchController(CatalogService catalog) => _catalog = catalog;

    [HttpGet("suggest")]
    public async Task<ActionResult<SearchSuggestionDto>> Suggest([FromQuery] string q, CancellationToken ct) =>
        Ok(await _catalog.SuggestAsync(q ?? string.Empty, ct));
}
