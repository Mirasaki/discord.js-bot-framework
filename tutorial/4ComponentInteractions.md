#### A guide explaining and showing you how to work with Discord components in this framework
---

> ***Before you follow this example***, please be aware that all of this is built-in and ready to go if you copy the [Full Command Template](https://github.com/Destinovant/discord.js-bot-framework/tree/main/src/commands/.fullCommandTemplate.js) when creating a new command

In your command file (we're going to be using `src/commands/system/disable.js` as an example) **reply to the interaction** with your custom components, like so:
```javascript
const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageButton } = require('discord.js')

exports.run = ({...}) => {
    interaction.reply({
        content: 'Yep!',
        components: [
            new MessageActionRow().addComponents(
                new MessageSelectMenu({
                    customId: 'disable_01',
                    placeholder: 'Select the commands to disable',
                    minValues: 1,
                    options
                })
            ),
            new MessageActionRow().addComponents(
                new MessageButton({
                    label: 'Stop',
                    customId: 'disable_02',
                    style: 'DANGER',
                    emoji: '🚫'
                })
            )
        ]
    })
}
```
Setup the listener from the same file, like so:
```javascript
exports.slash = {
    description: 'Disable commands for your server.',
    enabled: true,
    globalCommand: false,
    testCommand: true,
    serverIds: ['Another test server ID'],
    options: [],
    listeners: [
        {
            customId: 'disable_01',
            onClick: async function (...) {
                // Execute code
            }
        },
        // Initialize another component listener
        {
            customId: 'disable_02',
            onClick: async function (...) {
                // More code
            }
        }
    ]
}
```

[Continue to **5) Permissions**](./5Permissions.md)
