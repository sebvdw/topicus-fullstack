using api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DbContext = api.Models.DbContext;

namespace api.Controllers;

// SEBASTIANS CONTROLLER
[Route("api/asset")]
[ApiController]
[Authorize]
public class AssetController : ControllerBase
{
    private readonly FileService _fileService;
    private readonly DbContext _context;
    private readonly TokenService _tokenService;
    private readonly ILogger _logger;

    public AssetController(FileService fileService, ILogger<AssetController> logger, TokenService tokenService, DbContext context)
    {
        _fileService = fileService;
        _logger = logger;
        _tokenService = tokenService;
        _context = context;
    }
    [HttpGet]
    [Route("{fileName}")]
    public async Task<IActionResult> GetAsset(string fileName)
    {
        var file = await _fileService.GetImageAsync(fileName);
        if (file == null)
        {
            return NotFound();
        }

        return Ok(file);
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAssets(bool ignoreTags = false)
    {
        if (ignoreTags)
        { 
           var allFiles = await _fileService.ListFilesAsync();
           return Ok(allFiles);
        }
        var files = await _fileService.ListImagesAsync();
        return Ok(files);
    }
    
    [HttpPost]
    public async Task<IActionResult> AddAsset(IFormFile file)
    {
        var response = await _fileService.PutFileAsync(file, "Image");
        return Ok(response);
    }
    
    [HttpDelete]
    [Route("{fileName}")]
    public async Task<IActionResult> DeleteAsset(string fileName)
    {
        var response = await _fileService.DeleteAsync(fileName);
        return Ok(response);
    }
    
}