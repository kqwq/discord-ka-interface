// Discord bot starter code

const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const commands = require('./commands.json');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
}
);

client.on('message', message => {
  if (message.author.bot) return;
  if (message.content.startsWith(config.prefix)) {
    const command = message.content.split(' ')[0].replace(config.prefix, '');
    const args = message.content.split(' ').slice(1);
    if (commands[command]) {
      commands[command](client, message, args);
    } else {
      message.channel.send(`Command ${command} not found.`);
    }
  }
}
);

client.login(config.token);