using ClosedXML.Excel;
using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs.Reports;
using DemirbasTakip.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(AppDbContext context, ILogger<ReportsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // 1) DEMİRBAŞ LİSTESİ RAPORU
    [HttpPost("assets")]
    public async Task<IActionResult> AssetsReport([FromBody] AssetReportFilter filter)
    {
        var query = BuildAssetsQuery(filter);
        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(a => new AssetReportDto
            {
                Id = a.Id,
                Barcode = a.Barcode,
                Name = a.Name,
                SerialNumber = a.SerialNumber,
                CategoryName = a.Category != null ? a.Category.Name : "-",
                Status = a.Status.ToString(),
                CreatedAt = a.CreatedAt,
                CreatedByUserName = a.CreatedByUserName,
                CurrentHolder = a.Assignments
                    .Where(asg => asg.Status == AssignmentStatus.Aktif)
                    .Select(asg => asg.Personnel.FirstName + " " + asg.Personnel.LastName)
                    .FirstOrDefault() ?? "-",
                CurrentHolderCompany = a.Assignments
                    .Where(asg => asg.Status == AssignmentStatus.Aktif)
                    .Select(asg => asg.Personnel.Company.Name)
                    .FirstOrDefault() ?? "-"
            })
            .ToListAsync();

        return Ok(new PagedResult<AssetReportDto>
        {
            Items = items,
            TotalCount = total,
            Page = filter.Page,
            PageSize = filter.PageSize
        });
    }

    [HttpPost("assets/export")]
    public async Task<IActionResult> ExportAssets([FromBody] AssetReportFilter filter)
    {
        filter.Page = 1;
        filter.PageSize = int.MaxValue;

        var data = await BuildAssetsQuery(filter)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AssetReportDto
            {
                Barcode = a.Barcode,
                Name = a.Name,
                SerialNumber = a.SerialNumber,
                CategoryName = a.Category != null ? a.Category.Name : "-",
                Status = a.Status.ToString(),
                CreatedAt = a.CreatedAt,
                CreatedByUserName = a.CreatedByUserName,
                CurrentHolder = a.Assignments
                    .Where(asg => asg.Status == AssignmentStatus.Aktif)
                    .Select(asg => asg.Personnel.FirstName + " " + asg.Personnel.LastName)
                    .FirstOrDefault() ?? "-",
                CurrentHolderCompany = a.Assignments
                    .Where(asg => asg.Status == AssignmentStatus.Aktif)
                    .Select(asg => asg.Personnel.Company.Name)
                    .FirstOrDefault() ?? "-"
            })
            .ToListAsync();

        var headers = new[] { "Barkod", "Adı", "Seri No", "Kategori", "Durum",
                              "Eklenme Tarihi", "Ekleyen", "Şu An Kimde", "Firması" };
        var rows = data.Select(d => new object?[]
        {
            d.Barcode, d.Name, d.SerialNumber, d.CategoryName, d.Status,
            d.CreatedAt.ToString("dd.MM.yyyy HH:mm"), d.CreatedByUserName,
            d.CurrentHolder, d.CurrentHolderCompany
        });

        return BuildExcel("DemirbasRaporu", "Demirbaşlar", headers, rows);
    }

    private IQueryable<Models.Entities.Asset> BuildAssetsQuery(AssetReportFilter filter)
    {
        var query = _context.Assets
            .AsNoTracking()
            .Include(a => a.Category)
            .Include(a => a.Assignments).ThenInclude(asg => asg.Personnel).ThenInclude(p => p.Company)
            .AsQueryable();

        if (filter.StartDate.HasValue)
            query = query.Where(a => a.CreatedAt >= filter.StartDate.Value);
        if (filter.EndDate.HasValue)
            query = query.Where(a => a.CreatedAt <= filter.EndDate.Value);
        if (filter.CategoryId.HasValue)
            query = query.Where(a => a.CategoryId == filter.CategoryId.Value);
        if (filter.Status.HasValue)
            query = query.Where(a => a.Status == filter.Status.Value);
        if (filter.CompanyId.HasValue)
            query = query.Where(a => a.Assignments.Any(
                asg => asg.Status == AssignmentStatus.Aktif &&
                       asg.Personnel.CompanyId == filter.CompanyId.Value));
        if (!string.IsNullOrWhiteSpace(filter.SearchText))
        {
            var s = filter.SearchText.Trim();
            query = query.Where(a => a.Name.Contains(s)
                || a.Barcode.Contains(s)
                || (a.SerialNumber != null && a.SerialNumber.Contains(s)));
        }

        return query;
    }

    // 2) ZİMMET HAREKET RAPORU
    [HttpPost("assignments")]
    public async Task<IActionResult> AssignmentsReport([FromBody] AssignmentReportFilter filter)
    {
        var query = BuildAssignmentsQuery(filter);
        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.AssignedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(a => new AssignmentReportDto
            {
                Id = a.Id,
                AssignedAt = a.AssignedAt,
                ReturnedAt = a.ReturnedAt,
                PersonnelFullName = a.Personnel.FirstName + " " + a.Personnel.LastName,
                CompanyName = a.Personnel.Company.Name,
                DepartmentName = a.Personnel.Department.Name,
                AssetName = a.Asset.Name,
                AssetBarcode = a.Asset.Barcode,
                CategoryName = a.Asset.Category != null ? a.Asset.Category.Name : "-",
                Status = a.Status.ToString(),
                Notes = a.Notes,
                ReturnNotes = a.ReturnNotes,
                CreatedByUserName = a.CreatedByUserName,
                ReturnedByUserName = a.ReturnedByUserName
            })
            .ToListAsync();

        return Ok(new PagedResult<AssignmentReportDto>
        {
            Items = items, TotalCount = total, Page = filter.Page, PageSize = filter.PageSize
        });
    }

    [HttpPost("assignments/export")]
    public async Task<IActionResult> ExportAssignments([FromBody] AssignmentReportFilter filter)
    {
        filter.Page = 1; filter.PageSize = int.MaxValue;

        var data = await BuildAssignmentsQuery(filter)
            .OrderByDescending(a => a.AssignedAt)
            .Select(a => new
            {
                a.AssignedAt, a.ReturnedAt,
                Personnel = a.Personnel.FirstName + " " + a.Personnel.LastName,
                Company = a.Personnel.Company.Name,
                Department = a.Personnel.Department.Name,
                AssetName = a.Asset.Name, Barcode = a.Asset.Barcode,
                Category = a.Asset.Category != null ? a.Asset.Category.Name : "-",
                Status = a.Status.ToString(),
                a.Notes, a.ReturnNotes,
                a.CreatedByUserName, a.ReturnedByUserName
            })
            .ToListAsync();

        var headers = new[] { "Zimmet Tarihi", "İade Tarihi", "Personel", "Firma",
                              "Departman", "Demirbaş", "Barkod", "Kategori", "Durum",
                              "Notlar", "İade Notları", "Zimmet Veren", "İade Alan" };
        var rows = data.Select(d => new object?[]
        {
            d.AssignedAt.ToString("dd.MM.yyyy HH:mm"),
            d.ReturnedAt?.ToString("dd.MM.yyyy HH:mm") ?? "-",
            d.Personnel, d.Company, d.Department, d.AssetName, d.Barcode,
            d.Category, d.Status, d.Notes ?? "", d.ReturnNotes ?? "",
            d.CreatedByUserName ?? "", d.ReturnedByUserName ?? ""
        });

        return BuildExcel("ZimmetRaporu", "Zimmet Hareketleri", headers, rows);
    }

    private IQueryable<Models.Entities.Assignment> BuildAssignmentsQuery(AssignmentReportFilter filter)
    {
        var query = _context.Assignments
            .AsNoTracking()
            .Include(a => a.Personnel).ThenInclude(p => p.Company)
            .Include(a => a.Personnel).ThenInclude(p => p.Department)
            .Include(a => a.Asset).ThenInclude(ast => ast.Category)
            .AsQueryable();

        if (filter.StartDate.HasValue) query = query.Where(a => a.AssignedAt >= filter.StartDate.Value);
        if (filter.EndDate.HasValue) query = query.Where(a => a.AssignedAt <= filter.EndDate.Value);
        if (filter.PersonnelId.HasValue) query = query.Where(a => a.PersonnelId == filter.PersonnelId.Value);
        if (filter.CompanyId.HasValue) query = query.Where(a => a.Personnel.CompanyId == filter.CompanyId.Value);
        if (filter.DepartmentId.HasValue) query = query.Where(a => a.Personnel.DepartmentId == filter.DepartmentId.Value);
        if (filter.AssetId.HasValue) query = query.Where(a => a.AssetId == filter.AssetId.Value);
        if (filter.Status.HasValue) query = query.Where(a => a.Status == filter.Status.Value);

        return query;
    }

    // 3) PERSONEL GEÇMİŞİ
    [HttpGet("personnel/{personnelId}/history")]
    public async Task<IActionResult> PersonnelHistory(int personnelId)
    {
        var personnel = await _context.Personnel
            .AsNoTracking()
            .Include(p => p.Company)
            .Include(p => p.Department)
            .FirstOrDefaultAsync(p => p.Id == personnelId);

        if (personnel == null) return NotFound();

        var history = await _context.Assignments
            .AsNoTracking()
            .Where(a => a.PersonnelId == personnelId)
            .Include(a => a.Asset).ThenInclude(ast => ast.Category)
            .OrderByDescending(a => a.AssignedAt)
            .Select(a => new AssignmentReportDto
            {
                Id = a.Id,
                AssignedAt = a.AssignedAt,
                ReturnedAt = a.ReturnedAt,
                AssetName = a.Asset.Name,
                AssetBarcode = a.Asset.Barcode,
                CategoryName = a.Asset.Category != null ? a.Asset.Category.Name : "-",
                Status = a.Status.ToString(),
                Notes = a.Notes,
                ReturnNotes = a.ReturnNotes,
                CreatedByUserName = a.CreatedByUserName,
                ReturnedByUserName = a.ReturnedByUserName
            })
            .ToListAsync();

        return Ok(new
        {
            personnel = new
            {
                personnel.Id,
                FullName = personnel.FirstName + " " + personnel.LastName,
                Company = personnel.Company.Name,
                Department = personnel.Department.Name,
                personnel.Title,
                personnel.Email,
                personnel.Phone,
                personnel.IsActive
            },
            history
        });
    }

    // 4) FİRMA/DEPARTMAN ÖZETİ
    [HttpGet("company-summary")]
    public async Task<IActionResult> CompanySummary()
    {
        var data = await _context.Companies
            .AsNoTracking()
            .Where(c => c.IsActive)
            .Select(c => new CompanySummaryDto
            {
                CompanyId = c.Id,
                CompanyName = c.Name,
                ActivePersonnelCount = c.Personnel.Count(p => p.IsActive),
                ActiveAssignmentCount = _context.Assignments
                    .Count(a => a.Status == AssignmentStatus.Aktif && a.Personnel.CompanyId == c.Id),
                Departments = c.Personnel
                    .Where(p => p.IsActive)
                    .GroupBy(p => p.Department.Name)
                    .Select(g => new DepartmentSummaryDto
                    {
                        DepartmentName = g.Key,
                        PersonnelCount = g.Count(),
                        ActiveAssignmentCount = g.SelectMany(p => p.Assignments)
                            .Count(a => a.Status == AssignmentStatus.Aktif)
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(data);
    }

    // 5) KATEGORİ STOK
    [HttpGet("category-stock")]
    public async Task<IActionResult> CategoryStock()
    {
        var data = await _context.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .Select(c => new CategoryStockDto
            {
                CategoryId = c.Id,
                CategoryName = c.Name,
                TotalCount = c.Assets.Count(),
                RegisteredCount = c.Assets.Count(a => a.Status == AssetStatus.Kayitli),
                AssignedCount = c.Assets.Count(a => a.Status == AssetStatus.Zimmetli),
                PassiveCount = c.Assets.Count(a => a.Status == AssetStatus.Pasif)
            })
            .ToListAsync();

        return Ok(data);
    }

    // 6) BEKLEYEN İADELER
    [HttpGet("overdue-assignments")]
    public async Task<IActionResult> OverdueAssignments([FromQuery] int daysThreshold = 30)
    {
        var threshold = DateTime.Now.AddDays(-daysThreshold);

        var items = await _context.Assignments
            .AsNoTracking()
            .Where(a => a.Status == AssignmentStatus.Aktif && a.AssignedAt <= threshold)
            .Include(a => a.Personnel).ThenInclude(p => p.Company)
            .Include(a => a.Personnel).ThenInclude(p => p.Department)
            .Include(a => a.Asset)
            .OrderBy(a => a.AssignedAt)
            .Select(a => new OverdueAssignmentDto
            {
                Id = a.Id,
                AssignedAt = a.AssignedAt,
                DaysHeld = EF.Functions.DateDiffDay(a.AssignedAt, DateTime.Now),
                PersonnelFullName = a.Personnel.FirstName + " " + a.Personnel.LastName,
                CompanyName = a.Personnel.Company.Name,
                DepartmentName = a.Personnel.Department.Name,
                AssetName = a.Asset.Name,
                AssetBarcode = a.Asset.Barcode,
                Notes = a.Notes
            })
            .ToListAsync();

        return Ok(items);
    }

    // 7) MAİL LOGLARI
    [HttpPost("mail-logs")]
    public async Task<IActionResult> MailLogsReport([FromBody] MailLogReportFilter filter)
    {
        var query = _context.MailLogs.AsNoTracking().AsQueryable();

        if (filter.StartDate.HasValue) query = query.Where(m => m.SentAt >= filter.StartDate.Value);
        if (filter.EndDate.HasValue) query = query.Where(m => m.SentAt <= filter.EndDate.Value);
        if (filter.MailType.HasValue) query = query.Where(m => m.MailType == filter.MailType.Value);
        if (filter.IsSuccess.HasValue) query = query.Where(m => m.IsSuccess == filter.IsSuccess.Value);
        if (!string.IsNullOrWhiteSpace(filter.RecipientSearch))
        {
            var s = filter.RecipientSearch.Trim();
            query = query.Where(m => m.RecipientEmail.Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(m => m.SentAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return Ok(new PagedResult<Models.Entities.MailLog>
        {
            Items = items, TotalCount = total, Page = filter.Page, PageSize = filter.PageSize
        });
    }

    // 8) İŞLEM LOGU (Audit)
    [HttpPost("audit-logs")]
    public async Task<IActionResult> AuditLogs([FromBody] AuditLogFilter filter)
    {
        var assetLogs = _context.Assets.AsNoTracking().Select(a => new AuditLogDto
        {
            EntityType = "Asset",
            EntityName = a.Name + " (" + a.Barcode + ")",
            Action = "Oluşturma",
            ActionAt = a.CreatedAt,
            UserName = a.CreatedByUserName
        });

        var assetUpdates = _context.Assets.AsNoTracking()
            .Where(a => a.UpdatedAt.HasValue)
            .Select(a => new AuditLogDto
            {
                EntityType = "Asset",
                EntityName = a.Name + " (" + a.Barcode + ")",
                Action = "Güncelleme",
                ActionAt = a.UpdatedAt!.Value,
                UserName = a.UpdatedByUserName ?? "-"
            });

        var assignmentLogs = _context.Assignments.AsNoTracking()
            .Include(a => a.Asset)
            .Include(a => a.Personnel)
            .Select(a => new AuditLogDto
            {
                EntityType = "Assignment",
                EntityName = a.Asset.Name + " → " + a.Personnel.FirstName + " " + a.Personnel.LastName,
                Action = "Zimmet Oluşturma",
                ActionAt = a.CreatedAt,
                UserName = a.CreatedByUserName
            });

        var returnLogs = _context.Assignments.AsNoTracking()
            .Where(a => a.ReturnedAt.HasValue)
            .Include(a => a.Asset)
            .Include(a => a.Personnel)
            .Select(a => new AuditLogDto
            {
                EntityType = "Assignment",
                EntityName = a.Asset.Name + " ← " + a.Personnel.FirstName + " " + a.Personnel.LastName,
                Action = "Zimmet İadesi",
                ActionAt = a.ReturnedAt!.Value,
                UserName = a.ReturnedByUserName ?? "-"
            });

        var personnelLogs = _context.Personnel.AsNoTracking().Select(p => new AuditLogDto
        {
            EntityType = "Personnel",
            EntityName = p.FirstName + " " + p.LastName,
            Action = "Personel Ekleme",
            ActionAt = p.CreatedAt,
            UserName = p.CreatedByUserName
        });

        var combined = assetLogs
            .Concat(assetUpdates)
            .Concat(assignmentLogs)
            .Concat(returnLogs)
            .Concat(personnelLogs);

        if (filter.StartDate.HasValue) combined = combined.Where(x => x.ActionAt >= filter.StartDate.Value);
        if (filter.EndDate.HasValue) combined = combined.Where(x => x.ActionAt <= filter.EndDate.Value);
        if (!string.IsNullOrWhiteSpace(filter.EntityType)) combined = combined.Where(x => x.EntityType == filter.EntityType);
        if (!string.IsNullOrWhiteSpace(filter.UserName)) combined = combined.Where(x => x.UserName.Contains(filter.UserName));

        var total = await combined.CountAsync();
        var items = await combined
            .OrderByDescending(x => x.ActionAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return Ok(new PagedResult<AuditLogDto>
        {
            Items = items, TotalCount = total, Page = filter.Page, PageSize = filter.PageSize
        });
    }

    private IActionResult BuildExcel(string fileNamePrefix, string sheetName,
        IEnumerable<string> headers, IEnumerable<object?[]> rows)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add(sheetName);

        var headerList = headers.ToList();
        for (int i = 0; i < headerList.Count; i++)
            ws.Cell(1, i + 1).Value = headerList[i];

        var headerRange = ws.Range(1, 1, 1, headerList.Count);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#2dd4bf");
        headerRange.Style.Font.FontColor = XLColor.White;

        int row = 2;
        foreach (var r in rows)
        {
            for (int i = 0; i < r.Length; i++)
                ws.Cell(row, i + 1).Value = r[i]?.ToString() ?? "";
            row++;
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        wb.SaveAs(stream);
        return File(stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"{fileNamePrefix}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
    }
}
