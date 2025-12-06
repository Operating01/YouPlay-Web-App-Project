using Microsoft.AspNetCore.Mvc;
using Project.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Project.Models.Entities;
[Route("api/account")]
[ApiController]
public class AccountController : Controller
{
    [HttpGet("check-auth")]
    public IActionResult CheckAuth()
    {
        return Json(new { isAuthenticated = User.Identity?.IsAuthenticated ?? false });
    }
}