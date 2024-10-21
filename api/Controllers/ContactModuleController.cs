using api.Models.Entities;
using Azure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace api.Controllers;
[Route("api/contactmodule")]
[ApiController]
public class ContactModuleController : Controller
{
    private readonly ILogger _logger;

    public ContactModuleController(ILogger<AssetController> logger)
    {
        _logger = logger;
    }
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(new Translation());
    }
    
    [HttpPost]
    public async Task<IActionResult> Post(Translation input)
    {
        return Ok(new Translation());
    }
    
    [HttpPut]
    public async Task<IActionResult> Put(Translation input)
    {
        return Ok(new Translation());
    }
}