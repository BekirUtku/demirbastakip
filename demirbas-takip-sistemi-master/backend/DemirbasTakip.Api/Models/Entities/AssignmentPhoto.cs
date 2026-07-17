using DemirbasTakip.Api.Models.Enums;

namespace DemirbasTakip.Api.Models.Entities;

public class AssignmentPhoto
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;

    public string FilePath { get; set; } = null!;
    public string ThumbnailPath { get; set; } = null!;
    public string OriginalFileName { get; set; } = null!;
    public long FileSizeBytes { get; set; }
    public string? Description { get; set; }
    public PhotoType PhotoType { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.Now;
    public int UploadedByUserId { get; set; }
    public string UploadedByUserName { get; set; } = null!;
}
