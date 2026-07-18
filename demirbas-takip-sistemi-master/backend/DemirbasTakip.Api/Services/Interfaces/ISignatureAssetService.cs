using DemirbasTakip.Api.Models.DTOs;
using Microsoft.AspNetCore.Http;

namespace DemirbasTakip.Api.Services.Interfaces;

public interface ISignatureAssetService
{
    Task<List<SignatureAssetDto>> GetAsync(string? company, string? kind);
    Task<SignatureAssetDto> UploadAsync(string company, string kind, int? width, IFormFile file);
    Task<SignatureAssetDto?> UpdateAsync(int id, UpdateSignatureAssetDto dto);
    Task<bool> DeleteAsync(int id);
}
