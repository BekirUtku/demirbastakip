using DemirbasTakip.Api.Models.Enums;

namespace DemirbasTakip.Api.Models.Entities;

public class Asset
{
    public int Id { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public AssetStatus Status { get; set; } = AssetStatus.Kayitli;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedByUserId { get; set; }
    public string? UpdatedByUserName { get; set; }

    public Category Category { get; set; } = null!;
    public ICollection<AssetAnswer> Answers { get; set; } = new List<AssetAnswer>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public ICollection<AssetPhoto> Photos { get; set; } = new List<AssetPhoto>();
}
