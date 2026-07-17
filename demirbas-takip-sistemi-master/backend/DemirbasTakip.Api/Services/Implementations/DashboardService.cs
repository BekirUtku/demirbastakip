using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Models.Enums;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Services.Implementations;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var totalAssets = await _context.Assets.CountAsync();
        var assignedAssets = await _context.Assets.CountAsync(a => a.Status == AssetStatus.Zimmetli);
        var availableAssets = await _context.Assets.CountAsync(a => a.Status == AssetStatus.Kayitli);
        var passiveAssets = await _context.Assets.CountAsync(a => a.Status == AssetStatus.Pasif);
        var totalPersonnel = await _context.Personnel.CountAsync();
        var activePersonnel = await _context.Personnel.CountAsync(p => p.IsActive);
        var categoryCount = await _context.Categories.CountAsync(c => c.IsActive);
        var totalAssignments = await _context.Assignments.CountAsync();
        var activeAssignments = await _context.Assignments.CountAsync(a => a.Status == AssignmentStatus.Aktif);

        return new DashboardSummaryDto
        {
            TotalAssets = totalAssets,
            AssignedAssets = assignedAssets,
            AvailableAssets = availableAssets,
            PassiveAssets = passiveAssets,
            TotalPersonnel = totalPersonnel,
            ActivePersonnel = activePersonnel,
            CategoryCount = categoryCount,
            TotalAssignments = totalAssignments,
            ActiveAssignments = activeAssignments
        };
    }
}
