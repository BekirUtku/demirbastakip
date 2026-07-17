using DemirbasTakip.Api.Models.DTOs;

namespace DemirbasTakip.Api.Services.Interfaces;

public interface IMailService
{
    Task<MailSettingsDto?> GetSettingsAsync();
    Task<MailSettingsDto> UpdateSettingsAsync(UpdateMailSettingsDto dto);
    Task<bool> SendTestMailAsync(string toEmail);
    Task<bool> SendCustomMailAsync(SendCustomMailDto dto);
    Task<List<MailLogDto>> GetLogsAsync();
    Task<byte[]> ExportLogsExcelAsync();
    Task<bool> SendMailAsync(string to, string subject, string body, Models.Enums.MailType mailType, string? birthdayImagePath = null);
    Task<BirthdaySummaryDto> GetBirthdaySummaryAsync();
    Task<bool> SendMailWithAttachmentAsync(string to, string subject, string body, Models.Enums.MailType mailType, byte[] attachmentBytes, string attachmentFileName);
}
