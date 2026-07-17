using DemirbasTakip.Api.Services.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace DemirbasTakip.Api.Services.Implementations;

public class PhotoService : IPhotoService
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<PhotoService> _logger;

    private static readonly string[] AllowedExt = { ".jpg", ".jpeg", ".png", ".webp" };
    private static readonly string[] AllowedMime = { "image/jpeg", "image/png", "image/webp" };
    private const long MaxFileSize = 10 * 1024 * 1024;
    private const int MaxWidth = 1920;
    private const int ThumbWidth = 300;

    public PhotoService(IWebHostEnvironment env, ILogger<PhotoService> logger)
    {
        _env = env;
        _logger = logger;
    }

    public async Task<PhotoUploadResult> SavePhotoAsync(IFormFile file, string subFolder, int relatedEntityId)
    {
        ValidateFile(file);

        var (relativeDir, physicalDir) = BuildPath(subFolder);
        Directory.CreateDirectory(physicalDir);

        var uniqueName = $"{relatedEntityId}_{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid():N}";
        if (uniqueName.Length > 50) uniqueName = uniqueName.Substring(0, 50);
        const string ext = ".jpg";

        var fullPath = Path.Combine(physicalDir, uniqueName + ext);
        var thumbPath = Path.Combine(physicalDir, uniqueName + "_thumb" + ext);

        await using (var stream = file.OpenReadStream())
        using (var image = await Image.LoadAsync(stream))
        {
            image.Metadata.ExifProfile = null;

            if (image.Width > MaxWidth)
            {
                var ratio = (double)MaxWidth / image.Width;
                image.Mutate(x => x.Resize(MaxWidth, (int)(image.Height * ratio)));
            }
            await image.SaveAsJpegAsync(fullPath, new JpegEncoder { Quality = 80 });

            using var thumb = image.Clone(x => x.Resize(new ResizeOptions
            {
                Size = new Size(ThumbWidth, 0),
                Mode = ResizeMode.Max
            }));
            await thumb.SaveAsJpegAsync(thumbPath, new JpegEncoder { Quality = 70 });
        }

        var info = new FileInfo(fullPath);
        return new PhotoUploadResult
        {
            FilePath = $"{relativeDir}/{uniqueName}{ext}".Replace("\\", "/"),
            ThumbnailPath = $"{relativeDir}/{uniqueName}_thumb{ext}".Replace("\\", "/"),
            FileSizeBytes = info.Length
        };
    }

    public Task DeletePhotoAsync(string filePath, string thumbnailPath)
    {
        try
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var f = Path.Combine(webRoot, filePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
            var t = Path.Combine(webRoot, thumbnailPath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString()));
            if (File.Exists(f)) File.Delete(f);
            if (File.Exists(t)) File.Delete(t);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Fotoğraf silinirken hata: {Path}", filePath);
        }
        return Task.CompletedTask;
    }

    private (string relative, string physical) BuildPath(string subFolder)
    {
        var year = DateTime.Now.Year;
        var month = DateTime.Now.Month.ToString("D2");
        var relative = $"/uploads/{subFolder}/{year}/{month}";
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var physical = Path.Combine(webRoot, "uploads", subFolder, year.ToString(), month);
        return (relative, physical);
    }

    private static void ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Dosya boş.");
        if (file.Length > MaxFileSize)
            throw new ArgumentException($"Dosya {MaxFileSize / 1024 / 1024} MB'ı aşamaz.");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExt.Contains(ext))
            throw new ArgumentException($"İzin verilen uzantılar: {string.Join(", ", AllowedExt)}");
        if (!AllowedMime.Contains(file.ContentType.ToLowerInvariant()))
            throw new ArgumentException("Geçersiz dosya tipi.");

        using var ms = new MemoryStream();
        file.OpenReadStream().CopyTo(ms);
        var bytes = ms.ToArray();
        if (!IsValidImageHeader(bytes))
            throw new ArgumentException("Geçerli bir görsel değil.");
    }

    private static bool IsValidImageHeader(byte[] b)
    {
        if (b.Length < 12) return false;
        if (b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF) return true; // JPEG
        if (b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47) return true; // PNG
        if (b[0] == 0x52 && b[1] == 0x49 && b[2] == 0x46 && b[3] == 0x46
            && b[8] == 0x57 && b[9] == 0x45 && b[10] == 0x42 && b[11] == 0x50) return true; // WebP
        return false;
    }
}
