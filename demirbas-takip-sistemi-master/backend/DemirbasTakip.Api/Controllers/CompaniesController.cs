using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DemirbasTakip.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompaniesController : ControllerBase
{
    private readonly IPersonnelService _personnelService;

    public CompaniesController(IPersonnelService personnelService)
    {
        _personnelService = personnelService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var companies = await _personnelService.GetCompaniesAsync();
        return Ok(companies);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var company = await _personnelService.GetCompanyByIdAsync(id);
        if (company == null) return NotFound(new { message = "Firma bulunamadı." });
        return Ok(company);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCompanyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.CompanyName))
            return BadRequest(new { message = "Firma adı zorunludur." });

        var result = await _personnelService.CreateCompanyAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCompanyDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.CompanyName))
            return BadRequest(new { message = "Firma adı zorunludur." });

        var result = await _personnelService.UpdateCompanyAsync(id, dto);
        if (result == null) return NotFound(new { message = "Firma bulunamadı." });
        return Ok(result);
    }
}
