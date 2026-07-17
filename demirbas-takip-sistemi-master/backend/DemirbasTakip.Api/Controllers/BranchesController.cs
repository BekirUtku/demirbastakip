using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DemirbasTakip.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BranchesController : ControllerBase
{
    private readonly IPersonnelService _service;

    public BranchesController(IPersonnelService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? companyId)
    {
        var branches = await _service.GetBranchesAsync(companyId);
        return Ok(branches);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveBranchDto dto)
    {
        if (dto.CompanyId <= 0 || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Firma ve şube adı zorunludur." });

        var result = await _service.CreateBranchAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SaveBranchDto dto)
    {
        if (dto.CompanyId <= 0 || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Firma ve şube adı zorunludur." });

        var result = await _service.UpdateBranchAsync(id, dto);
        if (result == null)
            return NotFound(new { message = "Şube bulunamadı." });

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _service.DeleteBranchAsync(id);
        if (!ok)
            return NotFound(new { message = "Şube bulunamadı." });

        return Ok(new { message = "Şube silindi." });
    }
}
