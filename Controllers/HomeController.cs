using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project.Models;

namespace Project.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;    
    private readonly ISongRepository _repo;
    private readonly IAccountRepository _accrepo;

    public HomeController(ILogger<HomeController> logger, ISongRepository repo, IAccountRepository accrepo)
    {
        _logger = logger; 
        _repo = repo;
        _accrepo = accrepo;
    }

public async Task<IActionResult> Index()
{
    var testSong = await _repo.ReadAsync(1); // ✅ Await the async method

    if (testSong == null)
    {
        return NotFound();
    }

    return View(testSong); // ✅ Now passing a Song, not a Task<Song>
}

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

    public IActionResult GetUserName()
    {
    if (User.Identity!.IsAuthenticated)
        {
        string username = User.Identity.Name ?? "";
        return Content(username);
        }
    return Content("No user");
    }

    public async Task<IActionResult> GetUserId()
    {
        if (User.Identity!.IsAuthenticated)
        {
            string username = User.Identity.Name ?? "";
            var user = await _accrepo.ReadByUsernameAsync(username);
            if (user != null)
            {
                return Content(user.Id);
            }
            }
        return Content("No user");
        }

        [Authorize]
        public IActionResult Restricted()
        {
            return Content("This is restricted.");
        }
}
