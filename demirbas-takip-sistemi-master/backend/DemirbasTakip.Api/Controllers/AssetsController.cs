using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Models.Entities;
using DemirbasTakip.Api.Models.Enums;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace DemirbasTakip.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;
    private readonly AppDbContext _context;
    private readonly IPhotoService _photoService;
    private readonly ICurrentUserService _currentUser;

    public AssetsController(IAssetService assetService, AppDbContext context,
        IPhotoService photoService, ICurrentUserService currentUser)
    {
        _assetService = assetService;
        _context = context;
        _photoService = photoService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? categoryId, [FromQuery] AssetStatus? status, [FromQuery] string? search)
    {
        var filter = new AssetFilterDto { CategoryId = categoryId, Status = status, Search = search };
        var assets = await _assetService.GetAllAsync(filter);
        return Ok(assets);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var asset = await _assetService.GetByIdAsync(id);
        if (asset == null) return NotFound(new { message = "Demirbaş bulunamadı." });
        return Ok(asset);
    }

    [HttpGet("barcode/{barcode}")]
    public async Task<IActionResult> GetByBarcode(string barcode)
    {
        var asset = await _assetService.GetByBarcodeAsync(barcode);
        if (asset == null) return NotFound(new { message = "Bu barkoda ait demirbaş bulunamadı." });
        return Ok(asset);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssetDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Demirbaş adı zorunludur." });

        var result = await _assetService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAssetDto dto)
    {
        var result = await _assetService.UpdateAsync(id, dto);
        if (result == null) return NotFound(new { message = "Demirbaş bulunamadı." });
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _assetService.DeleteAsync(id);
        return Ok(new { message = "Demirbaş silindi." });
    }

    [HttpGet("{id}/barcode.png")]
    public async Task<IActionResult> GetBarcode(int id)
    {
        var png = await _assetService.GetBarcodePngAsync(id);
        return File(png, "image/png");
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel()
    {
        var bytes = await _assetService.ExportExcelAsync();
        var fileName = $"demirbaslar_{DateTime.Now:yyyyMMdd_HHmm}.xlsx";
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("{id}/print-csv")]
    public async Task<IActionResult> GetPrintCsv(int id)
    {
        var asset = await _context.Assets.FindAsync(id);
        if (asset == null) return NotFound(new { message = "Demirbaş bulunamadı." });

        var csv = BuildBarcodeCsv(new[] { asset.Barcode });
        var fileName = $"barkod_{asset.Barcode}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

        return File(csv, "text/csv; charset=utf-8", fileName);
    }

    [HttpPost("print-csv-batch")]
    public async Task<IActionResult> GetBatchPrintCsv([FromBody] BatchPrintRequest request)
    {
        if (request?.AssetIds == null || !request.AssetIds.Any())
            return BadRequest(new { message = "En az bir demirbaş seçmelisiniz." });

        var barcodes = await _context.Assets
            .Where(a => request.AssetIds.Contains(a.Id))
            .OrderBy(a => a.Barcode)
            .Select(a => a.Barcode)
            .ToListAsync();

        if (!barcodes.Any())
            return NotFound(new { message = "Seçilen demirbaşlar bulunamadı." });

        var csv = BuildBarcodeCsv(barcodes);
        var fileName = $"barkod_toplu_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

        return File(csv, "text/csv; charset=utf-8", fileName);
    }

    [HttpPost("{id}/photos")]
    [RequestSizeLimit(10_485_760)]
    public async Task<IActionResult> UploadPhoto(int id, IFormFile file, [FromForm] string? description)
    {
        var asset = await _context.Assets.FindAsync(id);
        if (asset == null) return NotFound(new { message = "Demirbaş bulunamadı." });

        try
        {
            var result = await _photoService.SavePhotoAsync(file, "assets", id);
            var photo = new AssetPhoto
            {
                AssetId = id,
                FilePath = result.FilePath,
                ThumbnailPath = result.ThumbnailPath,
                OriginalFileName = file.FileName,
                FileSizeBytes = result.FileSizeBytes,
                Description = description,
                UploadedAt = DateTime.Now,
                UploadedByUserId = _currentUser.UserId,
                UploadedByUserName = _currentUser.UserName
            };
            _context.AssetPhotos.Add(photo);
            await _context.SaveChangesAsync();

            return Ok(new AssetPhotoResponseDto
            {
                Id = photo.Id,
                AssetId = photo.AssetId,
                FilePath = photo.FilePath,
                ThumbnailPath = photo.ThumbnailPath,
                OriginalFileName = photo.OriginalFileName,
                FileSizeBytes = photo.FileSizeBytes,
                Description = photo.Description,
                UploadedAt = photo.UploadedAt,
                UploadedByUserId = photo.UploadedByUserId,
                UploadedByUserName = photo.UploadedByUserName
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/photos")]
    public async Task<IActionResult> GetPhotos(int id)
    {
        var photos = await _context.AssetPhotos
            .AsNoTracking()
            .Where(p => p.AssetId == id)
            .OrderByDescending(p => p.UploadedAt)
            .Select(p => new AssetPhotoResponseDto
            {
                Id = p.Id,
                AssetId = p.AssetId,
                FilePath = p.FilePath,
                ThumbnailPath = p.ThumbnailPath,
                OriginalFileName = p.OriginalFileName,
                FileSizeBytes = p.FileSizeBytes,
                Description = p.Description,
                UploadedAt = p.UploadedAt,
                UploadedByUserId = p.UploadedByUserId,
                UploadedByUserName = p.UploadedByUserName
            })
            .ToListAsync();
        return Ok(photos);
    }

    [HttpDelete("photos/{photoId}")]
    public async Task<IActionResult> DeletePhoto(int photoId)
    {
        var photo = await _context.AssetPhotos.FindAsync(photoId);
        if (photo == null) return NotFound(new { message = "Fotoğraf bulunamadı." });
        await _photoService.DeletePhotoAsync(photo.FilePath, photo.ThumbnailPath);
        _context.AssetPhotos.Remove(photo);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static byte[] BuildBarcodeCsv(IEnumerable<string> barcodes)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Barcode");

        foreach (var b in barcodes)
        {
            var safe = b.Contains(',') || b.Contains('"')
                ? $"\"{b.Replace("\"", "\"\"")}\""
                : b;
            sb.AppendLine(safe);
        }

        var utf8WithBom = new UTF8Encoding(true);
        return utf8WithBom.GetPreamble().Concat(utf8WithBom.GetBytes(sb.ToString())).ToArray();
    }
}
