const { MessageEmbed } = require('discord.js');
const Command = require('../../classes/Command');
const { topLevelCommandFolder } = require('../../handlers/commands');
const { readdirSync, statSync } = require('fs');
const nodePath = require('path');
const { permConfig } = require('../../handlers/permissions');

// const path = topLevelCommandFolder;
const getCategories = (path) => {
  const final = [];
  for (let itemInDir of readdirSync(path)) {
    itemInDir = nodePath.resolve(path, itemInDir);
    const stat = statSync(itemInDir);
    if (stat.isDirectory()) {
      const cat = itemInDir.split(nodePath.sep).pop();
      final.push({
        name: cat,
        value:  cat
      });
      getCategories(itemInDir);
    } else continue;
  }
  return final;
};

const getPermissionLevelOptions = () => {
  return permConfig.map((level) => {
    return {
      name: level.name,
      value: level.name
    };
  });
};

module.exports = new Command(({ client, interaction, guildSettings, args, emojis }) => {
  console.log(args[0].options[0]);
  let filter = args[0].options[0].options[0];
  console.log(filter);
  let value;
  if (filter) {
    filter = filter.name;
    value = filter.value;

  } else {
    filter = args[0].options[0].value;
  }
  console.log(filter);
  console.log(value);
  console.log('\n\n\n');
}, {
  permLevel: 'Developer',
  data: {
    description: 'Get an overview of all the commands for quick reference.',
    options: [
      {
        name: 'action',
        description: 'The action to perform',
        type: 2,
        required: true,
        options: [
          {
            name: 'filter',
            description: 'The keyword to filter the commands by',
            type: 1,
            required: true,
            options: [
              {
                name: 'category',
                description: 'Filter by command category',
                type: 3,
                choices: getCategories(topLevelCommandFolder)
              }, {
                name: 'enabled',
                description: 'Filter by enabled status',
                type: 'BOOLEAN',
              }, {
                name: 'required',
                description: 'Filter by required status',
                type: 'BOOLEAN',
              }, {
                name: 'server',
                description: 'Filter by server Id',
                type: 'STRING'
              }, {
                name: 'level',
                description: 'Filter by required permission level',
                type: 'STRING',
                choices: getPermissionLevelOptions()
              }
            ]
          }, {
            name: 'global',
            description: 'Get all global commands',
            type: 1
          }, {
            name: 'test',
            description: 'Get all test commands',
            type: 1
          }, {
            name: 'listeners',
            description: 'Get all commands with active component listeners',
            type: 1
          }
        ]
      } 
    ]
  }
});
