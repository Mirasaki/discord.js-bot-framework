#### A guide explaining and showing you how to work with command in this framework and how to quickly/easily add new ones
> Making changes to ***global*** test commands can take up to 1 hour to process, this is because of Discord's API, not because of this framework. Please be patient when editing global commands and use test-server command or even server-specific commands if possible when actively working on a command!

## Quick notes on the Command class
- The command category will always be the parent directory's name

## Adding a new command to the registery
- Copy either the [full command template](/src/commands/.fullCommandTemplate.js) or [minimal template](/src/commands/.minimalCommandTemplate.js)
- Create a new file ***anywhere*** in the `src/commands` directory
  - The structure really doesn't matter, place it directly in the commands folder, any of it's sub-folders or even deep nested folders!
- Paste the content and check/configure all the command options
- Add your own custom code
- Restart/reboot the bot and your command will be ready!
  - Keep in mind, when using the minimal template, your command will be loaded/registered as a global Slash Command.

## The command configuration explained
```javascript
const Command = require('../../classes/Command');
module.exports = new Command(() => {
  // The main function, executes when the command is called
}, {
  // Command configuration

  // Permissions
  permLevel: null,              /* Required String | Sets the required permission level for this command, we will talk more about permission levels in a later part of this guide */
  clientPermissions: [],        /* Optional | Default = [] | Additional Discord permissions our client needs to execute a command, useful for moderation commands */
  userPermissions: [],          /* Optional | Default = [] | Additional Discord permissions the member needs to use a command*/

  // Status
  enabled: true,                /* Optional | Default = true | Determines whether or not the command is enabled globally */
  required: true,               /* Optional | Default = true | Determines whether or not the server admins can disable the command */
  nsfw: false,                  /* Optional | Default = false | Whether or not the command can only be used in channels marked as NSFW */

  // Command Cooldown
  cooldown: {
    usages: 1,                  /* Optional | Default = false | Throttle a command, this example allows 1 usage in 5 seconds */ 
    duration: 5                 /* Use { usages: 5, duration: 600 } to allow someone to use this command 5 times every 10 minutes */
  },

  // Command State
  globalCommand: false,         /* Optional | Default = false | Whether or not this Slash Command is enabled globally */
  testCommand: true,            /* Optional | Default = true | Whether or not this Slash Command is also registered as a server-specific slash command on your test server (Defined in config/config.json) */
  serverIds: [],

  // Slash Command data - https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandData
  data: {
    name: null,                 /* Optional | Default = filename without extension | The name this command is called by */
    description: null,          /* Required | The provided description for this command */
    category: null,             /* Optional | Default = Parent directory folder name | The category the command falls under */
    options: [],                /* Optional | Default = [] | Slash Command data to send when registering/reload this command */
    defaultPermission: true,    /* Optional | Default = [] | Whether or not this Slash Command should be registered to specific servers, allowing only them access if globalCommand = false */
  },

})
```

## Adding the "/botinvite" command to this framework, a step-by-step guide
1) Copy the contents of [the minimal command template](/src/commands/.minimalCommandTemplate.js)
2) Create a new file **anywhere** in `src/commands` - I created the `botinvite.js` file in `src/commands/system`
3) Paste your clipboard (`CTRL + V` on most keyboards) into the new file
4) Provide a valid `description` and `permissionLevel` in your config exports
5) Provide the code that will execute when the command is called:
```javascript
// Some destructuring and require the Command Class
const Command = require('../../classes/Command');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const { getBotInvite } = require('../../utils/tools');

module.exports = new Command(({ client, interaction, emojis }) => {
const botInviteLink = getBotInvite(client);
// Replying to the received interaction
  interaction.reply({
    // Assigning a new MessageEmbed to interaction.embeds
    embeds: [
      new MessageEmbed()
        // Set the color to our main bot color declared in /config/colors.json
        .setColor(client.json.colors.main)
        .setDescription(
          // stripIndents removes all indentation left-over from code editors
          // If we didn't format the string with stripIndents,
          // This message would look really weird (second line would be indented)
          // on Discord Mobile
          stripIndents`${emojis.response.success} ${interaction.member}, here you go: [Click to invite](${botInviteLink} "Invite Me!")`
          // You can see we create a hyperlink - The format for that is:
          // [Text to display](https://link.com "Text to display on Mouseover")
        )
    ]
  });
}, {
  // The required permission level to execute this command
  permLevel: 'User',
  data: {
    // The command description
    description: 'Get the link to add this bot to other servers.'
  }
});
```
Now we send an embed in this command, so you should add `EMBED_LINKS` to the commands clientPermissions in your command configuration

## That's all!
Reboot/restart your bot and call the command by typing "/"! If you add new commands in your production environment (which I advice against) you could add a "/register" command, this might be a good first command to add! The thought behind this command would be having `/src/commands` as a base directory and having someone input the rest of the path to the new file/command. Take a look at `/src/commands/system/reload.js` to see how the rest of this framework loads commands.

[Continue to **3) Listening to Events**](./3ListeningToEvents.md)
