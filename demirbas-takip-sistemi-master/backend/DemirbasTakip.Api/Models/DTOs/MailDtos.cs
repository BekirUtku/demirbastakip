using DemirbasTakip.Api.Models.Enums;

namespace DemirbasTakip.Api.Models.DTOs;

public class MailSettingsDto
{
    public int Id { get; set; }
    public string SmtpHost { get; set; } = string.Empty;
    public int Port { get; set; }
    public string FromEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool UseSsl { get; set; }
    public string SendTime { get; set; } = "09:00";
    public string BirthdayMailTemplate { get; set; } = string.Empty;
    public string BirthdayMailSubject { get; set; } = string.Empty;
    public string? AdminNotificationEmail { get; set; }
}

public class UpdateMailSettingsDto
{
    public string SmtpHost { get; set; } = string.Empty;
    public int Port { get; set; }
    public string FromEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool UseSsl { get; set; }
    public string SendTime { get; set; } = "09:00";
    public string BirthdayMailTemplate { get; set; } = string.Empty;
    public string BirthdayMailSubject { get; set; } = string.Empty;
    public string? AdminNotificationEmail { get; set; }
}

public class BirthdaySummaryItemDto
{
    public string PersonnelName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime SentAt { get; set; }
}

public class BirthdaySummaryDto
{
    public DateTime? Date { get; set; }
    public int TotalCount { get; set; }
    public int SuccessCount { get; set; }
    public int FailCount { get; set; }
    public List<BirthdaySummaryItemDto> Items { get; set; } = [];
}

public class SendTestMailDto
{
    public string ToEmail { get; set; } = string.Empty;
}

public class SendCustomMailDto
{
    public int PersonnelId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class MailLogDto
{
    public int Id { get; set; }
    public string RecipientEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime SentAt { get; set; }
    public MailType MailType { get; set; }
    public string MailTypeLabel => MailType switch
    {
        MailType.Birthday => "Doğum Günü",
        MailType.Test => "Test",
        MailType.Custom => "Özel",
        _ => "Özel"
    };
}
