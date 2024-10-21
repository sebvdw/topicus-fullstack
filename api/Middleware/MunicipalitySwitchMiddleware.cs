using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using DbContext = api.Models.DbContext;

namespace api.Middleware;

public class MunicipalitySwitchMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger _logger;
    private readonly FileService _fileService;
    public MunicipalitySwitchMiddleware(RequestDelegate next, ILogger<MunicipalitySwitchMiddleware> logger, FileService fileService)
    {
        _logger = logger;
        _next = next;
        _fileService = fileService;
    }
    public async Task InvokeAsync(HttpContext context, DbContext dbContext)
    {

        var municipality =  await GetMunicipalityIdFromTokenAsync(context);
        if(!municipality.IsNullOrEmpty()) _fileService.ChangeContainer(municipality);
        await _next(context);

    }
    
    public async Task<string> GetMunicipalityIdFromTokenAsync(HttpContext context)
    {
        var accessToken = await context.GetTokenAsync("access_token");
        
        if (!string.IsNullOrEmpty(accessToken))
        {
            var handler = new JwtSecurityToken(accessToken);
            var municipalityClaim = handler.Claims.FirstOrDefault(claim => claim.Type == "given_name");
            
        
            if (municipalityClaim == null)
            {
                throw new Exception("Email claim not found in the access token.");
            }

            return municipalityClaim.Value;
        }
        return null;
    }
}

public static class MunicipalitySwitchMiddlewareExtensions
{
    public static IApplicationBuilder UseMunicipalitySwitchMiddleware(
        this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<MunicipalitySwitchMiddleware>();
    }
}