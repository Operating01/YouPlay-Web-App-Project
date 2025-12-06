using Project.Models.Entities;
using Microsoft.EntityFrameworkCore;
namespace Project.Services;

public class DbAccountRepository : IAccountRepository
{
    private readonly ApplicationDbContext _db;
    public DbAccountRepository(ApplicationDbContext db)
    {
        _db = db;
    }
    public async Task<Account?> ReadByUsernameAsync(string username)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.UserName ==
        username);
    }
}