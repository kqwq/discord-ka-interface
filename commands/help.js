const { prefix } = require('../config.json');
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['command', 'cmd', 'cmds'],
  usage: '{command name}',
  cooldown: 5,
  args: false,
  execute(msg, args) {
    const { commands } = msg.client;

    if (!args.length) {
      let helpStr = 'Here\'s a list of my main commands:\n• ';
      helpStr += commands.map(command => `\`${command.name}\` ` + (command.usage ? (command.usage) : "")).join('\n• ');
      let embed = new MessageEmbed({
        title: "Commands",
        description: helpStr,
        color: "#123456",
        footer: {
          text: `Type ${prefix}help {command-name} for help on a specific command`,
        },
      });
      return msg.channel.send(embed);
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      return msg.channel.send('That\'s not a valid command!');
    }

    let embed = new MessageEmbed({
      title: `Command: ${command.name}`,
      color: "#123456"
    });

    if (command.description) embed.setDescription(command.description);
    if (command.aliases) embed.addField(`**Aliases**`, `${command.aliases.join(', ')}`);
    if (command.usage) embed.addField(`**Usage**`, `${prefix}${command.name} ${command.usage}`);
    if (command.cooldown) {
      embed.addField(`**Cooldown**`, `${command.cooldown} second(s)`);
    }

    msg.channel.send(embed);
  },
};