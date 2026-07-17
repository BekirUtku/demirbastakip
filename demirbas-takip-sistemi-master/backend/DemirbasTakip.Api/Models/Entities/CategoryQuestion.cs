using DemirbasTakip.Api.Models.Enums;

namespace DemirbasTakip.Api.Models.Entities;

public class CategoryQuestion
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public AnswerType AnswerType { get; set; } = AnswerType.Text;
    public bool IsRequired { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedByUserId { get; set; }
    public string? UpdatedByUserName { get; set; }

    public Category Category { get; set; } = null!;
    public ICollection<AssetAnswer> Answers { get; set; } = new List<AssetAnswer>();
}
