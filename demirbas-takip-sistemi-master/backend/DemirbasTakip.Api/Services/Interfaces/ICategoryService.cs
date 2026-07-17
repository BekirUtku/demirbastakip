using DemirbasTakip.Api.Models.DTOs;

namespace DemirbasTakip.Api.Services.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
    Task<CategoryDto?> GetByIdAsync(int id);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
    Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto);
    Task<bool> DeleteAsync(int id);
    Task<CategoryQuestionDto> AddQuestionAsync(int categoryId, CreateCategoryQuestionDto dto);
    Task<bool> DeleteQuestionAsync(int questionId);
}
