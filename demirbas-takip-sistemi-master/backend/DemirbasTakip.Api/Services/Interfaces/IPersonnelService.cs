using DemirbasTakip.Api.Models.DTOs;

namespace DemirbasTakip.Api.Services.Interfaces;

public interface IPersonnelService
{
    Task<List<PersonnelDto>> GetAllAsync(string? search, int? departmentId, int? companyId, bool? isActive);
    Task<PersonnelDto?> GetByIdAsync(int id);
    Task<PersonnelDto> CreateAsync(CreatePersonnelDto dto);
    Task<PersonnelDto?> UpdateAsync(int id, UpdatePersonnelDto dto);
    Task<bool> DeactivateAsync(int id);
    Task<List<DepartmentDto>> GetDepartmentsAsync();
    Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto);
    Task<List<CompanyDto>> GetCompaniesAsync();
    Task<CompanyDto?> GetCompanyByIdAsync(int id);
    Task<CompanyDto> CreateCompanyAsync(CreateCompanyDto dto);
    Task<CompanyDto?> UpdateCompanyAsync(int id, UpdateCompanyDto dto);
}
