const Discord = require("discord.js");
const client = new Discord.Client();
const { owner, ownerId, prefix, token } = require("./config.json");
const fs = require("fs");

// Create bot data & logs if it doesn't exist
if (fs.existsSync('./bot_data.json') === false) {
  let bot_data = {
    "votes": 1,
  }
  fs.writeFileSync('./bot_data.json', JSON.stringify(bot_data));
}
if (fs.existsSync('./bot_logs.json') === false) {
  let bot_logs = {
    "logs": [],
  }
  fs.writeFileSync('./bot_logs.json', JSON.stringify(bot_logs));
}

// Command/cooldown setup
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}
const cooldowns = new Discord.Collection();

// On ready
client.on("ready", () => {
  console.log(`Logged in as ${client.user.username}!`);

  // Set status
  client.user.setActivity(`${prefix}help - I also work in DMs`, { type: 'LISTENING' });
});

// On message
client.on("message", (message) => {
  if (message.author.bot) return;
  // Command / args handling
  if (!message.content.toLowerCase().startsWith(prefix)) return;
  if (message.channel.type !== "text" && message.channel.type !== "dm") return;// Does not apply to special channel types like voice or news
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );
  if (!command) return;
  if (command.ownerOnly && message.author.id.toString() !== ownerId.toString()) {
    return message.reply("this command is not public");
  }
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    return message.channel.send(reply);
  }

  // Cooldown
  if (message.author.id.toString() !== owner.toString()) {
    // The owner is not subject to cooldowns
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id) && message.author.id != ownerId) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(
          `please wait ${timeLeft.toFixed(
            1
          )} more second(s) before reusing the \`${command.name}\` command.`
        );
      }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  // Execute command
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command.");
  }

  // Log command
  if (command.log && message.author.id != ownerId) {
    let log = {
      "author": message.author.id + " " + message.author.tag,
      "timestamp": Date.now(),
      "message": message.content,
    };
    let bot_logs = JSON.parse(fs.readFileSync('./bot_logs.json'));
    bot_logs.logs.push(log);
    fs.writeFileSync('./bot_logs.json', JSON.stringify(bot_logs, null, 2));
  }

});

client.login(token);
