#### A guide explaining and showing you how to work with listeners/events and adding new ones
Check [here](https://discord.js.org/#/docs/main/13.1.0/class/Client) for a full list of all the available events your bot/client can listen to!

Before we start, in order to receive some events, you need the required [intents](https://discord.js.org/#/docs/main/13.1.0/class/Intents)

Take a look at our `src/listeners` folder
```
src
├── listeners
│   ├── client
│   │   └── ready.js                  // Emitted when the client is ready to receive interactions/Discord events
│   ├── guild
│   │   ├── guildCreate.js            // Emitted when the client joins a new server
│   │   └── guildDelete.js            // Emitted when the client is removed from a server
│   └── interaction
│       └── interactionCreate.js
...
```

Now the structure ***really*** doesn't matter, the only reason it's structured like this is my personal preference. Feel free to remove sub-folders like `client/`, `guild/` and `interaction/` or even move your `.js` files to **deeeeep** nested folders, it really doesn't matter and it's going to work fine.

Any `.js` file found in `src/listeners/` that doesn't start with a `.` (You can exclude files by adding a "." to the start of the file name, just like `src/commands/.fullCommandTemplate` & `src/commands/.minimalCommandTemplate`) will automatically be converted to a listener. It will listen to your file name ***without extension***. So `src/listeners/interaction/interactionCreate.js` will become a listener for the `interactionCreate` event.

The client object will **always** be received ***before*** any other event specific properties, an example using `src/listeners/client/guildCreate.js`: `module.exports = async (client, guild) => {}`
Client is received first, after which we receive the guild object

## Adding a new listener
- Create your new file anywhere in `src/listeners`
- The file name **HAS TO BE** the name of the event you want to listen to + .js
  - If you want to listen to roleCreate simply add a file named `roleCreate.js`
- Initialize the file:
```javascript
module.exports = async (client, ...received) => {
  // Code
}
```
- That's all, your new event is now properly set-up!

[Continue to **4) Permissions**](./4Permissions.md)

