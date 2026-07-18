namespace DemirbasTakip.Api.Models.DTOs;

public class SignatureAssetDto
{
    public int Id { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string OriginalName { get; set; } = string.Empty;
    public int Width { get; set; }
    public int OffsetX { get; set; }
    public int OffsetY { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class UpdateSignatureAssetDto
{
    public int Width { get; set; }
    public int OffsetX { get; set; }
    public int OffsetY { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
