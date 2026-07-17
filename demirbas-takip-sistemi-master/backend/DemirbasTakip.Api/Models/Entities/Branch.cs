namespace DemirbasTakip.Api.Models.Entities;

public class Branch
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public Company Company { get; set; } = null!;
    public ICollection<Personnel> Personnel { get; set; } = new List<Personnel>();
}
