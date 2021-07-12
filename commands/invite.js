module.exports = {
  name: "invite",
  cooldown: 5,
  description: "Invite Khan Academy Hex to your server!",
  args: false,
  log: true,
  execute(msg) {
    bot_id = msg.client.user.id;
    msg.channel.send(`https://discordapp.com/oauth2/authorize?client_id=${bot_id}&scope=bot&permissions=59392`)
  }
};
