namespace DemirbasTakip.Api.Models.DTOs;

public class AssetPhotoResponseDto
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public string FilePath { get; set; } = null!;
    public string ThumbnailPath { get; set; } = null!;
    public string OriginalFileName { get; set; } = null!;
    public long FileSizeBytes { get; set; }
    public string? Description { get; set; }
    public DateTime UploadedAt { get; set; }
    public int UploadedByUserId { get; set; }
    public string UploadedByUserName { get; set; } = null!;
}

public class AssignmentPhotoResponseDto
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public string FilePath { get; set; } = null!;
    public string ThumbnailPath { get; set; } = null!;
    public string OriginalFileName { get; set; } = null!;
    public long FileSizeBytes { get; set; }
    public string? Description { get; set; }
    public int PhotoType { get; set; }
    public DateTime UploadedAt { get; set; }
    public int UploadedByUserId { get; set; }
    public string UploadedByUserName { get; set; } = null!;
}
