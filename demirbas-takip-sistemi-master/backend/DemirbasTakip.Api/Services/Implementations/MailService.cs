using ClosedXML.Excel;
using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Models.Entities;
using DemirbasTakip.Api.Models.Enums;
using DemirbasTakip.Api.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using MimeKit;

namespace DemirbasTakip.Api.Services.Implementations;

public class MailService : IMailService
{
    private readonly AppDbContext _context;
    private readonly ILogger<MailService> _logger;
    private readonly IWebHostEnvironment _env;

    public MailService(AppDbContext context, ILogger<MailService> logger, IWebHostEnvironment env)
    {
        _context = context;
        _logger = logger;
        _env = env;
    }

    public async Task<MailSettingsDto?> GetSettingsAsync()
    {
        var settings = await _context.MailSettings.OrderBy(s => s.Id).FirstOrDefaultAsync();
        if (settings == null) return null;

        return MapToDto(settings);
    }

    public async Task<MailSettingsDto> UpdateSettingsAsync(UpdateMailSettingsDto dto)
    {
        var settings = await _context.MailSettings.OrderBy(s => s.Id).FirstOrDefaultAsync();

        if (settings == null)
        {
            settings = new MailSettings();
            _context.MailSettings.Add(settings);
        }

        settings.SmtpHost = dto.SmtpHost;
        settings.Port = dto.Port;
        settings.FromEmail = dto.FromEmail;
        settings.Password = dto.Password;
        settings.UseSsl = dto.UseSsl;
        settings.BirthdayMailTemplate = dto.BirthdayMailTemplate;
        settings.BirthdayMailSubject = dto.BirthdayMailSubject;
        settings.AdminNotificationEmail = string.IsNullOrWhiteSpace(dto.AdminNotificationEmail) ? null : dto.AdminNotificationEmail.Trim();

        if (TimeSpan.TryParse(dto.SendTime, out var sendTime))
            settings.SendTime = sendTime;

        await _context.SaveChangesAsync();
        return MapToDto(settings);
    }

    public async Task<bool> SendTestMailAsync(string toEmail)
    {
        var settings = await _context.MailSettings.OrderBy(s => s.Id).FirstOrDefaultAsync();
        if (settings == null) throw new InvalidOperationException("Mail ayarları yapılandırılmamış.");

        return await SendMailAsync(
            toEmail,
            "TEST MAİLİ - Demirbaş Takip Sistemi",
            "Bu bir test e-postasıdır. Mail ayarlarınız başarıyla çalışmaktadır.",
            MailType.Test
        );
    }

    public async Task<bool> SendCustomMailAsync(SendCustomMailDto dto)
    {
        var personnel = await _context.Personnel.FindAsync(dto.PersonnelId)
            ?? throw new KeyNotFoundException("Personel bulunamadı.");

        if (string.IsNullOrWhiteSpace(personnel.Email))
            throw new InvalidOperationException("Personelin e-posta adresi tanımlı değil.");

        return await SendMailAsync(personnel.Email, dto.Subject, dto.Body, MailType.Custom);
    }

