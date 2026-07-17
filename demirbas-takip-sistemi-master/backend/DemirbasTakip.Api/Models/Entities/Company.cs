namespace DemirbasTakip.Api.Models.Entities;

public class Company
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? LogoPath { get; set; }
    public string? Address { get; set; }
    public string? MailAddress { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Personnel> Personnel { get; set; } = new List<Personnel>();
}
