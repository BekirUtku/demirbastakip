namespace DemirbasTakip.Api.Models.Entities;

public class AssetPhoto
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public Asset Asset { get; set; } = null!;

    public string FilePath { get; set; } = null!;
    public string ThumbnailPath { get; set; } = null!;
    public string OriginalFileName { get; set; } = null!;
    public long FileSizeBytes { get; set; }
    public string? Description { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.Now;
    public int UploadedByUserId { get; set; }
    public string UploadedByUserName { get; set; } = null!;
}
