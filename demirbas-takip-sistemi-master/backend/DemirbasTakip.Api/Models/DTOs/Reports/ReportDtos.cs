namespace DemirbasTakip.Api.Models.DTOs.Reports;

public class AssetReportDto
{
    public int Id { get; set; }
    public string Barcode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? SerialNumber { get; set; }
    public string CategoryName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public string CreatedByUserName { get; set; } = null!;
    public string CurrentHolder { get; set; } = null!;
    public string CurrentHolderCompany { get; set; } = null!;
}

public class AssignmentReportDto
{
    public int Id { get; set; }
    public DateTime AssignedAt { get; set; }
    public DateTime? ReturnedAt { get; set; }
    public string PersonnelFullName { get; set; } = "";
    public string CompanyName { get; set; } = "";
    public string DepartmentName { get; set; } = "";
    public string AssetName { get; set; } = "";
    public string AssetBarcode { get; set; } = "";
    public string CategoryName { get; set; } = "";
    public string Status { get; set; } = "";
    public string? Notes { get; set; }
    public string? ReturnNotes { get; set; }
    public string? CreatedByUserName { get; set; }
    public string? ReturnedByUserName { get; set; }
}

public class CompanySummaryDto
{
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = null!;
    public int ActivePersonnelCount { get; set; }
    public int ActiveAssignmentCount { get; set; }
    public List<DepartmentSummaryDto> Departments { get; set; } = new();
}

public class DepartmentSummaryDto
{
    public string DepartmentName { get; set; } = null!;
    public int PersonnelCount { get; set; }
    public int ActiveAssignmentCount { get; set; }
}

public class CategoryStockDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public int TotalCount { get; set; }
    public int RegisteredCount { get; set; }
    public int AssignedCount { get; set; }
    public int PassiveCount { get; set; }
}

public class OverdueAssignmentDto
{
    public int Id { get; set; }
    public DateTime AssignedAt { get; set; }
    public int DaysHeld { get; set; }
    public string PersonnelFullName { get; set; } = "";
    public string CompanyName { get; set; } = "";
    public string DepartmentName { get; set; } = "";
    public string AssetName { get; set; } = "";
    public string AssetBarcode { get; set; } = "";
    public string? Notes { get; set; }
}

public class AuditLogDto
{
    public string EntityType { get; set; } = "";
    public string EntityName { get; set; } = "";
    public string Action { get; set; } = "";
    public DateTime ActionAt { get; set; }
    public string UserName { get; set; } = "";
}
