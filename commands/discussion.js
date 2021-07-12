const fetch = require("node-fetch");
const logins = require("../logins");
const fs = require("fs");

module.exports = {
  name: "discussion",
  aliases: ["discuss"],
  cooldown: 90 * 30, // 90 minutes
  description: "Votes up a discussion post on Khan Academy. The kaencrypted key is a 365-character long string that begins with the sequence `kaencrypted_`.",
  usage: "[kaencrypted] {amount=100}",
  log: true,
  args: true,
  execute(msg, [kaencrypted, newVotes=100]) {
    if (isNaN(newVotes)) return msg.reply("Please enter a valid number.");
    newVotes = parseInt(newVotes);
    if (newVotes > 500) {
      msg.reply("Limit is 500 votes.");
      newVotes = 500
    }
    msg.channel.send(`${msg.author.username} is voting this discussion key: ${kaencrypted}`);

    (async () => {
      
      let baseUrl = "https://www.khanacademy.org/api/internal";

      // Update total votes
      let bot_data = JSON.parse(fs.readFileSync("./bot_data.json"));
      bot_data.votes += parseInt(bot_data.votes) + newVotes;
      fs.writeFileSync("./bot_data.json", JSON.stringify(bot_data));

      // Update message every 2 seconds with progress bar
      let i = 0;
      let myMsg = msg.channel.send("Loading...")
      const updateProgress = () => {
        myMsg.then(m => {
          let len = 40
          let ratioFinished = i / newVotes
          let progressDots = "█".repeat(Math.floor(ratioFinished * len)) + ".".repeat(len - Math.floor(ratioFinished * len));
          m.edit(`Progress: \`[${progressDots}]\` ${i}/${newVotes} (${(ratioFinished*100).toFixed(1)}%)`);
        })
      }
      let updateMessage = setInterval(updateProgress, 1000 * 2);

      // Vote project
      for (i = 0; i < newVotes; i++) {
        let { KAAS } = logins[(bot_data.votes + i) % logins.length];
        let headers = {
          "content-type": "application/json",
          "x-ka-fkey": `lol`,
          cookie: `KAAS=${KAAS}; fkey=lol`,
        };
        let res = await fetch(
          `${baseUrl}/discussions/voteentity?entity_key=${kaencrypted}&vote_type=1`,
          {
            headers: headers,
            body: ``,
            method: "POST",
          }
        );
        if (res.status !== 200) {
          console.log(`Failed to vote discussion ${kaencrypted}`, res.status, KAAS, new Date());
        }
      }

      // Finish
      updateProgress()
      clearInterval(updateMessage)
      msg.channel.send(`Finished`);
    })();
  },
};
