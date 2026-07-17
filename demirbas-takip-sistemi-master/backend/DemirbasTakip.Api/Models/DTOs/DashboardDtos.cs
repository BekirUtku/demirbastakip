namespace DemirbasTakip.Api.Models.DTOs;

public class DashboardSummaryDto
{
    public int TotalAssets { get; set; }
    public int AssignedAssets { get; set; }
    public int AvailableAssets { get; set; }
    public int PassiveAssets { get; set; }
    public int TotalPersonnel { get; set; }
    public int ActivePersonnel { get; set; }
    public int CategoryCount { get; set; }
    public int TotalAssignments { get; set; }
    public int ActiveAssignments { get; set; }
}
