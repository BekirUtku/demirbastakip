using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DemirbasTakip.Api.Controllers;

[ApiController]
[Route("api/signature-assets")]
[Authorize]
public class SignatureAssetsController : ControllerBase
{
    private readonly ISignatureAssetService _service;

    public SignatureAssetsController(ISignatureAssetService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? company, [FromQuery] string? kind)
        => Ok(await _service.GetAsync(company, kind));

    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
        [FromForm] string company,
        [FromForm] string kind,
        [FromForm] int? width,
        IFormFile file)
    {
        var c = (company ?? "").Trim().ToLowerInvariant();
        var k = (kind ?? "").Trim().ToLowerInvariant();
        if (c != "lokum" && c != "ogas")
            return BadRequest(new { message = "Geçersiz firma." });
        if (k != "logo" && k != "banner" && k != "efatura")
            return BadRequest(new { message = "Geçersiz görsel türü." });
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Dosya seçilmedi." });

        var result = await _service.UploadAsync(c, k, width, file);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSignatureAssetDto dto)
    {
        var r = await _service.UpdateAsync(id, dto);
        if (r == null) return NotFound(new { message = "Görsel bulunamadı." });
        return Ok(r);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _service.DeleteAsync(id);
        if (!ok) return NotFound(new { message = "Görsel bulunamadı." });
        return Ok(new { message = "Görsel silindi." });
    }
}
