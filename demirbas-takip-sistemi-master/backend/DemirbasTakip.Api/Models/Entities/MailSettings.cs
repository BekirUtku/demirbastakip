namespace DemirbasTakip.Api.Models.Entities;

public class MailSettings
{
    public int Id { get; set; }
    public string SmtpHost { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string FromEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool UseSsl { get; set; } = true;
    public TimeSpan SendTime { get; set; } = new TimeSpan(9, 0, 0);
    public string BirthdayMailTemplate { get; set; } = string.Empty;
    public string BirthdayMailSubject { get; set; } = "Doğum Günün Kutlu Olsun!";
    public string? AdminNotificationEmail { get; set; }
}
