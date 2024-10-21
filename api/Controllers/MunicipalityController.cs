using System.Data.SqlClient;
using api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DbContext = api.Models.DbContext;

namespace api.Controllers;

[Route("api/municipality")]
[ApiController]
[Authorize]
public class MunicipalityController : Controller
{ 
    private readonly IConfiguration _configuration;
    private readonly DbContext _context;
    private readonly ILogger _logger;
    public MunicipalityController(IConfiguration configuration, DbContext context, ILogger<MunicipalityController> logger)
    {
        _configuration = configuration;
        _context = context;
        _logger = logger;
    }   
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Municipality>>> GetMunicipalityList()
    {
        if (_context.Municipality == null)
        {
            return NotFound();
        }

        return await _context.Municipality.ToListAsync();
    }
}