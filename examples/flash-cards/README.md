# bot-flash-cards-blip-sdk-js

This bot is an example of a Flashcards bot. It randomly selects a person, displays a photo, and asks the user for his or her name. At the end the bot informs how many people the user has hit. 

# Requirements

-   Node.js version 8.9.1 or above (download  [here](https://nodejs.org/en/download/))
-   A **BLiP** account (create [here](https://account.blip.ai/))
-   A JSON file containing the info you want to use into the bot

# Getting Started
### Javascript SDK
If you are a Javascript developer and want to create a chatbot with **BLiP**, you must use the BLiP Javascript SDK. It was developed to help sending and receiving of BLiP messages using Javascript for browsers or [node.js](https://nodejs.org/) through persistent WebSocket connections. 

Go to [Github](https://github.com/takenet/blip-sdk-js) to see the source code and the full documentation.

### Starting a new bot
If you need help on how to create a bot using BLiP JS SDK, please [click here](https://docs.blip.ai/#using-sdk-javascript).

### About this project 

This bot uses a JSON file that contains the flashcards info of people, like photo and name. The data `Uri` is used to show a image to the user, while the `Name` is used to check the answers. 

You can use any information and change the file as you think its necessary. 

That file may looks like: 
```JSON
{
	"peoples": [
		{
			"Name": <name>,
			"Uri": <uri>
		},
		{
			"Name":<name>,
			"Uri": <uri> 
		},
		{
			"Name": <name>,
			"Uri": <uri>
		},
	] 
} 
```

For more information about how to send images sharing a URL using the ***Media Link*** content type, access the [**BLiP Documentation**](https://docs.blip.ai/?javascript#images).