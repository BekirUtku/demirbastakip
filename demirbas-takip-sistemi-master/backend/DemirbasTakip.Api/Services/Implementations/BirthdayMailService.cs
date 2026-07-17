using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.Enums;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Linq;

namespace DemirbasTakip.Api.Services.Implementations;

public class BirthdayMailService : IBirthdayMailService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BirthdayMailService> _logger;
    private readonly IConfiguration _configuration;

    public BirthdayMailService(IServiceScopeFactory scopeFactory, ILogger<BirthdayMailService> logger, IConfiguration configuration)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _configuration = configuration;
    }

    private string GetBirthdayImagePath(string companyName)
    {
        var normalized = (companyName ?? string.Empty).Trim().ToUpperInvariant();

        var baseDir = AppContext.BaseDirectory;
        if (normalized.Contains("OGAŞ") || normalized.Contains("OGAS"))
        {
            return _configuration["BirthdayImages:Ogas"]
                ?? Path.Combine(baseDir, "wwwroot", "logos", "O-Bday-Picture.png");
        }

        return _configuration["BirthdayImages:Default"]
            ?? Path.Combine(baseDir, "wwwroot", "logos", "LA-Bday-Picture.png");
    }

    // Hangfire scheduler çağırır: saat penceresi + tekrar engeli kontrolü
    public async Task CheckAndSendBirthdayMailsAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var settings = await context.MailSettings.OrderBy(s => s.Id).FirstOrDefaultAsync();
        if (settings == null || string.IsNullOrWhiteSpace(settings.SmtpHost))
        {
            _logger.LogDebug("Mail ayarları eksik, doğum günü kontrolü atlandı.");
            return;
        }

        var now = DateTime.Now;
        if (now.Hour != settings.SendTime.Hours || now.Minute != settings.SendTime.Minutes)
            return;

        var today = now.Date;
        var alreadySentToday = await context.MailLogs.AnyAsync(l =>
            l.MailType == MailType.Birthday &&
            l.IsSuccess &&
            l.SentAt >= today && l.SentAt < today.AddDays(1));

        if (alreadySentToday)
        {
            _logger.LogDebug("Bugün için doğum günü mailleri zaten gönderilmiş.");
            return;
        }

        await SendCoreAsync(scope, today);
    }

    // ŞİMDİ GÖNDER butonu çağırır: hiçbir kontrol yok, direkt gönder
    public async Task ForceSendBirthdayMailsAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        await SendCoreAsync(scope, DateTime.Today);
    }

    private async Task SendCoreAsync(IServiceScope scope, DateTime today)
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var mailService = scope.ServiceProvider.GetRequiredService<IMailService>();

        var settings = await context.MailSettings.OrderBy(s => s.Id).FirstOrDefaultAsync();
        if (settings == null || string.IsNullOrWhiteSpace(settings.SmtpHost))
        {
            _logger.LogWarning("Mail ayarları eksik, doğum günü gönderilemedi.");
            return;
        }

        var birthdayPersonnel = await context.Personnel
            .Include(p => p.Company)
            .Where(p =>
                p.IsActive &&
                p.BirthDate.HasValue &&
                !string.IsNullOrEmpty(p.Email) &&
                p.BirthDate.Value.Month == today.Month &&
                p.BirthDate.Value.Day == today.Day)
            .ToListAsync();

        if (!birthdayPersonnel.Any())
        {
            _logger.LogInformation("Bugün ({Date}) doğum günü olan aktif personel bulunamadı.", today.ToString("dd.MM.yyyy"));
            return;
        }

        _logger.LogInformation("Bugün doğum günü olan {Count} personele mail gönderiliyor.", birthdayPersonnel.Count);

        var results = new List<(string Name, string Email, bool Success, string? Error)>();

        foreach (var person in birthdayPersonnel)
        {
            try
            {
                var body = settings.BirthdayMailTemplate
                    .Replace("{PersonelAdSoyad}", $"{person.FirstName} {person.LastName}")
                    .Replace("{PersonelAd}", person.FirstName)
                    .Replace("{PersonelFirma}", person.Company?.CompanyName ?? person.Company?.Name ?? "Şirketimiz");

                var imagePath = GetBirthdayImagePath(person.Company?.Name ?? string.Empty);

                var success = await mailService.SendMailAsync(
                    person.Email!,
                    settings.BirthdayMailSubject,
                    body,
                    MailType.Birthday,
                    imagePath
                );

                results.Add(($"{person.FirstName} {person.LastName}", person.Email!, success, null));
                _logger.LogInformation("Doğum günü maili {Status}: {Email}", success ? "gönderildi" : "gönderilemedi", person.Email);
            }
            catch (Exception ex)
            {
                results.Add(($"{person.FirstName} {person.LastName}", person.Email!, false, ex.Message));
                _logger.LogError(ex, "Doğum günü maili gönderilemedi: {Email}", person.Email);
            }
        }

        if (!string.IsNullOrWhiteSpace(settings.AdminNotificationEmail))
            await SendAdminSummaryAsync(mailService, settings.AdminNotificationEmail, results, today);
    }

    private static async Task SendAdminSummaryAsync(
        IMailService mailService,
        string adminEmail,
        List<(string Name, string Email, bool Success, string? Error)> results,
        DateTime date)
    {
        var successCount = results.Count(r => r.Success);
        var failCount = results.Count(r => !r.Success);


        var pdfBytes = GenerateBirthdayReportPdf(results, date);
        var pdfFileName = $"dogum_gunu_raporu_{date:yyyyMMdd}.pdf";
        var subject = $"Doğum Günü Mail Raporu — {date:dd.MM.yyyy}";

                var html =
            $"<div style='font-family:Arial,sans-serif;font-size:14px;color:#0f172a;'>" +
            $"<h2 style='color:#0f172a;border-bottom:2px solid #2dd4bf;padding-bottom:8px;'>Doğum Günü Mail Gönderim Raporu</h2>" +
            $"<p><strong>{date:dd.MM.yyyy}</strong> tarihi için gönderim tamamlandı.</p>" +
            $"<p>Toplam: <strong>{results.Count}</strong> &nbsp;|&nbsp; Başarılı: <strong style='color:#10b981;'>{successCount}</strong> &nbsp;|&nbsp; Başarısız: <strong style='color:#ef4444;'>{failCount}</strong></p>" +
            $"<p style='color:#64748b;font-size:12px;'>Detaylı rapor ek olarak gönderilmiştir.</p>" +
            $"</div>";

        var recipients = adminEmail
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(e => !string.IsNullOrWhiteSpace(e));

        foreach (var recipient in recipients)
        {
            await mailService.SendMailWithAttachmentAsync(
                recipient,
                subject,
                html,
                MailType.Custom,
                pdfBytes,
                pdfFileName
            );
        }
    }

    private static byte[] GenerateBirthdayReportPdf(
        List<(string Name, string Email, bool Success, string? Error)> results,
        DateTime date)
    {
        var successCount = results.Count(r => r.Success);
        var failCount = results.Count(r => !r.Success);

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().DefaultTextStyle(t => t.Bold().FontSize(16))
                        .Text($"Doğum Günü Mail Raporu — {date:dd.MM.yyyy}");
                    col.Item().PaddingTop(4).DefaultTextStyle(t => t.FontSize(11).FontColor(Colors.Grey.Darken1))
                        .Text($"Toplam: {results.Count}   |   Başarılı: {successCount}   |   Başarısız: {failCount}");
                    col.Item().PaddingTop(6).Height(1).Background(Colors.Grey.Lighten2);
                });

                page.Content().PaddingTop(16).Table(table =>
                {
                    table.ColumnsDefinition(cols =>
                    {
                        cols.RelativeColumn(3);
                        cols.RelativeColumn(4);
                        cols.RelativeColumn(2);
                        cols.RelativeColumn(3);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Background("#e2e8f0").Padding(6).DefaultTextStyle(t => t.Bold().FontSize(9)).Text("PERSONEL");
                        header.Cell().Background("#e2e8f0").Padding(6).DefaultTextStyle(t => t.Bold().FontSize(9)).Text("E-POSTA");
                        header.Cell().Background("#e2e8f0").Padding(6).DefaultTextStyle(t => t.Bold().FontSize(9)).Text("DURUM");
                        header.Cell().Background("#e2e8f0").Padding(6).DefaultTextStyle(t => t.Bold().FontSize(9)).Text("HATA");
                    });

                    foreach (var r in results)
                    {
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(r.Name);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text(r.Email);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6)
                            .DefaultTextStyle(t => t.Bold().FontColor(r.Success ? "#10b981" : "#ef4444"))
                            .Text(r.Success ? "BAŞARILI" : "BAŞARISIZ");
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6)
                            .DefaultTextStyle(t => t.FontColor("#ef4444").FontSize(9))
                            .Text(r.Error ?? "-");
                    }
                });

                page.Footer().AlignRight()
                    .DefaultTextStyle(t => t.FontSize(8).FontColor(Colors.Grey.Medium))
                    .Text(t =>
                    {
                        t.Span("Sayfa ");
                        t.CurrentPageNumber();
                        t.Span(" / ");
                        t.TotalPages();
                    });
            });
        }).GeneratePdf();
    }
}
