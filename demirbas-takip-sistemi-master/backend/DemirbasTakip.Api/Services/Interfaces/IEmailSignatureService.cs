using DemirbasTakip.Api.Models.DTOs;

namespace DemirbasTakip.Api.Services.Interfaces;

public interface IEmailSignatureService
{
    Task<EmailSignaturePreviewDto> PreviewAsync(
        int personnelId,
        CancellationToken cancellationToken = default);

    Task<GeneratedSignatureFile> GenerateZipAsync(
        int personnelId,
        CancellationToken cancellationToken = default);
}