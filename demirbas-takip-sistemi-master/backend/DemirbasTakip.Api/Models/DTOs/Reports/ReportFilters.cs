namespace DemirbasTakip.Api.Models.DTOs.Reports;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}

public class AssetReportFilter
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? CategoryId { get; set; }
    public Enums.AssetStatus? Status { get; set; }
    public int? CompanyId { get; set; }
    public string? SearchText { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class AssignmentReportFilter
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? PersonnelId { get; set; }
    public int? CompanyId { get; set; }
    public int? DepartmentId { get; set; }
    public int? AssetId { get; set; }
    public Enums.AssignmentStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class MailLogReportFilter
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Enums.MailType? MailType { get; set; }
    public bool? IsSuccess { get; set; }
    public string? RecipientSearch { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

public class AuditLogFilter
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? EntityType { get; set; }
    public string? UserName { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
