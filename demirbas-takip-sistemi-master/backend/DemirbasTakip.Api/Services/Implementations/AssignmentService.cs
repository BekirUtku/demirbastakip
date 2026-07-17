using ClosedXML.Excel;
using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Models.Entities;
using DemirbasTakip.Api.Models.Enums;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Services.Implementations;

public class AssignmentService : IAssignmentService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IWordDocumentService _wordService;

    public AssignmentService(AppDbContext context, ICurrentUserService currentUser, IWordDocumentService wordService)
    {
        _context = context;
        _currentUser = currentUser;
        _wordService = wordService;
    }

    public async Task<List<AssignmentDto>> GetAllAsync()
    {
        var assignments = await _context.Assignments
            .Include(a => a.Personnel).ThenInclude(p => p.Department)
            .Include(a => a.Personnel).ThenInclude(p => p.Company)
            .Include(a => a.Asset).ThenInclude(ast => ast.Category)
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync();

        return assignments.Select(MapToDto).ToList();
    }

    public async Task<List<AvailableAssetDto>> GetAvailableAssetsAsync()
    {
        return await _context.Assets
            .Include(a => a.Category)
            .Where(a => a.Status == AssetStatus.Kayitli)
            .OrderBy(a => a.Barcode)
            .Select(a => new AvailableAssetDto
            {
                Id = a.Id,
                Barcode = a.Barcode,
                Name = a.Name,
                CategoryName = a.Category != null ? a.Category.Name : "",
                SerialNumber = a.SerialNumber
            })
            .ToListAsync();
    }

    public async Task<AssignmentDto> CreateAsync(CreateAssignmentDto dto)
    {
        var asset = await _context.Assets.FindAsync(dto.AssetId)
            ?? throw new KeyNotFoundException("Demirbaş bulunamadı.");

        if (asset.Status != AssetStatus.Kayitli)
            throw new InvalidOperationException("Bu demirbaş zimmetlenemez. Mevcut durumu: " + asset.Status);

        var personnel = await _context.Personnel.FindAsync(dto.PersonnelId)
            ?? throw new KeyNotFoundException("Personel bulunamadı.");

        var assignment = new Assignment
        {
            PersonnelId = dto.PersonnelId,
            AssetId = dto.AssetId,
            AssignedAt = DateTime.Now,
            Notes = dto.Notes,
            Status = AssignmentStatus.Aktif,
            CreatedAt = DateTime.Now,
            CreatedByUserId = _currentUser.UserId,
            CreatedByUserName = _currentUser.UserName
        };

        asset.Status = AssetStatus.Zimmetli;
        asset.UpdatedAt = DateTime.Now;
        asset.UpdatedByUserId = _currentUser.UserId;
        asset.UpdatedByUserName = _currentUser.UserName;

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        return (await GetAssignmentDtoAsync(assignment.Id))!;
    }

    public async Task<AssignmentDto?> ReturnAsync(int id, ReturnAssignmentDto dto)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Asset)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null) return null;

        if (assignment.Status == AssignmentStatus.IadeEdildi)
            throw new InvalidOperationException("Bu zimmet zaten iade edilmiş.");

        assignment.Status = AssignmentStatus.IadeEdildi;
        assignment.ReturnedAt = DateTime.Now;
        assignment.ReturnNotes = dto.ReturnNotes;
        assignment.ReturnedByUserId = _currentUser.UserId;
        assignment.ReturnedByUserName = _currentUser.UserName;
        assignment.UpdatedAt = DateTime.Now;
        assignment.UpdatedByUserId = _currentUser.UserId;
        assignment.UpdatedByUserName = _currentUser.UserName;

        assignment.Asset.Status = AssetStatus.Kayitli;
        assignment.Asset.UpdatedAt = DateTime.Now;
        assignment.Asset.UpdatedByUserId = _currentUser.UserId;
        assignment.Asset.UpdatedByUserName = _currentUser.UserName;

        await _context.SaveChangesAsync();
        return (await GetAssignmentDtoAsync(id))!;
    }

    public async Task<byte[]> GenerateProtocolDocxAsync(int id)
    {
        var assignment = await _context.Assignments.FindAsync(id)
            ?? throw new KeyNotFoundException("Zimmet kaydı bulunamadı.");

        if (assignment.Status == AssignmentStatus.IadeEdildi)
            return await _wordService.GenerateReturnProtocolAsync(id);

        return await _wordService.GenerateAssignmentProtocolAsync(id);
    }

    public async Task<byte[]> ExportExcelAsync()
    {
        var assignments = await _context.Assignments
            .Include(a => a.Personnel).ThenInclude(p => p.Department)
            .Include(a => a.Personnel).ThenInclude(p => p.Company)
            .Include(a => a.Asset).ThenInclude(ast => ast.Category)
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync();

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("ZİMMET RAPORU");

        var headers = new[] { "DURUM", "PERSONEL", "DEPARTMAN", "FİRMA", "BARKOD", "DEMİRBAŞ", "KATEGORİ", "ZİMMET TARİHİ", "İADE TARİHİ", "NOT", "İADE NOTU", "ZİMMETLEYEN", "İADE ALAN" };
        for (int i = 0; i < headers.Length; i++)
            ws.Cell(1, i + 1).Value = headers[i];

        var header = ws.Range(1, 1, 1, headers.Length);
        header.Style.Font.Bold = true;
        header.Style.Fill.BackgroundColor = XLColor.FromHtml("#2dd4bf");

        int row = 2;
        foreach (var a in assignments)
        {
            ws.Cell(row, 1).Value = a.Status == AssignmentStatus.Aktif ? "AKTİF" : "İADE EDİLDİ";
            ws.Cell(row, 2).Value = $"{a.Personnel?.FirstName} {a.Personnel?.LastName}";
            ws.Cell(row, 3).Value = a.Personnel?.Department?.Name ?? "";
            ws.Cell(row, 4).Value = a.Personnel?.Company?.Name ?? "";
            ws.Cell(row, 5).Value = a.Asset?.Barcode ?? "";
            ws.Cell(row, 6).Value = a.Asset?.Name ?? "";
            ws.Cell(row, 7).Value = a.Asset?.Category?.Name ?? "";
            ws.Cell(row, 8).Value = a.AssignedAt.ToString("dd.MM.yyyy HH:mm");
            ws.Cell(row, 9).Value = a.ReturnedAt?.ToString("dd.MM.yyyy HH:mm") ?? "";
            ws.Cell(row, 10).Value = a.Notes ?? "";
            ws.Cell(row, 11).Value = a.ReturnNotes ?? "";
            ws.Cell(row, 12).Value = a.CreatedByUserName;
            ws.Cell(row, 13).Value = a.ReturnedByUserName ?? "";
            row++;
        }

        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    private async Task<AssignmentDto?> GetAssignmentDtoAsync(int id)
    {
        var a = await _context.Assignments
            .Include(a => a.Personnel).ThenInclude(p => p.Department)
            .Include(a => a.Personnel).ThenInclude(p => p.Company)
            .Include(a => a.Asset).ThenInclude(ast => ast.Category)
            .FirstOrDefaultAsync(a => a.Id == id);

        return a == null ? null : MapToDto(a);
    }

    private static AssignmentDto MapToDto(Assignment a) => new()
    {
        Id = a.Id,
        PersonnelId = a.PersonnelId,
        PersonnelFullName = $"{a.Personnel?.FirstName} {a.Personnel?.LastName}",
        PersonnelTitle = a.Personnel?.Title ?? "",
        DepartmentName = a.Personnel?.Department?.Name ?? "",
        CompanyName = a.Personnel?.Company?.Name ?? "",
        AssetId = a.AssetId,
        AssetBarcode = a.Asset?.Barcode ?? "",
        AssetName = a.Asset?.Name ?? "",
        CategoryName = a.Asset?.Category?.Name ?? "",
        AssignedAt = a.AssignedAt,
        ReturnedAt = a.ReturnedAt,
        Notes = a.Notes,
        ReturnNotes = a.ReturnNotes,
        Status = a.Status,
        CreatedByUserName = a.CreatedByUserName,
        ReturnedByUserName = a.ReturnedByUserName
    };
}
