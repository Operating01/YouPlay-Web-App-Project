using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Project.Services;
using Project.Controllers;
using Microsoft.AspNetCore.Identity;
using Project.Models.Entities;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<ISongRepository, DbSongsRepository>();
builder.Services.AddScoped<IPlaylistRepository, DbPlaylistRepository>();
builder.Services.AddScoped<IAccountRepository, DbAccountRepository>();
builder.Services.AddScoped<YouTubeAPIService>();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(
    builder.Configuration.GetConnectionString("DefaultConnection"))
);
builder.Services.AddDefaultIdentity<Account>(options =>
{
options.SignIn.RequireConfirmedAccount = false;

})
.AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
       builder =>
       {
           builder.WithOrigins("")
                .AllowAnyHeader()
                .AllowAnyMethod();
       });
});


builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient();
var app = builder.Build();

/* ============== explanation ================

    Instead of being in the DbContext, the base data is set up in the
    below so the accounts can be made without issue, and the
    playlists can be implemented without error.

   ============== explanation ================
*/
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var userManager = services.GetRequiredService<UserManager<Account>>();
    var context = services.GetRequiredService<ApplicationDbContext>();
    
    await context.Database.MigrateAsync();

    if (!userManager.Users.Any())
    {
       // CREATE ACCOUNT
        var john = new Account
        {
            UserName = "john@example.com",
            Email = "john@example.com",
            EmailConfirmed = true
        };
        
        await userManager.CreateAsync(john, "Password123!");

        // CREATE SONGS
        var song = await context.Songs.FirstOrDefaultAsync(s => s.IdInYouTube == "LBQ2305fLeA");
            if (song == null)
            {
                song = new Song
                {
                    IdInYouTube = "_oanJVP5Tg8",
                    SongTitle = "Jerry Was A Race Car Driver",
                    Artists = "Primus",
                    SongLength = 191,
                    AlbumArt = "https://miro.medium.com/1*hBnX4y5p5zNEg9eJsUsQJg.jpeg",
                    IsYouTube = true
                };
                context.Songs.Add(song);
                await context.SaveChangesAsync();
            }
         var song2 = await context.Songs.FirstOrDefaultAsync(s => s.IdInYouTube == "T0ZmErXkbxE");
            if (song2 == null)
            {
                song2 = new Song
                {
                    IdInYouTube = "T0ZmErXkbxE",
                    SongTitle = "Paradise City",
                    Artists = "Guns & Roses",
                    SongLength = 191,
                    AlbumArt = "https://m.media-amazon.com/images/I/91ksS-ioRpL._UF1000,1000_QL80_.jpg",
                    IsYouTube = true
                };
                context.Songs.Add(song2);
                await context.SaveChangesAsync();
            }
        var song3 = await context.Songs.FirstOrDefaultAsync(s => s.IdInYouTube == "Nco_kh8xJDs");
            if (song3 == null)
            {
                song3 = new Song
                {
                    IdInYouTube = "Nco_kh8xJDs",
                    SongTitle = "Would?",
                    Artists = "Alice In Chains",
                    SongLength = 191,
                    AlbumArt = "https://m.media-amazon.com/images/I/81g0YcT68pL._UF1000,1000_QL80_.jpg",
                    IsYouTube = true
                };
                context.Songs.Add(song3);
                await context.SaveChangesAsync();
            }
        
        // CREATE PLAYLISTS
        var playlist = new Playlist
        {
            PlaylistTitle = "Primus Tracks",
            AccountId = john.Id, 
            SongCount = 1,
            PlaylistArt = "https://miro.medium.com/1*hBnX4y5p5zNEg9eJsUsQJg.jpeg"
        };
        var playlist2 = new Playlist
        {
            PlaylistTitle = "Burnout Paradise OST",
            AccountId = john.Id, 
            SongCount = 2,
            PlaylistArt = "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84040092c58694c85830446ae0"
        };
        context.Playlists.Add(playlist);
        context.Playlists.Add(playlist2);
        await context.SaveChangesAsync();
        
        // CREATE PLAYLIST SONGS
        var playlistSong = new PlaylistSong
        {
            PlaylistId = playlist.PlaylistId,
            SongId = song.SongId, 
            AddedDate = new DateTime(2024, 1, 15),
            OrderIndex = 0
        };
        var playlistSong2 = new PlaylistSong
        {
            PlaylistId = playlist2.PlaylistId,
            SongId = song2.SongId, 
            AddedDate = new DateTime(2024, 1, 15),
            OrderIndex = 0
        };
        var playlistSong3 = new PlaylistSong
        {
            PlaylistId = playlist2.PlaylistId,
            SongId = song3.SongId,
            AddedDate = new DateTime(2024, 1, 15),
            OrderIndex = 0
        };
        
        context.PlaylistSongs.Add(playlistSong);
        context.PlaylistSongs.Add(playlistSong2);
        context.PlaylistSongs.Add(playlistSong3);
        await context.SaveChangesAsync();
    }
}
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.MapControllers();
app.MapRazorPages();
app.Run();
