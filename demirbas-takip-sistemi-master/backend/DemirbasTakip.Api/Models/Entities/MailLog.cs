using DemirbasTakip.Api.Models.Enums;

namespace DemirbasTakip.Api.Models.Entities;

public class MailLog
{
    public int Id { get; set; }
    public string RecipientEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? Body { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime SentAt { get; set; } = DateTime.Now;
    public MailType MailType { get; set; } = MailType.Custom;
}
