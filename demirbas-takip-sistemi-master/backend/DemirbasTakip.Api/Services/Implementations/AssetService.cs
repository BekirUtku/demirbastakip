using ClosedXML.Excel;
using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Models.Entities;
using DemirbasTakip.Api.Models.Enums;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Services.Implementations;

public class AssetService : IAssetService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IBarcodeService _barcodeService;

    public AssetService(AppDbContext context, ICurrentUserService currentUser, IBarcodeService barcodeService)
    {
        _context = context;
        _currentUser = currentUser;
        _barcodeService = barcodeService;
    }

    public async Task<List<AssetDto>> GetAllAsync(AssetFilterDto filter)
    {
        var query = _context.Assets
            .Include(a => a.Category)
            .Include(a => a.Answers).ThenInclude(ans => ans.CategoryQuestion)
            .AsQueryable();

        if (filter.CategoryId.HasValue)
            query = query.Where(a => a.CategoryId == filter.CategoryId.Value);

        if (filter.Status.HasValue)
            query = query.Where(a => a.Status == filter.Status.Value);

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(a =>
                a.Barcode.ToLower().Contains(search) ||
                a.Name.ToLower().Contains(search) ||
                (a.SerialNumber != null && a.SerialNumber.ToLower().Contains(search)));
        }

        var assets = await query.OrderByDescending(a => a.Id).ToListAsync();
        return assets.Select(a => MapToDto(a, false)).ToList();
    }

    public async Task<AssetDto?> GetByIdAsync(int id)
    {
        var asset = await _context.Assets
            .Include(a => a.Category)
            .Include(a => a.Answers).ThenInclude(ans => ans.CategoryQuestion)
            .Include(a => a.Assignments).ThenInclude(asgn => asgn.Personnel)
            .FirstOrDefaultAsync(a => a.Id == id);

        return asset == null ? null : MapToDto(asset, true);
    }

    public async Task<AssetDto?> GetByBarcodeAsync(string barcode)
    {
        var asset = await _context.Assets
            .Include(a => a.Category)
            .Include(a => a.Answers).ThenInclude(ans => ans.CategoryQuestion)
            .Include(a => a.Assignments).ThenInclude(asgn => asgn.Personnel)
            .FirstOrDefaultAsync(a => a.Barcode == barcode.Trim().ToUpper());

        return asset == null ? null : MapToDto(asset, true);
    }

    public async Task<AssetDto> CreateAsync(CreateAssetDto dto)
    {
        var barcode = await GenerateBarcodeAsync();

        var asset = new Asset
        {
            Barcode = barcode,
            Name = dto.Name,
            SerialNumber = dto.SerialNumber,
            Description = dto.Description,
            CategoryId = dto.CategoryId,
            Status = AssetStatus.Kayitli,
            CreatedAt = DateTime.Now,
            CreatedByUserId = _currentUser.UserId,
            CreatedByUserName = _currentUser.UserName
        };

        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();

        foreach (var answerDto in dto.Answers)
        {
            _context.AssetAnswers.Add(new AssetAnswer
            {
                AssetId = asset.Id,
                CategoryQuestionId = answerDto.CategoryQuestionId,
                AnswerValue = answerDto.AnswerValue
            });
        }
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(asset.Id))!;
    }

    public async Task<AssetDto?> UpdateAsync(int id, UpdateAssetDto dto)
    {
        var asset = await _context.Assets
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (asset == null) return null;

        asset.Name = dto.Name;
        asset.SerialNumber = dto.SerialNumber;
        asset.Description = dto.Description;
        asset.CategoryId = dto.CategoryId;
        asset.Status = dto.Status;
        asset.UpdatedAt = DateTime.Now;
        asset.UpdatedByUserId = _currentUser.UserId;
        asset.UpdatedByUserName = _currentUser.UserName;

        _context.AssetAnswers.RemoveRange(asset.Answers);

        foreach (var answerDto in dto.Answers)
        {
            _context.AssetAnswers.Add(new AssetAnswer
            {
                AssetId = asset.Id,
                CategoryQuestionId = answerDto.CategoryQuestionId,
                AnswerValue = answerDto.AnswerValue
            });
        }

        await _context.SaveChangesAsync();
        return (await GetByIdAsync(id))!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var asset = await _context.Assets
            .Include(a => a.Assignments)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (asset == null) return false;

        var hasActiveAssignment = asset.Assignments.Any(a => a.Status == AssignmentStatus.Aktif);
        if (hasActiveAssignment)
            throw new InvalidOperationException("Aktif zimmeti bulunan demirbaş silinemez. Önce iade alın.");

        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<byte[]> GetBarcodePngAsync(int id)
    {
        var asset = await _context.Assets.FindAsync(id)
            ?? throw new KeyNotFoundException("Demirbaş bulunamadı.");

        return _barcodeService.GenerateBarcodePng(asset.Barcode);
    }

    public async Task<byte[]> ExportExcelAsync()
    {
        var assets = await _context.Assets
            .Include(a => a.Category)
            .Include(a => a.Answers).ThenInclude(ans => ans.CategoryQuestion)
            .OrderBy(a => a.Barcode)
            .ToListAsync();

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("DEMİRBAŞLAR");

        ws.Cell(1, 1).Value = "BARKOD";
        ws.Cell(1, 2).Value = "ADI";
        ws.Cell(1, 3).Value = "SERİ NO";
        ws.Cell(1, 4).Value = "KATEGORİ";
        ws.Cell(1, 5).Value = "DURUM";
        ws.Cell(1, 6).Value = "KAYIT TARİHİ";
        ws.Cell(1, 7).Value = "KAYDEDEN";

        var header = ws.Range(1, 1, 1, 7);
        header.Style.Font.Bold = true;
        header.Style.Fill.BackgroundColor = XLColor.FromHtml("#2dd4bf");

        int row = 2;
        foreach (var a in assets)
        {
            ws.Cell(row, 1).Value = a.Barcode;
            ws.Cell(row, 2).Value = a.Name;
            ws.Cell(row, 3).Value = a.SerialNumber ?? "";
            ws.Cell(row, 4).Value = a.Category?.Name ?? "";
            ws.Cell(row, 5).Value = a.Status switch
            {
                AssetStatus.Kayitli => "KAYITLI",
                AssetStatus.Zimmetli => "ZİMMETLİ",
                AssetStatus.Pasif => "PASİF",
                _ => ""
            };
            ws.Cell(row, 6).Value = a.CreatedAt.ToString("dd.MM.yyyy HH:mm");
            ws.Cell(row, 7).Value = a.CreatedByUserName;
            row++;
        }

        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public async Task<string> GenerateBarcodeAsync()
    {
        var lastAsset = await _context.Assets
            .OrderByDescending(a => a.Id)
            .FirstOrDefaultAsync();

        if (lastAsset == null) return "B000001";

        var lastNum = 0;
        if (lastAsset.Barcode.StartsWith("B") && int.TryParse(lastAsset.Barcode[1..], out var num))
            lastNum = num;

        return $"B{(lastNum + 1):D6}";
    }

    private static AssetDto MapToDto(Asset a, bool includeHistory) => new()
    {
        Id = a.Id,
        Barcode = a.Barcode,
        Name = a.Name,
        SerialNumber = a.SerialNumber,
        Description = a.Description,
        CategoryId = a.CategoryId,
        CategoryName = a.Category?.Name ?? "",
        Status = a.Status,
        CreatedAt = a.CreatedAt,
        CreatedByUserName = a.CreatedByUserName,
        Answers = a.Answers?.Select(ans => new AssetAnswerDto
        {
            CategoryQuestionId = ans.CategoryQuestionId,
            QuestionText = ans.CategoryQuestion?.QuestionText ?? "",
            AnswerValue = ans.AnswerValue,
            AnswerType = ans.CategoryQuestion?.AnswerType ?? Models.Enums.AnswerType.Text
        }).ToList() ?? new(),
        AssignmentHistory = includeHistory && a.Assignments != null
            ? a.Assignments.OrderByDescending(asgn => asgn.AssignedAt).Select(asgn => new AssignmentSummaryDto
            {
                Id = asgn.Id,
                PersonnelFullName = $"{asgn.Personnel?.FirstName} {asgn.Personnel?.LastName}",
                AssignedAt = asgn.AssignedAt,
                ReturnedAt = asgn.ReturnedAt,
                Notes = asgn.Notes,
                ReturnNotes = asgn.ReturnNotes,
                Status = asgn.Status == AssignmentStatus.Aktif ? "Aktif" : "İade Edildi"
            }).ToList()
            : new()
    };
}
