namespace DemirbasTakip.Api.Services.Interfaces;

public interface IBirthdayMailService
{
    Task CheckAndSendBirthdayMailsAsync();  // Scheduler: saat kontrolü + tekrar engeli var
    Task ForceSendBirthdayMailsAsync();     // ŞİMDİ GÖNDER: kontrolsüz, direkt gönder
}
