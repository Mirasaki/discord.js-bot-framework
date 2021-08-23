#### A guide explaining and showing you how to work with command in this framework and how to quickly/easily add new ones
> Making changes to ***global*** test commands can take up to 1 hour to process, this is because of Discord's API, not because of this framework. Please be patient when editing global commands and use test-server command or even server-specific commands if possible when actively working on a command!

## Adding a new command to the registery
- Copy either the [full command template](./src/commands/.fullCommandTemplate.js) or [minimal template](/src/commands/.minimalCommandTemplate.js)
- Create a new file ***anywhere*** in the `src/commands` directory
  - The structure really doesn't matter, place it directly in the commands folder, any of it's sub-folders or even deep nested folders!
- Paste the content and check/configure all the command options
- Add your own custom code
- Restart/reboot the bot and your command will be ready!
  - Keep in mind, when using the minimal template, your command will be loaded/registered as a global Slash Command.

[Continue to **3) Listening to Events**](./3ListeningToEvents.md)

## The command configuration explained
```javascript
exports.run = ({...}) => {
  // The primary run function, this is executed whenever the command is called
}
```

```javascript
// Command system configuration
exports.config = {
  enabled: Boolean,        /* Optional | Default = true | Determines whether or not the command is enabled globally */
  required: Boolean,       /* Optional | Default = true | Determines whether or not the server admins can disable the command */
  permLevel: String,       /* Required | Sets the required permission level for this command, we will talk more about permission levels in a later part of this guide */
  clientPermissions: Array,/* Optional | Default = [] | Additional Discord permissions our client needs to execute a command, useful for moderation commands */
  userPermissions: Array,  /* Optional | Default = [] | Additional Discord permissions the member needs to use a command*/
  throttling: {     
    usages: Number,        /* Optional | Default = false | Throttle a command, this example allows 1 usage in 5 seconds */
    duration: Number       /* Use { usages: 5, duration: 600 } to allow someone to use this command 5 times every 10 minutes */
  },
  nsfw: null                /* Optional | Default = false | Whether or not the command can only be used in channels marked as NSFW */
}
```

```javascript
// Slash configuration
exports.slash = {
  name: String,           /* Optional | Default = filename without extension | The name this command is called by */
  category: String,       /* Optional | Default = file parent folder name | The category this command falls under */
  description: String,    /* Required | The provided description for this command */
  enabled: Boolean,       /* Optional | Default = true | Whether or not this Slash Command is currently enabled */
  reload: Boolean,        /* Optional | Default = true | Whether or not this Slash Command should be reloaded/re-registered on the next boot */
  globalCommand: Boolean, /* Optional | Default = true | Whether or not this Slash Command is enabled globally */
  testCommand: Boolean,   /* Optional | Default = false | Whether or not this Slash Command is also registered as a server-specific slash command on your test server (Defined in config/config.json) */
  serverIds: Array,       /* Optional | Default = [] | Whether or not this Slash Command should be registered to specific servers, allowing only them access if globalCommand = false */
  options: Array,         /* Optional | Default = [] | Slash Command data to send when registering/reload this command @ https://discord.js.org/#/docs/main/13.1.0/typedef/ApplicationCommandOptionData*/

  // Optional | Default = [] | Set-up custom component listeners
  listeners: [            /* Custom MessageComponent Listeners */
    { // This is all covered in a later part of this guide
      customId: 'custom_id',  // The customId to listen to
      onClick: async function (client, interaction, guildSettings) { 
        // The function to execute when clicked/receiving an interaction
      }
    }
  ]
}
```
