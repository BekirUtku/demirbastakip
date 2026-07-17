namespace DemirbasTakip.Api.Services.Interfaces;

public interface IPhotoService
{
    Task<PhotoUploadResult> SavePhotoAsync(IFormFile file, string subFolder, int relatedEntityId);
    Task DeletePhotoAsync(string filePath, string thumbnailPath);
}

public class PhotoUploadResult
{
    public string FilePath { get; set; } = null!;
    public string ThumbnailPath { get; set; } = null!;
    public long FileSizeBytes { get; set; }
}
