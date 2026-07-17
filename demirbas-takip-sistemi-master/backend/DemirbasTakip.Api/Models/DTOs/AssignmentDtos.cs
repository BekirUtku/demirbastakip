using DemirbasTakip.Api.Models.Enums;

namespace DemirbasTakip.Api.Models.DTOs;

public class AssignmentDto
{
    public int Id { get; set; }
    public int PersonnelId { get; set; }
    public string PersonnelFullName { get; set; } = string.Empty;
    public string PersonnelTitle { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public int AssetId { get; set; }
    public string AssetBarcode { get; set; } = string.Empty;
    public string AssetName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
    public DateTime? ReturnedAt { get; set; }
    public string? Notes { get; set; }
    public string? ReturnNotes { get; set; }
    public AssignmentStatus Status { get; set; }
    public string StatusLabel => Status == AssignmentStatus.Aktif ? "Aktif" : "İade Edildi";
    public string CreatedByUserName { get; set; } = string.Empty;
    public string? ReturnedByUserName { get; set; }
}

public class CreateAssignmentDto
{
    public int PersonnelId { get; set; }
    public int AssetId { get; set; }
    public string? Notes { get; set; }
}

public class ReturnAssignmentDto
{
    public string? ReturnNotes { get; set; }
}

public class AvailableAssetDto
{
    public int Id { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
}
