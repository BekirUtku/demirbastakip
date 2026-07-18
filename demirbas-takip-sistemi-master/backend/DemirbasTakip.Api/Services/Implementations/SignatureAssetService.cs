using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Models.Entities;
using DemirbasTakip.Api.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Services.Implementations;

public class SignatureAssetService : ISignatureAssetService
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    private const string UploadDir = "signatures/uploads";

    public SignatureAssetService(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    private static int DefaultWidth(string kind) => kind switch
    {
        "logo" => 150,
        "efatura" => 130,
        _ => 220,
    };

    private static SignatureAssetDto Map(SignatureAsset a) => new()
    {
        Id = a.Id,
        Company = a.Company,
        Kind = a.Kind,
        Url = $"/{UploadDir}/{a.FileName}",
        OriginalName = a.OriginalName,
        Width = a.Width,
        SortOrder = a.SortOrder,
        IsActive = a.IsActive,
    };

    public async Task<List<SignatureAssetDto>> GetAsync(string? company, string? kind)
    {
        var q = _context.SignatureAssets.AsQueryable();
        if (!string.IsNullOrWhiteSpace(company)) q = q.Where(a => a.Company == company);
        if (!string.IsNullOrWhiteSpace(kind)) q = q.Where(a => a.Kind == kind);
        var list = await q
            .OrderBy(a => a.Company).ThenBy(a => a.Kind)
            .ThenBy(a => a.SortOrder).ThenBy(a => a.Id)
            .ToListAsync();
        return list.Select(Map).ToList();
    }

    public async Task<SignatureAssetDto> UploadAsync(string company, string kind, int? width, IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new InvalidOperationException("Dosya boş.");

        var webroot = _env.WebRootPath
            ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var dir = Path.Combine(webroot, "signatures", "uploads");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext)) ext = ".png";
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var full = Path.Combine(dir, fileName);

        await using (var fs = new FileStream(full, FileMode.Create))
        {
            await file.CopyToAsync(fs);
        }

        var maxOrder = await _context.SignatureAssets
            .Where(a => a.Company == company && a.Kind == kind)
            .Select(a => (int?)a.SortOrder)
            .MaxAsync() ?? 0;

        var asset = new SignatureAsset
        {
            Company = company,
            Kind = kind,
            FileName = fileName,
            OriginalName = file.FileName,
            Width = width.GetValueOrDefault() > 0 ? width!.Value : DefaultWidth(kind),
            SortOrder = maxOrder + 1,
            IsActive = true,
        };

        _context.SignatureAssets.Add(asset);
        await _context.SaveChangesAsync();
        return Map(asset);
    }

    public async Task<SignatureAssetDto?> UpdateAsync(int id, UpdateSignatureAssetDto dto)
    {
        var asset = await _context.SignatureAssets.FindAsync(id);
        if (asset == null) return null;
        if (dto.Width > 0) asset.Width = dto.Width;
        asset.SortOrder = dto.SortOrder;
        asset.IsActive = dto.IsActive;
        await _context.SaveChangesAsync();
        return Map(asset);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var asset = await _context.SignatureAssets.FindAsync(id);
        if (asset == null) return false;

        try
        {
            var webroot = _env.WebRootPath
                ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var full = Path.Combine(webroot, "signatures", "uploads", asset.FileName);
            if (File.Exists(full)) File.Delete(full);
        }
        catch { /* dosya silinemezse kaydı yine de sil */ }

        _context.SignatureAssets.Remove(asset);
        await _context.SaveChangesAsync();
        return true;
    }
}
