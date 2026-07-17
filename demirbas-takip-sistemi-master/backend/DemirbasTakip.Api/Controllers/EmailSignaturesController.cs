using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DemirbasTakip.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/email-signatures")]
public class EmailSignaturesController : ControllerBase
{
    private readonly IEmailSignatureService _service;

    public EmailSignaturesController(
        IEmailSignatureService service)
    {
        _service = service;
    }


    [HttpPost("preview")]
    public async Task<IActionResult> Preview(
        [FromBody] GenerateEmailSignatureDto request,
        CancellationToken cancellationToken)
    {
        var result = await _service.PreviewAsync(
            request.PersonnelId,
            cancellationToken);

        if (result == null)
            return NotFound();

        return Ok(result);
    }


    [HttpPost("generate")]
    public async Task<IActionResult> Generate(
        [FromBody] GenerateEmailSignatureDto request,
        CancellationToken cancellationToken)
    {
        var result = await _service.GenerateZipAsync(
            request.PersonnelId,
            cancellationToken);

        if (result == null)
            return NotFound();

        return File(
            Convert.FromBase64String(result.Data),
            result.ContentType,
            result.FileName);
    }
}