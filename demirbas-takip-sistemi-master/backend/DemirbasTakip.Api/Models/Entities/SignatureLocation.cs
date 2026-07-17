namespace DemirbasTakip.Api.Models.Entities;

public class SignatureLocation
{
    public int Id { get; set; }

    public string Type { get; set; } = "Magaza";

    public string Name { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public string? LokumPhone { get; set; }

    public string? OgasPhone { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public ICollection<Personnel> Personnel { get; set; }
        = new List<Personnel>();
}