namespace DemirbasTakip.Api.Models.Entities;

public class AssetAnswer
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public int CategoryQuestionId { get; set; }
    public string? AnswerValue { get; set; }

    public Asset Asset { get; set; } = null!;
    public CategoryQuestion CategoryQuestion { get; set; } = null!;
}
