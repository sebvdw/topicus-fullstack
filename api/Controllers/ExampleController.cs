using System.Data.SqlClient;
using System.IdentityModel.Tokens.Jwt;
using api.Models.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DbContext = api.Models.DbContext;

namespace api.Controllers;

[Route("api/example")]
[ApiController]
[Authorize]
public class ExampleController : Controller
{ 
    private readonly IConfiguration _configuration;
    private readonly DbContext _context;
    private readonly ILogger _logger;
    private readonly TokenService _tokenService;
    private readonly FileService _fileService;
    public ExampleController(IConfiguration configuration, DbContext context, ILogger<ExampleController> logger, TokenService tokenService, FileService fileService)
    {
        _configuration = configuration;
        _context = context;
        _logger = logger;
        _tokenService = tokenService;
        _fileService = fileService;
    } 
    // GET api/values
    [HttpGet]
    public Test GetTestExample()
    {
        // example of loggin email from token service
        _logger.LogInformation(_tokenService.GetEmailFromAccessTokenAsync().Result);
        _logger.LogInformation(_tokenService.GetMunicipalityIdFromTokenAsync().Result);
        return new Test()
        {
            Message = "Test Succeeded!"
        };
    }
    
    [HttpGet]
    [Route("translation")]
    public async Task<ActionResult<IEnumerable<Translation>>> GetTranslationList()
    {
        if (_context.Translation == null)
        {
            return NotFound();
        }

        return await _context.Translation.ToListAsync();
    }
    
    [HttpGet]
    [Route("user")]
    public async Task<ActionResult<IEnumerable<User>>> GetUserList()
    {
        if (_context.User == null)
        {
            return NotFound();
        }

        return await _context.User.ToListAsync();
    }
    [HttpPost]
    [Route("user")]
    public async Task<ActionResult<User>> AddUser(User input)
    {
        // Validate the input (optional but recommended)
        if (input == null)
        {
            return BadRequest("Body cannot be empty.");
        }
        
        _context.User.Add(input);
        
        // Save changes asynchronously
        await _context.SaveChangesAsync();
        
        // Return the created users
        return CreatedAtAction(nameof(AddUser), new { id = input.Id }, input);
    }

    // Example method to get users by ID
    [HttpGet]
    [Route("user/{id}")]
    public async Task<ActionResult<User>> GetUser(long id)
    {
        var user = await _context.User.FirstOrDefaultAsync(x => x.Id == id);
        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }
    
    // Example method to put users by ID
    [HttpPut]
    [Route("user/{id}")]
    public async Task<ActionResult<User>> UpdateUser(long id, User input)
    {
        var user = await _context.User.FirstOrDefaultAsync(x => x.Id == id);
        if (user == null)
        {
            return NotFound();
        }
        // Update the user
        user.Email = input.Email;
        user.HashPassword = input.HashPassword;
        await _context.SaveChangesAsync();
        return Ok("User updated successfully.");
    }
    
    // Example method to delete users by ID
    [HttpDelete]
    [Route("user/{id}")]
    public async Task<ActionResult<User>> DeleteUser(long id)
    {
        var user = await _context.User.FirstOrDefaultAsync(x => x.Id == id);
        if (user == null)
        {
            return NotFound();
        }
        _context.User.Remove(user);
        await _context.SaveChangesAsync();
        return Ok("User deleted successfully.");
    }
    
    [HttpGet]
    [Route("images")]
    public async Task<IActionResult> GetAssets()
    {
        var files = await _fileService.ListImagesAsync();
        return Ok(files);
    }
}