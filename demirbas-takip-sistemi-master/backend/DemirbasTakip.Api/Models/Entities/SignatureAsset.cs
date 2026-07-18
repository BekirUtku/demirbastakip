namespace DemirbasTakip.Api.Models.Entities;

public class SignatureAsset
{
    public int Id { get; set; }
    public string Company { get; set; } = "lokum";   // lokum | ogas
    public string Kind { get; set; } = "banner";      // logo | banner | efatura
    public string FileName { get; set; } = string.Empty;
    public string OriginalName { get; set; } = string.Empty;
    public int Width { get; set; } = 220;
    public int OffsetX { get; set; }
    public int OffsetY { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
