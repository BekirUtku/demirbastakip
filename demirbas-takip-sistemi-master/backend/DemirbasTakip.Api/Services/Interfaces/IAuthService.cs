using DemirbasTakip.Api.Models.DTOs;

namespace DemirbasTakip.Api.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}
