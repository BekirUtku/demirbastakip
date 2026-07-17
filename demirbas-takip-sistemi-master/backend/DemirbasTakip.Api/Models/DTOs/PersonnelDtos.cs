namespace DemirbasTakip.Api.Models.DTOs;

public class PersonnelDto
{
    public string? EnglishTitle { get; set; }
    public int? SignatureLocationId { get; set; }
    public string? SignatureLocationName { get; set; }
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public string? BranchAddress { get; set; }
    public string? BranchPhone { get; set; }
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? Title { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    public DateTime? EmploymentDate { get; set; }
    public DateTime? DismissalDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public List<PersonnelAssignmentDto> ActiveAssignments { get; set; } = new();
}

public class PersonnelAssignmentDto
{
    public int AssignmentId { get; set; }
    public string AssetBarcode { get; set; } = string.Empty;
    public string AssetName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
    public DateTime? ReturnedAt { get; set; }
    public string? Notes { get; set; }
    public string? ReturnNotes { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CreatePersonnelDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? EnglishTitle { get; set; }
    public int? SignatureLocationId { get; set; }
    public int? BranchId { get; set; }
    public int DepartmentId { get; set; }
    public int CompanyId { get; set; }
    public string? Title { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateTime? EmploymentDate { get; set; }
}

public class UpdatePersonnelDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? EnglishTitle { get; set; }
    public int? SignatureLocationId { get; set; }
    public int? BranchId { get; set; }
    public int DepartmentId { get; set; }
    public int CompanyId { get; set; }
    public string? Title { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? EmploymentDate { get; set; }
    public DateTime? DismissalDate { get; set; }
}

public class DepartmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int PersonnelCount { get; set; }
}

public class CreateDepartmentDto
{
    public string Name { get; set; } = string.Empty;
}

public class CompanyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? LogoPath { get; set; }
    public string? Address { get; set; }
    public string? MailAddress { get; set; }
    public bool IsActive { get; set; }
    public int PersonnelCount { get; set; }
}

public class CreateCompanyDto
{
    public string Name { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? MailAddress { get; set; }
}

public class UpdateCompanyDto
{
    public string Name { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? MailAddress { get; set; }
    public bool IsActive { get; set; } = true;
}
