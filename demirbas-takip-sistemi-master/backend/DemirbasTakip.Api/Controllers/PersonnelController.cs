using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DemirbasTakip.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PersonnelController : ControllerBase
{
    private readonly IPersonnelService _personnelService;

    public PersonnelController(IPersonnelService personnelService)
    {
        _personnelService = personnelService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int? departmentId, [FromQuery] int? companyId, [FromQuery] bool? isActive)
    {
        var personnel = await _personnelService.GetAllAsync(search, departmentId, companyId, isActive);
        return Ok(personnel);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var personnel = await _personnelService.GetByIdAsync(id);
        if (personnel == null) return NotFound(new { message = "Personel bulunamadı." });
        return Ok(personnel);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePersonnelDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
            return BadRequest(new { message = "Ad ve soyad zorunludur." });

        var result = await _personnelService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePersonnelDto dto)
    {
        var result = await _personnelService.UpdateAsync(id, dto);
        if (result == null) return NotFound(new { message = "Personel bulunamadı." });
        return Ok(result);
    }

    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var result = await _personnelService.DeactivateAsync(id);
        if (!result) return NotFound(new { message = "Personel bulunamadı." });
        return Ok(new { message = "Personel pasife alındı." });
    }

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        var departments = await _personnelService.GetDepartmentsAsync();
        return Ok(departments);
    }

    [HttpPost("departments")]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Departman adı zorunludur." });

        var result = await _personnelService.CreateDepartmentAsync(dto);
        return Ok(result);
    }

    [HttpGet("companies")]
    public async Task<IActionResult> GetCompanies()
    {
        var companies = await _personnelService.GetCompaniesAsync();
        return Ok(companies);
    }
}
