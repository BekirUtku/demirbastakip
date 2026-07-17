using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Models.Entities;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CategoryService(AppDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var categories = await _context.Categories
            .Include(c => c.Questions.OrderBy(q => q.DisplayOrder))
            .Include(c => c.Assets)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return categories.Select(MapToDto).ToList();
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Questions.OrderBy(q => q.DisplayOrder))
            .Include(c => c.Assets)
            .FirstOrDefaultAsync(c => c.Id == id);

        return category == null ? null : MapToDto(category);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            IsActive = true,
            CreatedAt = DateTime.Now,
            CreatedByUserId = _currentUser.UserId,
            CreatedByUserName = _currentUser.UserName
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return MapToDto(category);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto)
    {
        var category = await _context.Categories
            .Include(c => c.Questions)
            .Include(c => c.Assets)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null) return null;

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.IsActive = dto.IsActive;
        category.UpdatedAt = DateTime.Now;
        category.UpdatedByUserId = _currentUser.UserId;
        category.UpdatedByUserName = _currentUser.UserName;

        await _context.SaveChangesAsync();
        return MapToDto(category);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Assets)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null) return false;
        if (category.Assets.Any()) throw new InvalidOperationException("Bu kategoriye ait demirbaşlar bulunmaktadır. Önce demirbaşları silin veya kategorisini değiştirin.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<CategoryQuestionDto> AddQuestionAsync(int categoryId, CreateCategoryQuestionDto dto)
    {
        var category = await _context.Categories.FindAsync(categoryId)
            ?? throw new KeyNotFoundException("Kategori bulunamadı.");

        var question = new CategoryQuestion
        {
            CategoryId = categoryId,
            QuestionText = dto.QuestionText,
            AnswerType = dto.AnswerType,
            IsRequired = dto.IsRequired,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.Now,
            CreatedByUserId = _currentUser.UserId,
            CreatedByUserName = _currentUser.UserName
        };

        _context.CategoryQuestions.Add(question);
        await _context.SaveChangesAsync();

        return new CategoryQuestionDto
        {
            Id = question.Id,
            CategoryId = question.CategoryId,
            QuestionText = question.QuestionText,
            AnswerType = question.AnswerType,
            IsRequired = question.IsRequired,
            DisplayOrder = question.DisplayOrder
        };
    }

    public async Task<bool> DeleteQuestionAsync(int questionId)
    {
        var question = await _context.CategoryQuestions.FindAsync(questionId);
        if (question == null) return false;

        _context.CategoryQuestions.Remove(question);
        await _context.SaveChangesAsync();
        return true;
    }

    private static CategoryDto MapToDto(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Description = c.Description,
        IsActive = c.IsActive,
        AssetCount = c.Assets?.Count ?? 0,
        CreatedAt = c.CreatedAt,
        CreatedByUserName = c.CreatedByUserName,
        Questions = c.Questions?.Select(q => new CategoryQuestionDto
        {
            Id = q.Id,
            CategoryId = q.CategoryId,
            QuestionText = q.QuestionText,
            AnswerType = q.AnswerType,
            IsRequired = q.IsRequired,
            DisplayOrder = q.DisplayOrder
        }).ToList() ?? new()
    };
}
