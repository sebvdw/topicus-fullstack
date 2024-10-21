using api.Models;
using api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DbContext = api.Models.DbContext;


namespace api.Controllers;

// SEMS CONTROLLER

[Route("api/theme")]
[ApiController]
[Authorize]
public class ThemeController : Controller
{
    private readonly DbContext _context;
    private readonly TokenService _tokenService;
    private readonly FileService _fileService;
    private readonly ILogger<TranslationController> _logger; 
    public ThemeController(DbContext context, TokenService tokenService, FileService fileService, ILogger<TranslationController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _fileService = fileService;
        _logger = logger;
    }

    [HttpGet, Authorize]
    public async Task<ActionResult<IEnumerable<Theme>>> GetThemesListByGemeenteId()
    {
        var muniId = _tokenService.GetMunicipalityIdFromTokenAsync().Result;
        var themes = _context.Theme
            .Where(t => t.MunicipalityId.ToString() == muniId && t.isPDF == 0);
        if (themes == null)
        {
            return NotFound();
        }
    
        return Ok(themes); 
    }
    
[HttpPut]
public async Task<ActionResult<Theme>> EditTheme([FromBody] ThemeInput input)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var userId = _tokenService.GetMunicipalityIdFromTokenAsync().Result;
    var theme = await _context.Theme.FirstOrDefaultAsync(t => t.MunicipalityId.ToString() == userId  && t.isPDF == 0);
    if (theme == null)
    {
        return NotFound();
    }

    // Fetch font by name
    var font = await _context.Font.FirstOrDefaultAsync(f => f.Name == input.FontName);
    if (font == null)
    {
        return BadRequest("Invalid Font Name");
    }

    // Update theme properties
    theme.Font = font;
    theme.FontId = font.Id;
    theme.PrimaryColor = input.PrimaryColor;
    theme.SecondaryColor = input.SecondaryColor;

    await _context.SaveChangesAsync();
    return Ok(theme);
}


    [HttpPost]
    public async Task<ActionResult<IEnumerable<Theme>>> AddNewTheme(Theme input)
    {
        _context.Add(input);
        await _context.SaveChangesAsync();

        return Ok(input);
    }

    [HttpGet]
    [Route("pdf")]
    public async Task<ActionResult<IEnumerable<Theme>>> GetPdfTheme()
    {
        var gemeenteid = _tokenService.GetMunicipalityIdFromTokenAsync().Result;
        var themes = _context.Theme
            .Where(t => t.MunicipalityId.ToString() == gemeenteid && t.isPDF == 1);

        if (themes == null)
        {
            return BadRequest(ModelState);
        }

        return Ok(themes);
    }


    [HttpPut]
    [Route("pdf")]
    public async Task<ActionResult<IEnumerable<Theme>>> EditPdfTheme(ThemeInput input)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = _tokenService.GetMunicipalityIdFromTokenAsync().Result;
        var theme = await _context.Theme.FirstOrDefaultAsync(t =>
            t.MunicipalityId.ToString() == userId && t.isPDF == 1);
        if (theme == null)
        {
            return NotFound();
        }

        // Fetch font by name
        var font = await _context.Font.FirstOrDefaultAsync(f => f.Name == input.FontName);
        if (font == null)
        {
            return BadRequest("Invalid Font Name");
        }

        // Update theme properties
        theme.Font = font;
        theme.FontId = font.Id;
        theme.PrimaryColor = input.PrimaryColor;
        theme.SecondaryColor = input.SecondaryColor;

        await _context.SaveChangesAsync();
        return Ok(theme);

    }
    [HttpGet("css")]
    public async Task<IActionResult> GetCssTheme(string file)
    {
        var files = await _fileService.GetFileAsync(file, "CSS");
        return Ok(files);
    }
    
    
    
    [HttpPost("css")]
    public async Task<IActionResult> AddCssTheme(IFormFile file)
    {
        
        _logger.LogInformation($"File received: {file.FileName}, Length: {file.Length}, ContentType: {file.ContentType}");
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }
        // TODO: PLEASE ADD A CSS TAG HERE
        var response = await _fileService.PutFileAsync(file, "CSS");

        if (!response.Error)
        {
            return Ok(response); // Successful upload
        }
        else
        {
            return StatusCode(500, response); // Server error during upload
        }
    }


}
