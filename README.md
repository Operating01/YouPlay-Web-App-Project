<h1>YouPlay: Advanced Web Development Project</h1>
<h3>Enjoy a YouTube powered app focused on playlist creation!</h3>
</br>
The purpose of this app is to give YouTube Music Enjoyers a means to listen to their favorite tracks and make custom playlists seperate from YouTube's UI itself, and without being connected directly to YouTube. This has 
many benefits, including:
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>Your playlists aren't seen by YouTube</li>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>Less restriction what's considered a song</li>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>No loading of the YouTube UI (faster load times for music!)</li>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>General snappier feel</li>
<\br>
<b>NOTE:</b> This project requires you to have your own API key, and to build the database! 
For the API key, follow this guide, and put the key in Controllers/YouTubeAPIService where there are comments dictating so: https://developers.google.com/youtube/v3/getting-started
To create the database, create a Data folder and enter the following commands into the command line terminal in the root of the project:
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>dotnet ef migrations add (migration name)</li>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>dotnet ef database update</li>
</br>
<h3>Accessibility</h3>
This app adhears to many visual and text based accessibility protocols, including:
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>Readable text, and text in certain objects grow when interacted with</li>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>Text that does not interfere with screen readers</li>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>Search functionality done with keyboard</li>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>Easy-to-understand functionality for creating and updating playlists</li>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>Predictable design</li>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<li>No major flashes or changes that would impede on readability</li>

