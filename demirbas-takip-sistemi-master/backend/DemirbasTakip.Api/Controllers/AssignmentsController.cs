using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Models.Entities;
using DemirbasTakip.Api.Models.Enums;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;
    private readonly AppDbContext _context;
    private readonly IPhotoService _photoService;
    private readonly ICurrentUserService _currentUser;

    public AssignmentsController(IAssignmentService assignmentService, AppDbContext context,
        IPhotoService photoService, ICurrentUserService currentUser)
    {
        _assignmentService = assignmentService;
        _context = context;
        _photoService = photoService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var assignments = await _assignmentService.GetAllAsync();
        return Ok(assignments);
    }

    [HttpGet("available-assets")]
    public async Task<IActionResult> GetAvailableAssets()
    {
        var assets = await _assignmentService.GetAvailableAssetsAsync();
        return Ok(assets);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssignmentDto dto)
    {
        if (dto.PersonnelId <= 0 || dto.AssetId <= 0)
            return BadRequest(new { message = "Personel ve demirbaş seçimi zorunludur." });

        var result = await _assignmentService.CreateAsync(dto);
        return Ok(result);
    }

    [HttpPatch("{id}/return")]
    public async Task<IActionResult> Return(int id, [FromBody] ReturnAssignmentDto dto)
    {
        var result = await _assignmentService.ReturnAsync(id, dto);
        if (result == null) return NotFound(new { message = "Zimmet kaydı bulunamadı." });
        return Ok(result);
    }

    [HttpGet("{id}/protocol.docx")]
    public async Task<IActionResult> GetProtocol(int id)
    {
        var bytes = await _assignmentService.GenerateProtocolDocxAsync(id);
        var fileName = $"zimmet_tutanagi_{id}_{DateTime.Now:yyyyMMdd}.docx";
        return File(bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fileName);
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel()
    {
        var bytes = await _assignmentService.ExportExcelAsync();
        var fileName = $"zimmet_raporu_{DateTime.Now:yyyyMMdd_HHmm}.xlsx";
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpPost("{id}/photos")]
    [RequestSizeLimit(10_485_760)]
    public async Task<IActionResult> UploadPhoto(int id, IFormFile file,
        [FromForm] int type, [FromForm] string? description)
    {
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null) return NotFound(new { message = "Zimmet kaydı bulunamadı." });

        try
        {
            var photoType = (PhotoType)type;
            var result = await _photoService.SavePhotoAsync(file, "assignments", id);
            var photo = new AssignmentPhoto
            {
                AssignmentId = id,
                FilePath = result.FilePath,
                ThumbnailPath = result.ThumbnailPath,
                OriginalFileName = file.FileName,
                FileSizeBytes = result.FileSizeBytes,
                Description = description,
                PhotoType = photoType,
                UploadedAt = DateTime.Now,
                UploadedByUserId = _currentUser.UserId,
                UploadedByUserName = _currentUser.UserName
            };
            _context.AssignmentPhotos.Add(photo);
            await _context.SaveChangesAsync();

            return Ok(new AssignmentPhotoResponseDto
            {
                Id = photo.Id,
                AssignmentId = photo.AssignmentId,
                FilePath = photo.FilePath,
                ThumbnailPath = photo.ThumbnailPath,
                OriginalFileName = photo.OriginalFileName,
                FileSizeBytes = photo.FileSizeBytes,
                Description = photo.Description,
                PhotoType = (int)photo.PhotoType,
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
        var photos = await _context.AssignmentPhotos
            .AsNoTracking()
            .Where(p => p.AssignmentId == id)
            .OrderByDescending(p => p.UploadedAt)
            .Select(p => new AssignmentPhotoResponseDto
            {
                Id = p.Id,
                AssignmentId = p.AssignmentId,
                FilePath = p.FilePath,
                ThumbnailPath = p.ThumbnailPath,
                OriginalFileName = p.OriginalFileName,
                FileSizeBytes = p.FileSizeBytes,
                Description = p.Description,
                PhotoType = (int)p.PhotoType,
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
        var photo = await _context.AssignmentPhotos.FindAsync(photoId);
        if (photo == null) return NotFound(new { message = "Fotoğraf bulunamadı." });
        await _photoService.DeletePhotoAsync(photo.FilePath, photo.ThumbnailPath);
        _context.AssignmentPhotos.Remove(photo);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
