using Microsoft.AspNetCore.Authentication;

namespace api;

using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

public class TokenService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TokenService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<string> GetEmailFromAccessTokenAsync()
    {
        var accessToken = await _httpContextAccessor.HttpContext.GetTokenAsync("access_token");
        
        if (string.IsNullOrEmpty(accessToken))
        {
            throw new Exception("Access token is not available.");
        }

        var handler = new JwtSecurityToken(accessToken);
        var emailClaim = handler.Claims.FirstOrDefault(claim => claim.Type == "email");

        if (emailClaim == null)
        {
            throw new Exception("Email claim not found in the access token.");
        }

        return emailClaim.Value;
    }
    
    public async Task<string> GetMunicipalityIdFromTokenAsync()
    {
        var accessToken = await _httpContextAccessor.HttpContext.GetTokenAsync("access_token");
        
        if (string.IsNullOrEmpty(accessToken))
        {
            throw new Exception("Access token is not available.");
        }

        var handler = new JwtSecurityToken(accessToken);
        var municipalityIdClaim = handler.Claims.FirstOrDefault(claim => claim.Type == "sub");

        if (municipalityIdClaim == null)
        {
            throw new Exception("Email claim not found in the access token.");
        }

        return municipalityIdClaim.Value;
    }
}
