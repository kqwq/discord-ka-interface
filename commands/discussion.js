const { voteByEntityKey } = require("../util/votebatch");

module.exports = {
  name: "discussion",
  aliases: ["discuss"],
  cooldown: 90 * 30, // 90 minutes
  description: "Votes up a discussion post on Khan Academy. The kaencrypted key is a 365-character long string that begins with the sequence `kaencrypted_`.",
  usage: "[kaencrypted] {amount=100}",
  log: true,
  args: true,
  execute(msg, [kaencrypted, newVotes=100, voteDirection=1]) {
    if (isNaN(newVotes)) return msg.reply("Please enter a valid number.");
    newVotes = parseInt(newVotes);
    if (newVotes > 500) {
      msg.reply("Limit is 500 votes.");
      newVotes = 500
    }
    msg.channel.send(`${msg.author.username} is voting this discussion key: ${kaencrypted}`);

    voteByEntityKey(msg, kaencrypted, newVotes, voteDirection)
  },
};
