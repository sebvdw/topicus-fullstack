using api.Models.Entities;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using MimeKit.Text;
using DbContext = api.Models.DbContext;

namespace api.Controllers;

[Route("api/password-reset")]
[ApiController]
public class PasswordResetController : ControllerBase
{
    private readonly DbContext _context;
    private readonly ILogger _logger;

    public PasswordResetController(DbContext context, ILogger<AssetController> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    // A call to send the email with password reset link
    [Route("send-email")]
    [HttpPost]
    public async Task<ActionResult<IEnumerable<User>>> SendResetEmail(string address)
    {
        var user = await _context.User.FirstOrDefaultAsync(x => x.Email == address);

        if (user != null)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse("group4resetmail@gmail.com"));
            email.To.Add(MailboxAddress.Parse(user.Email));

            string website = Request.Headers.Origin.ToString();
            string resetLink = $"{website}/password-reset?user={user.Email}";

            var message = $@"
                You have requested to reset the password for your account.<br>
                You can do so by clicking <a href='{resetLink}'>this link</a>.<br><br>
                <strong>If this is not you requesting the password change, please contact the administrator about this.</strong>";

            email.Subject = "Password Reset Request";
            email.Body = new TextPart(TextFormat.Html) { Text = message };

            using var smtp = new SmtpClient();
            smtp.Connect("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            smtp.Authenticate("group4resetmail@gmail.com", "fayyqudfvkqidhvy");
            smtp.Send(email);
            smtp.Disconnect(true);
        }

        return Ok("Password reset email will be sent, if an account with such email exists");
    }

    
    // A call to reset the password
    [Route("set-new-password")]
    [HttpPut]
    public async Task<IActionResult> ResetUserPassword(String email, String password)
    {
        var user = await _context.User.FirstOrDefaultAsync(x => x.Email == email);
        
        if (user != null)
        {
            user.HashPassword = password; //Just pretend that the password is hashed here :)
            await _context.SaveChangesAsync();
        }
        
        return Ok("Password was reset successfully");
    }
    
    
}