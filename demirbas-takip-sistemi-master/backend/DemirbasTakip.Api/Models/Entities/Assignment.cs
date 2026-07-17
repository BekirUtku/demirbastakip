using DemirbasTakip.Api.Models.Enums;

namespace DemirbasTakip.Api.Models.Entities;

public class Assignment
{
    public int Id { get; set; }
    public int PersonnelId { get; set; }
    public int AssetId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.Now;
    public DateTime? ReturnedAt { get; set; }
    public string? Notes { get; set; }
    public string? ReturnNotes { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Aktif;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedByUserId { get; set; }
    public string? UpdatedByUserName { get; set; }
    public int? ReturnedByUserId { get; set; }
    public string? ReturnedByUserName { get; set; }

    public Personnel Personnel { get; set; } = null!;
    public Asset Asset { get; set; } = null!;
    public ICollection<AssignmentPhoto> Photos { get; set; } = new List<AssignmentPhoto>();
}
