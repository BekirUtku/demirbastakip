namespace DemirbasTakip.Api.Models.Entities;

public class Personnel
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public int CompanyId { get; set; }
    public string? Title { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? EnglishTitle { get; set; }
    public int? SignatureLocationId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? EmploymentDate { get; set; }
    public DateTime? DismissalDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedByUserId { get; set; }
    public string? UpdatedByUserName { get; set; }

    public Department Department { get; set; } = null!;
    public Company Company { get; set; } = null!;
    public SignatureLocation? SignatureLocation { get; set; }

    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}