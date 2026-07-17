using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DemirbasTakip.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MailController : ControllerBase
{
    private readonly IMailService _mailService;
    private readonly IBirthdayMailService _birthdayMailService;

    public MailController(IMailService mailService, IBirthdayMailService birthdayMailService)
    {
        _mailService = mailService;
        _birthdayMailService = birthdayMailService;
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _mailService.GetSettingsAsync();
        if (settings == null) return NotFound(new { message = "Mail ayarları bulunamadı." });
        return Ok(settings);
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateMailSettingsDto dto)
    {
        var result = await _mailService.UpdateSettingsAsync(dto);
        return Ok(result);
    }

    [HttpPost("test")]
    public async Task<IActionResult> SendTest([FromBody] SendTestMailDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ToEmail))
            return BadRequest(new { message = "Alıcı e-posta adresi zorunludur." });

        var success = await _mailService.SendTestMailAsync(dto.ToEmail);
        return Ok(new { success, message = success ? "Test maili başarıyla gönderildi." : "Mail gönderilemedi. Lütfen ayarları kontrol edin." });
    }

    [HttpPost("send-birthdays-now")]
    public async Task<IActionResult> SendBirthdaysNow()
    {
        await _birthdayMailService.ForceSendBirthdayMailsAsync();
        return Ok(new { message = "Doğum günü mailleri gönderme işlemi tamamlandı." });
    }

    [HttpPost("send-custom")]
    public async Task<IActionResult> SendCustom([FromBody] SendCustomMailDto dto)
    {
        if (dto.PersonnelId <= 0 || string.IsNullOrWhiteSpace(dto.Subject))
            return BadRequest(new { message = "Personel ve konu zorunludur." });

        var success = await _mailService.SendCustomMailAsync(dto);
        return Ok(new { success, message = success ? "Mail başarıyla gönderildi." : "Mail gönderilemedi." });
    }

    [HttpGet("birthday-summary")]
    public async Task<IActionResult> GetBirthdaySummary()
    {
        var summary = await _mailService.GetBirthdaySummaryAsync();
        return Ok(summary);
    }

    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs()
    {
        var logs = await _mailService.GetLogsAsync();
        return Ok(logs);
    }

    [HttpGet("logs/export")]
    public async Task<IActionResult> ExportLogs()
    {
        var bytes = await _mailService.ExportLogsExcelAsync();
        var fileName = $"mail_loglari_{DateTime.Now:yyyyMMdd_HHmm}.xlsx";
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
}
