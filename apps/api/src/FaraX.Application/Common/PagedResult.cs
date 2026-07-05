namespace FaraX.Application.Common;

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();
    public long Total { get; set; }
    public int Limit { get; set; }
    public int Offset { get; set; }
    public bool HasMore => Offset + Items.Count < Total;
}
