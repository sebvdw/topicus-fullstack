using api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DbContext = api.Models.DbContext;

namespace api.Controllers;

[Route("api/translation")]
[ApiController]
[Authorize]
public class TranslationController : ControllerBase
{
    private readonly DbContext _context;
    private readonly ILogger _logger;
    private readonly TokenService _tokenService;
    private readonly FileService _fileService;

    public TranslationController(DbContext context, ILogger<TranslationController> logger, TokenService tokenService, FileService fileService)
    {
        _context = context;
        _logger = logger;
        _tokenService = tokenService;
        _fileService = fileService;
    }   
    [HttpGet]
    public async Task<IActionResult> GetJsonTranslation(string file)
    {
        var files = await _fileService.GetFileAsync(file, "JSON");
        return Ok(files);
    }

    [HttpPost]
    public async Task<IActionResult> AddJsonTranslation(IFormFile file)
    {
        var response = await _fileService.PutFileAsync(file, "JSON");
        return Ok(response);
    }
    
}