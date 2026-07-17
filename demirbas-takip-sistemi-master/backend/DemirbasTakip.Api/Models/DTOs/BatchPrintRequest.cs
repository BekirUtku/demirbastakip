namespace DemirbasTakip.Api.Models.DTOs;

public class BatchPrintRequest
{
    public List<int> AssetIds { get; set; } = new();
}
