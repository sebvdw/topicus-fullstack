using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using api.Models.Entities;
using api.Models.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using DbContext = api.Models.DbContext;
namespace api.Controllers;

// SEMS CONTROLLER

[Route("api/auth")]
[ApiController]
public class AuthController : Controller
{

    private readonly IConfiguration _configuration;
    private readonly DbContext _context;
    private readonly ILogger _logger;



    public AuthController(IConfiguration configuration, DbContext context, ILogger<AuthController> logger)
    {
        _configuration = configuration;
        _context = context;
        _logger = logger;
    }
    [AllowAnonymous]
    [HttpPost]
    [Route("login")]
    public async Task<ActionResult<AuthenticatedResponse>> login(User input)
    {

        var userFound = _context.User.SingleOrDefault(u => u.Email == input.Email);

        if (userFound == null)
        {
            return NotFound();
        }

        if (userFound.HashPassword != input.HashPassword)
        {
            return Unauthorized("Password incorrect");
        }

        var municipality = _context.Municipality.SingleOrDefault(m => m.Id == userFound.MunicipalityId).Name;
        var tokenString = GenerateJSONWebToken(userFound, municipality);

        return Ok(new AuthenticatedResponse { Token = tokenString });
    }


    private string GenerateJSONWebToken(User userInfo, string municipalityName)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[] {
            new Claim(JwtRegisteredClaimNames.Sub, userInfo.MunicipalityId.ToString()), // Municipality ID
            new Claim(JwtRegisteredClaimNames.GivenName, municipalityName),
            new Claim(JwtRegisteredClaimNames.Email, userInfo.Email), // User Email
            new Claim(JwtRegisteredClaimNames.NameId, userInfo.Id.ToString()), // User Id
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique identifier for the token
        };

        var token = new JwtSecurityToken(_configuration["Jwt:Issuer"],
            _configuration["Jwt:Issuer"],
            claims,
            expires: DateTime.Now.AddMinutes(120),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}