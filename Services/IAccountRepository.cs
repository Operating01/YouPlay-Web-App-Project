using Project.Models.Entities;

public interface IAccountRepository
{
Task<Account?> ReadByUsernameAsync(string username);
}