<h1>YouPlay: Advanced Web Development Project</h1>
<h3>Enjoy a YouTube powered app focused on playlist creation!</h3>

The purpose of this app is to give YouTube Music Enjoyers a means to listen to their favorite tracks and make custom playlists seperate from YouTube's UI itself, and without being connected directly to YouTube. This has 
many benefits, including:
<li>Your playlists aren't seen by YouTube</li>
<li>Less restriction what's considered a song</li>
<li>No loading of the YouTube UI (faster load times for music!)</li>
<li>General snappier feel</li>
<\n>
<b>NOTE:</b> This project requires you to have your own API key, and to build the database! 
For the API key, follow this guide, and put the key in Controllers/YouTubeAPIService where there are comments dictating so: https://developers.google.com/youtube/v3/getting-started
To create the database, create a Data folder and enter the following commands into the command line terminal in the root of the project:
<li>dotnet ef migrations add (migration name)</li>
<li>dotnet ef database update</li>

