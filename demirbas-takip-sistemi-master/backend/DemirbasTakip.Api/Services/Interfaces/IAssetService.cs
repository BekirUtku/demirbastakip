using DemirbasTakip.Api.Models.DTOs;

namespace DemirbasTakip.Api.Services.Interfaces;

public interface IAssetService
{
    Task<List<AssetDto>> GetAllAsync(AssetFilterDto filter);
    Task<AssetDto?> GetByIdAsync(int id);
    Task<AssetDto?> GetByBarcodeAsync(string barcode);
    Task<AssetDto> CreateAsync(CreateAssetDto dto);
    Task<AssetDto?> UpdateAsync(int id, UpdateAssetDto dto);
    Task<bool> DeleteAsync(int id);
    Task<byte[]> GetBarcodePngAsync(int id);
    Task<byte[]> ExportExcelAsync();
    Task<string> GenerateBarcodeAsync();
}
