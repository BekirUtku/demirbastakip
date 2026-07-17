using DemirbasTakip.Api.Models.Enums;

namespace DemirbasTakip.Api.Models.DTOs;

public class AssetAnswerDto
{
    public int CategoryQuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? AnswerValue { get; set; }
    public AnswerType AnswerType { get; set; }
}

public class AssetAnswerInputDto
{
    public int CategoryQuestionId { get; set; }
    public string? AnswerValue { get; set; }
}

public class AssetDto
{
    public int Id { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public AssetStatus Status { get; set; }
    public string StatusLabel => Status switch
    {
        AssetStatus.Kayitli => "Kayıtlı",
        AssetStatus.Zimmetli => "Zimmetli",
        AssetStatus.Pasif => "Pasif",
        _ => "Kayıtlı"
    };
    public List<AssetAnswerDto> Answers { get; set; } = new();
    public List<AssignmentSummaryDto> AssignmentHistory { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
}

public class AssignmentSummaryDto
{
    public int Id { get; set; }
    public string PersonnelFullName { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
    public DateTime? ReturnedAt { get; set; }
    public string? Notes { get; set; }
    public string? ReturnNotes { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CreateAssetDto
{
    public string Name { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public List<AssetAnswerInputDto> Answers { get; set; } = new();
}

public class UpdateAssetDto
{
    public string Name { get; set; } = string.Empty;
    public string? SerialNumber { get; set; }
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public AssetStatus Status { get; set; }
    public List<AssetAnswerInputDto> Answers { get; set; } = new();
}

public class AssetFilterDto
{
    public int? CategoryId { get; set; }
    public AssetStatus? Status { get; set; }
    public string? Search { get; set; }
}
