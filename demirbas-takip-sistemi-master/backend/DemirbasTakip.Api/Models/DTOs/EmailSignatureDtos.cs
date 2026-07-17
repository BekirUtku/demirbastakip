namespace DemirbasTakip.Api.Models.DTOs;

public class SignatureLocationDto
{
    public int Id { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public string? LokumPhone { get; set; }

    public string? OgasPhone { get; set; }

    public bool IsActive { get; set; }
}

public class SaveSignatureLocationDto
{
    public string Type { get; set; } = "Magaza";

    public string Name { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public string? LokumPhone { get; set; }

    public string? OgasPhone { get; set; }

    public bool IsActive { get; set; } = true;
}

public class GenerateEmailSignatureDto
{
    public int PersonnelId { get; set; }
}

public class EmailSignaturePreviewDto
{
    public string Html { get; set; } = string.Empty;

    public string PersonnelName { get; set; } = string.Empty;

    public string CompanyName { get; set; } = string.Empty;
}

public class SignatureHtmlDto
{
    public string Name { get; set; } = string.Empty;

    public string Html { get; set; } = string.Empty;
}

public class GeneratedSignatureFile
{
    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public string Data { get; set; } = string.Empty;
}