using DemirbasTakip.Api.Models.Enums;

namespace DemirbasTakip.Api.Models.DTOs;

public class CategoryQuestionDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public AnswerType AnswerType { get; set; }
    public string AnswerTypeLabel => AnswerType switch
    {
        AnswerType.Text => "Metin",
        AnswerType.Number => "Sayı",
        AnswerType.YesNo => "Evet/Hayır",
        _ => "Metin"
    };
    public bool IsRequired { get; set; }
    public int DisplayOrder { get; set; }
}

public class CreateCategoryQuestionDto
{
    public string QuestionText { get; set; } = string.Empty;
    public AnswerType AnswerType { get; set; } = AnswerType.Text;
    public bool IsRequired { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public List<CategoryQuestionDto> Questions { get; set; } = new();
    public int AssetCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
}

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