    public async Task<bool> SendMailAsync(string to, string subject, string body, MailType mailType, string? birthdayImagePath = null)
    {
        var settings = await _context.MailSettings.OrderBy(s => s.Id).FirstOrDefaultAsync();
        if (settings == null || string.IsNullOrWhiteSpace(settings.SmtpHost))
        {
            _logger.LogWarning("Mail ayarları eksik, gönderim atlandı.");
            return false;
        }

        var log = new MailLog
        {
            RecipientEmail = to,
            Subject = subject,
            Body = body,
            MailType = mailType,
            SentAt = DateTime.Now
        };

        try
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(settings.FromEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;

            var formattedBody = RemoveBase64Images(body)
                .Replace("\r\n", "<br/>")
                .Replace("\r", "<br/>")
                .Replace("\n", "<br/>");

            BodyBuilder builder;

            if (!string.IsNullOrEmpty(birthdayImagePath))
            {
                // Doğum günü maili: CID (LinkedResource) — Gmail mobilde base64 engellenir
                builder = new BodyBuilder();
                if (File.Exists(birthdayImagePath))
                {
                    var image = builder.LinkedResources.Add(birthdayImagePath);
                    image.ContentId = Guid.NewGuid().ToString("N") + "@demirbas";
                    image.ContentDisposition = new ContentDisposition(ContentDisposition.Inline);

                    builder.HtmlBody =
                        "<div style='font-family:Arial,sans-serif;font-size:14px;color:#0f172a;max-width:600px;margin:0 auto;padding:24px;'>" +
                        $"<div style='margin-bottom:24px;'>{formattedBody}</div>" +
                        $"<img src=\"cid:{image.ContentId}\" alt='Doğum Günü' style='max-width:600px;width:100%;height:auto;display:block;' />" +
                        "</div>";
                }
                else
                {
                    _logger.LogWarning("Doğum günü görseli bulunamadı: {Path}", birthdayImagePath);
                    builder.HtmlBody =
                        "<div style='font-family:Arial,sans-serif;font-size:14px;color:#0f172a;max-width:600px;margin:0 auto;padding:24px;'>" +
                        $"<div>{formattedBody}</div>" +
                        "</div>";
                }
                builder.TextBody = RemoveBase64Images(body);
            }
            else
            {
                // Test / özel mailler: mevcut base64 logo yöntemi korunuyor
                string logoHtml = "";
                var logoPath = Path.Combine(_env.WebRootPath ?? "", "images", "mail-logo.jpg");
                if (File.Exists(logoPath))
                {
                    var logoBytes = await File.ReadAllBytesAsync(logoPath);
                    var base64 = Convert.ToBase64String(logoBytes);
                    logoHtml = "<div style='text-align:center;margin-top:28px;'>" +
                               $"<img src='data:image/jpeg;base64,{base64}' style='width:100%;max-width:480px;height:auto;border-radius:12px;display:block;margin:0 auto;' /></div>";
                }

                builder = new BodyBuilder
                {
                    HtmlBody =
                        "<div style='font-family:Arial,sans-serif;font-size:14px;color:#0f172a;max-width:600px;margin:0 auto;padding:24px;'>" +
                        $"<div style='margin-bottom:24px;'>{formattedBody}</div>" +
                        $"{logoHtml}" +
                        "</div>"
                };
            }

            message.Body = builder.ToMessageBody();

            SecureSocketOptions secureOption;
            if (!settings.UseSsl)
                secureOption = SecureSocketOptions.None;
            else if (settings.Port == 465)
                secureOption = SecureSocketOptions.SslOnConnect;
            else
                secureOption = SecureSocketOptions.StartTls;

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(15));
            using var client = new SmtpClient();
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;
            await client.ConnectAsync(settings.SmtpHost, settings.Port, secureOption, cts.Token);
            await client.AuthenticateAsync(settings.FromEmail, settings.Password, cts.Token);
            await client.SendAsync(message, cts.Token);
            await client.DisconnectAsync(true, cts.Token);

            log.IsSuccess = true;
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Mail gönderimi zaman aşımına uğradı: {Host}:{Port}", settings.SmtpHost, settings.Port);
            log.IsSuccess = false;
            log.ErrorMessage = $"Bağlantı zaman aşımı ({settings.SmtpHost}:{settings.Port}). Sunucu ayarlarını kontrol edin.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mail gönderimi başarısız: {To}", to);
            log.IsSuccess = false;
            log.ErrorMessage = ex.Message;
        }

        _context.MailLogs.Add(log);
        await _context.SaveChangesAsync();

        return log.IsSuccess;
    }

    public async Task<List<MailLogDto>> GetLogsAsync()
    {
        return await _context.MailLogs
            .OrderByDescending(l => l.SentAt)
            .Select(l => new MailLogDto
            {
                Id = l.Id,
                RecipientEmail = l.RecipientEmail,
                Subject = l.Subject,
                IsSuccess = l.IsSuccess,
                ErrorMessage = l.ErrorMessage,
                SentAt = l.SentAt,
                MailType = l.MailType
            })
            .ToListAsync();
    }

    public async Task<byte[]> ExportLogsExcelAsync()
    {
        var logs = await _context.MailLogs.OrderByDescending(l => l.SentAt).ToListAsync();

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("MAİL LOGLARI");

        ws.Cell(1, 1).Value = "ALICI";
        ws.Cell(1, 2).Value = "KONU";
        ws.Cell(1, 3).Value = "TİP";
        ws.Cell(1, 4).Value = "DURUM";
        ws.Cell(1, 5).Value = "HATA";
        ws.Cell(1, 6).Value = "GÖNDERİM TARİHİ";

        ws.Range(1, 1, 1, 6).Style.Font.Bold = true;
        ws.Range(1, 1, 1, 6).Style.Fill.BackgroundColor = XLColor.FromHtml("#2dd4bf");

        int row = 2;
        foreach (var log in logs)
        {
            ws.Cell(row, 1).Value = log.RecipientEmail;
            ws.Cell(row, 2).Value = log.Subject;
            ws.Cell(row, 3).Value = log.MailType switch { MailType.Birthday => "DOĞUM GÜNÜ", MailType.Test => "TEST", _ => "ÖZEL" };
            ws.Cell(row, 4).Value = log.IsSuccess ? "BAŞARILI" : "BAŞARISIZ";
            ws.Cell(row, 5).Value = log.ErrorMessage ?? "";
            ws.Cell(row, 6).Value = log.SentAt.ToString("dd.MM.yyyy HH:mm");
            row++;
        }

        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    public async Task<BirthdaySummaryDto> GetBirthdaySummaryAsync()
    {
        var today = DateTime.Today;
        var logs = await _context.MailLogs
            .Where(l => l.MailType == MailType.Birthday && l.SentAt.Date == today)
            .OrderByDescending(l => l.SentAt)
            .ToListAsync();

        if (!logs.Any())
            return new BirthdaySummaryDto { Date = today, Items = [] };

        return new BirthdaySummaryDto
        {
            Date = today,
            TotalCount = logs.Count,
            SuccessCount = logs.Count(l => l.IsSuccess),
            FailCount = logs.Count(l => !l.IsSuccess),
            Items = logs.Select(l => new BirthdaySummaryItemDto
            {
                PersonnelName = l.Subject,
                Email = l.RecipientEmail,
                IsSuccess = l.IsSuccess,
                ErrorMessage = l.ErrorMessage,
                SentAt = l.SentAt
            }).ToList()
        };
    }

    public async Task<bool> SendMailWithAttachmentAsync(string to, string subject, string body, MailType mailType, byte[] attachmentBytes, string attachmentFileName)
    {
        var settings = await _context.MailSettings.OrderBy(s => s.Id).FirstOrDefaultAsync();
        if (settings == null || string.IsNullOrWhiteSpace(settings.SmtpHost))
        {
            _logger.LogWarning("Mail ayarları eksik, gönderim atlandı.");
            return false;
        }

        var log = new MailLog
        {
            RecipientEmail = to,
            Subject = subject,
            Body = body,
            MailType = mailType,
            SentAt = DateTime.Now
        };

        try
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(settings.FromEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;

            var htmlBody = $"<div style='font-family:Arial,sans-serif;font-size:14px;color:#0f172a;max-width:600px;margin:0 auto;padding:24px;'>" +
                           $"<div style='margin-bottom:24px;'>{body.Replace("\r\n", "<br/>").Replace("\r", "<br/>").Replace("\n", "<br/>")}</div>" +
                           $"</div>";

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            builder.Attachments.Add(attachmentFileName, attachmentBytes, new ContentType("application", "pdf"));
            message.Body = builder.ToMessageBody();

            SecureSocketOptions secureOption;
            if (!settings.UseSsl)
                secureOption = SecureSocketOptions.None;
            else if (settings.Port == 465)
                secureOption = SecureSocketOptions.SslOnConnect;
            else
                secureOption = SecureSocketOptions.StartTls;

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(15));
            using var client = new SmtpClient();
            client.ServerCertificateValidationCallback = (s, c, h, e) => true;
            await client.ConnectAsync(settings.SmtpHost, settings.Port, secureOption, cts.Token);
            await client.AuthenticateAsync(settings.FromEmail, settings.Password, cts.Token);
            await client.SendAsync(message, cts.Token);
            await client.DisconnectAsync(true, cts.Token);

            log.IsSuccess = true;
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Mail gönderimi zaman aşımına uğradı: {Host}:{Port}", settings.SmtpHost, settings.Port);
            log.IsSuccess = false;
            log.ErrorMessage = $"Bağlantı zaman aşımı ({settings.SmtpHost}:{settings.Port}). Sunucu ayarlarını kontrol edin.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mail gönderimi başarısız: {To}", to);
            log.IsSuccess = false;
            log.ErrorMessage = ex.Message;
        }

        _context.MailLogs.Add(log);
        await _context.SaveChangesAsync();

        return log.IsSuccess;
    }

    private static string RemoveBase64Images(string html)
    {
        if (string.IsNullOrEmpty(html)) return html;
        return System.Text.RegularExpressions.Regex.Replace(
            html,
            @"<img[^>]*src=[""']data:image\/[^""']*[""'][^>]*>",
            string.Empty,
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    }

    private static MailSettingsDto MapToDto(MailSettings s) => new()
    {
        Id = s.Id,
        SmtpHost = s.SmtpHost,
        Port = s.Port,
        FromEmail = s.FromEmail,
        Password = s.Password,
        UseSsl = s.UseSsl,
        SendTime = s.SendTime.ToString(@"hh\:mm"),
        BirthdayMailTemplate = s.BirthdayMailTemplate,
        BirthdayMailSubject = s.BirthdayMailSubject,
        AdminNotificationEmail = s.AdminNotificationEmail
    };
}
