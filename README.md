<h1>YouPlay: Advanced Web Development Project</h1>
<h3>Enjoy a YouTube powered app focused on playlist creation!</h3>
</br>
The purpose of this app is to give YouTube Music Enjoyers a means to listen to their favorite tracks and make custom playlists seperate from YouTube's UI itself, and without being connected directly to YouTube. This has 
many benefits, including:
<li>&nbsp;&nbsp;Your playlists aren't seen by YouTube</li>
<li>&nbsp;&nbsp;Less restriction what's considered a song</li>
<li>&nbsp;&nbsp;No loading of the YouTube UI (faster load times for music!)</li>
<li>&nbsp;&nbsp;General snappier feel</li>
</br>
<b>NOTE:</b> This project requires you to have your own API key, and to build the database! 
For the API key, follow this guide, and put the key in Controllers/YouTubeAPIService where there are comments dictating so: https://developers.google.com/youtube/v3/getting-started
To create the database, create a Data folder and enter the following commands into the command line terminal in the root of the project:
<li>&nbsp;&nbsp;dotnet ef migrations add (migration name)</li>
<li>&nbsp;&nbsp;dotnet ef database update</li>
</br>
<h3>Accessibility</h3>
This app adhears to many visual and text based accessibility protocols, including:
<li>&nbsp;&nbsp;Readable text, and text in certain objects grow when interacted with</li>
<li>&nbsp;&nbsp;Text that does not interfere with screen readers</li>
<li>&nbsp;&nbsp;Search functionality done with keyboard</li>
<li>&nbsp;&nbsp;Easy-to-understand functionality for creating and updating playlists</li>
<li>&nbsp;&nbsp;Predictable design</li>
<li>&nbsp;&nbsp;No major flashes or changes that would impede on readability</li>
</br>
<h3>AI Disclosure</h3>
Parts of this project were assisted with Anthropic's Claude AI model. They maintain to just the Queue Manager class, and breaking down Bootstrap elements and structure. 
</br>
</br>
Claude was used to help with the Queue Manager simply due to it's monotony and ease of creation; generative AI is not the best to use in larger chunks, so I utilized it to help create the Queue Manager class since I knew it would be many small functions within a class. Claude was also used to help structure the elements with Bootstrap along with some of it's principals and classes, since I knew exactly what I wanted, and some of what I would need, just not the specifications and what to do to achieve that goal. I still utilized my knowledge to create the pages and make it what it is, but did need help to find what classes would be necessary, and where the best places would be to put them. Otherwise, other than basic help with errors, that is all Claude was used within this project. I am generally against the use of generative AI, but I do believe it has uses in situations like this, where someone has enough knowledge on something to know what they want and some of how to do it, and just need a bit more clarification.
</br>
</br>
Utilizing Claude taught me that generative AI does have it's uses, especially if you know how to prompt correctly. It is sort of easy for the models to just want to give you the answers, but if you dedicate the time to have the model to break down concepts instead, it can be extremely informative. I now know how to create elements to hover over to interact with, and how to structure card elements (like playlist and song cards) within a page to help them appear natural. Many of these are related to skills I already learned within my Advanced Web Development course, and just needed a bit of extra aid to make sure I was handling structure correctly. This is *exactly* how generative AI should be used, as it's extremely hard for generative AI to teach you brand new skills, or create entire parts without serious logical issues. Overall, I learned a bit more Bootstrap elements and principals, how to efficetvly create prompts, and structure in larger projects.
