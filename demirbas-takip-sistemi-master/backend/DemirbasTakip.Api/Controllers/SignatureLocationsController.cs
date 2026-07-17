using DemirbasTakip.Api.Data;
using DemirbasTakip.Api.Models.DTOs;
using DemirbasTakip.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DemirbasTakip.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/signature-locations")]
public class SignatureLocationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SignatureLocationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<SignatureLocationDto>>> GetAll(
        CancellationToken cancellationToken)
    {
        var locations = await _context.SignatureLocations
            .AsNoTracking()
            .OrderByDescending(x => x.IsActive)
            .ThenBy(x => x.Name)
            .Select(x => new SignatureLocationDto
            {
                Id = x.Id,
                Type = x.Type,
                Name = x.Name,
                DisplayName = x.DisplayName,
                AddressLine1 = x.AddressLine1,
                AddressLine2 = x.AddressLine2,
                LokumPhone = x.LokumPhone,
                OgasPhone = x.OgasPhone,
                IsActive = x.IsActive
            })
            .ToListAsync(cancellationToken);

        return Ok(locations);
    }

    [HttpPost]
    public async Task<ActionResult<SignatureLocationDto>> Create(
        SaveSignatureLocationDto dto,
        CancellationToken cancellationToken)
    {
        if (dto.Type is not ("Merkez" or "Magaza"))
        {
            return BadRequest(new
            {
                message = "Lokasyon tipi Merkez veya Magaza olmalıdır."
            });
        }

        var location = new SignatureLocation
        {
            Type = dto.Type,
            Name = dto.Name.Trim(),
            DisplayName = dto.DisplayName.Trim(),
            AddressLine1 = dto.AddressLine1?.Trim(),
            AddressLine2 = dto.AddressLine2?.Trim(),
            LokumPhone = dto.LokumPhone?.Trim(),
            OgasPhone = dto.OgasPhone?.Trim(),
            IsActive = dto.IsActive,
            CreatedAt = DateTime.Now
        };

        _context.SignatureLocations.Add(location);
        await _context.SaveChangesAsync(cancellationToken);

        var result = new SignatureLocationDto
        {
            Id = location.Id,
            Type = location.Type,
            Name = location.Name,
            DisplayName = location.DisplayName,
            AddressLine1 = location.AddressLine1,
            AddressLine2 = location.AddressLine2,
            LokumPhone = location.LokumPhone,
            OgasPhone = location.OgasPhone,
            IsActive = location.IsActive
        };

        return Ok(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        SaveSignatureLocationDto dto,
        CancellationToken cancellationToken)
    {
        if (dto.Type is not ("Merkez" or "Magaza"))
        {
            return BadRequest(new
            {
                message = "Lokasyon tipi Merkez veya Magaza olmalıdır."
            });
        }

        var location = await _context.SignatureLocations
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (location == null)
        {
            return NotFound();
        }

        location.Type = dto.Type;
        location.Name = dto.Name.Trim();
        location.DisplayName = dto.DisplayName.Trim();
        location.AddressLine1 = dto.AddressLine1?.Trim();
        location.AddressLine2 = dto.AddressLine2?.Trim();
        location.LokumPhone = dto.LokumPhone?.Trim();
        location.OgasPhone = dto.OgasPhone?.Trim();
        location.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var location = await _context.SignatureLocations
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (location == null)
        {
            return NotFound();
        }

        var isUsed = await _context.Personnel
            .AnyAsync(
                x => x.SignatureLocationId == id,
                cancellationToken);

        if (isUsed)
        {
            return Conflict(new
            {
                message = "Bu lokasyon personele bağlı olduğu için silinemez."
            });
        }

        _context.SignatureLocations.Remove(location);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}