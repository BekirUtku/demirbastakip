using DemirbasTakip.Api.Models.DTOs;

namespace DemirbasTakip.Api.Services.Interfaces;

public interface IAssignmentService
{
    Task<List<AssignmentDto>> GetAllAsync();
    Task<List<AvailableAssetDto>> GetAvailableAssetsAsync();
    Task<AssignmentDto> CreateAsync(CreateAssignmentDto dto);
    Task<AssignmentDto?> ReturnAsync(int id, ReturnAssignmentDto dto);
    Task<byte[]> GenerateProtocolDocxAsync(int id);
    Task<byte[]> ExportExcelAsync();
}
