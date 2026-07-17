using ClosedXML.Excel;
using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Models.Entities;
using DemirbasTakip.Api.Models.Enums;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Services.Implementations;

public class PersonnelService : IPersonnelService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public PersonnelService(
        AppDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<PersonnelDto>> GetAllAsync(
        string? search,
        int? departmentId,
        int? companyId,
        bool? isActive)
    {
        var query = _context.Personnel
            .Include(p => p.Department)
            .Include(p => p.Company)

            // İmza lokasyonu bilgilerini getirir.
            .Include(p => p.SignatureLocation)

            .Include(p => p.Assignments)
                .ThenInclude(a => a.Asset)
                .ThenInclude(ast => ast.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();

            query = query.Where(p =>
                p.FirstName.ToLower().Contains(s) ||
                p.LastName.ToLower().Contains(s) ||
                (p.Email != null &&
                 p.Email.ToLower().Contains(s)) ||
                (p.Title != null &&
                 p.Title.ToLower().Contains(s)) ||
                (p.EnglishTitle != null &&
                 p.EnglishTitle.ToLower().Contains(s)) ||
                (p.SignatureLocation != null &&
                 p.SignatureLocation.Name.ToLower().Contains(s)));
        }

        if (departmentId.HasValue)
        {
            query = query.Where(
                p => p.DepartmentId == departmentId.Value);
        }

        if (companyId.HasValue)
        {
            query = query.Where(
                p => p.CompanyId == companyId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(
                p => p.IsActive == isActive.Value);
        }

        var personnel = await query
            .OrderBy(p => p.FirstName)
            .ThenBy(p => p.LastName)
            .ToListAsync();

        return personnel
            .Select(MapToDto)
            .ToList();
    }

    public async Task<PersonnelDto?> GetByIdAsync(int id)
    {
        var personnel = await _context.Personnel
            .Include(p => p.Department)
            .Include(p => p.Company)

            // İmza lokasyonu bilgilerini getirir.
            .Include(p => p.SignatureLocation)

            .Include(p => p.Assignments)
                .ThenInclude(a => a.Asset)
                .ThenInclude(ast => ast.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        return personnel == null
            ? null
            : MapToDto(personnel);
    }

    public async Task<PersonnelDto> CreateAsync(
        CreatePersonnelDto dto)
    {
        if (dto.SignatureLocationId.HasValue)
        {
            var locationExists =
                await _context.SignatureLocations.AnyAsync(
                    location =>
                        location.Id ==
                        dto.SignatureLocationId.Value);

            if (!locationExists)
            {
                throw new KeyNotFoundException(
                    "Seçilen imza lokasyonu bulunamadı.");
            }
        }

        var personnel = new Personnel
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DepartmentId = dto.DepartmentId,
            CompanyId = dto.CompanyId,
            Title = dto.Title,

            // İmza modülü alanları
            EnglishTitle = dto.EnglishTitle,
            SignatureLocationId =
                dto.SignatureLocationId,

            BirthDate = dto.BirthDate,
            Email = dto.Email,
            Phone = dto.Phone,
            IsActive = true,
            EmploymentDate = dto.EmploymentDate,
            CreatedAt = DateTime.Now,
            CreatedByUserId = _currentUser.UserId,
            CreatedByUserName = _currentUser.UserName
        };

        _context.Personnel.Add(personnel);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(personnel.Id))!;
    }

    public async Task<PersonnelDto?> UpdateAsync(
        int id,
        UpdatePersonnelDto dto)
    {
        var personnel =
            await _context.Personnel.FindAsync(id);

        if (personnel == null)
        {
            return null;
        }

        if (dto.SignatureLocationId.HasValue)
        {
            var locationExists =
                await _context.SignatureLocations.AnyAsync(
                    location =>
                        location.Id ==
                        dto.SignatureLocationId.Value);

            if (!locationExists)
            {
                throw new KeyNotFoundException(
                    "Seçilen imza lokasyonu bulunamadı.");
            }
        }

        personnel.FirstName = dto.FirstName;
        personnel.LastName = dto.LastName;
        personnel.DepartmentId = dto.DepartmentId;
        personnel.CompanyId = dto.CompanyId;
        personnel.Title = dto.Title;

        // İmza modülü alanları
        personnel.EnglishTitle = dto.EnglishTitle;
        personnel.SignatureLocationId =
            dto.SignatureLocationId;

        personnel.BirthDate = dto.BirthDate;
        personnel.Email = dto.Email;
        personnel.Phone = dto.Phone;
        personnel.IsActive = dto.IsActive;
        personnel.EmploymentDate =
            dto.EmploymentDate;
        personnel.DismissalDate =
            dto.DismissalDate;
        personnel.UpdatedAt = DateTime.Now;
        personnel.UpdatedByUserId =
            _currentUser.UserId;
        personnel.UpdatedByUserName =
            _currentUser.UserName;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(id))!;
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var personnel =
            await _context.Personnel.FindAsync(id);

        if (personnel == null)
        {
            return false;
        }

        personnel.IsActive = false;
        personnel.DismissalDate = DateTime.Now;
        personnel.UpdatedAt = DateTime.Now;
        personnel.UpdatedByUserId =
            _currentUser.UserId;
        personnel.UpdatedByUserName =
            _currentUser.UserName;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<DepartmentDto>>
        GetDepartmentsAsync()
    {
        var departments = await _context.Departments
            .Include(d => d.Personnel)
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync();

        return departments
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                IsActive = d.IsActive,
                PersonnelCount = d.Personnel.Count
            })
            .ToList();
    }

    public async Task<DepartmentDto>
        CreateDepartmentAsync(
            CreateDepartmentDto dto)
    {
        var department = new Department
        {
            Name = dto.Name,
            IsActive = true,
            CreatedAt = DateTime.Now,
            CreatedByUserId = _currentUser.UserId,
            CreatedByUserName =
                _currentUser.UserName
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        return new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            IsActive = department.IsActive
        };
    }

    public async Task<List<CompanyDto>>
        GetCompaniesAsync()
    {
        return await _context.Companies
            .Where(c => c.IsActive)
            .Select(c => new CompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                CompanyName = c.CompanyName,
                LogoPath = c.LogoPath,
                Address = c.Address,
                MailAddress = c.MailAddress,
                IsActive = c.IsActive,
                PersonnelCount =
                    c.Personnel.Count(
                        p => p.IsActive)
            })
            .ToListAsync();
    }

    public async Task<CompanyDto?>
        GetCompanyByIdAsync(int id)
    {
        var company = await _context.Companies
            .Include(c => c.Personnel)
            .FirstOrDefaultAsync(c => c.Id == id);

        return company == null
            ? null
            : MapCompanyToDto(company);
    }

    public async Task<CompanyDto>
        CreateCompanyAsync(
            CreateCompanyDto dto)
    {
        var company = new Company
        {
            Name = dto.Name.Trim(),
            CompanyName = dto.CompanyName.Trim(),
            Address = dto.Address?.Trim(),
            MailAddress = dto.MailAddress?.Trim(),
            IsActive = true
        };

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        return MapCompanyToDto(company);
    }

    public async Task<CompanyDto?>
        UpdateCompanyAsync(
            int id,
            UpdateCompanyDto dto)
    {
        var company = await _context.Companies
            .Include(c => c.Personnel)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (company == null)
        {
            return null;
        }

        company.Name = dto.Name.Trim();
        company.CompanyName =
            dto.CompanyName.Trim();
        company.Address =
            dto.Address?.Trim();
        company.MailAddress =
            dto.MailAddress?.Trim();
        company.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return MapCompanyToDto(company);
    }

    private static CompanyDto MapCompanyToDto(
        Company company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            CompanyName = company.CompanyName,
            LogoPath = company.LogoPath,
            Address = company.Address,
            MailAddress = company.MailAddress,
            IsActive = company.IsActive,
            PersonnelCount =
                company.Personnel?.Count(
                    p => p.IsActive) ?? 0
        };
    }

    private static PersonnelDto MapToDto(
        Personnel personnel)
    {
        return new PersonnelDto
        {
            Id = personnel.Id,
            FirstName = personnel.FirstName,
            LastName = personnel.LastName,
            DepartmentId =
                personnel.DepartmentId,
            DepartmentName =
                personnel.Department?.Name ?? "",
            CompanyId = personnel.CompanyId,
            CompanyName =
                personnel.Company?.Name ?? "",
            Title = personnel.Title,

            // İmza modülü DTO eşlemeleri
            EnglishTitle =
                personnel.EnglishTitle,
            SignatureLocationId =
                personnel.SignatureLocationId,
            SignatureLocationName =
                personnel.SignatureLocation?.Name,

            BirthDate = personnel.BirthDate,
            Email = personnel.Email,
            Phone = personnel.Phone,
            IsActive = personnel.IsActive,
            EmploymentDate =
                personnel.EmploymentDate,
            DismissalDate =
                personnel.DismissalDate,
            CreatedAt = personnel.CreatedAt,
            CreatedByUserName =
                personnel.CreatedByUserName,

            ActiveAssignments =
                personnel.Assignments?
                    .Select(assignment =>
                        new PersonnelAssignmentDto
                        {
                            AssignmentId =
                                assignment.Id,

                            AssetBarcode =
                                assignment.Asset
                                    ?.Barcode ?? "",

                            AssetName =
                                assignment.Asset
                                    ?.Name ?? "",

                            CategoryName =
                                assignment.Asset
                                    ?.Category
                                    ?.Name ?? "",

                            AssignedAt =
                                assignment.AssignedAt,

                            ReturnedAt =
                                assignment.ReturnedAt,

                            Notes =
                                assignment.Notes,

                            ReturnNotes =
                                assignment.ReturnNotes,

                            Status =
                                assignment.Status ==
                                AssignmentStatus.Aktif
                                    ? "Aktif"
                                    : "İade Edildi"
                        })
                    .ToList() ?? new()
        };
    }
}