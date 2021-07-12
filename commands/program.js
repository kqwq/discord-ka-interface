const fetch = require("node-fetch");
const logins = require("../logins");
const fs = require("fs");

module.exports = {
  name: "program",
  aliases: ["project"],
  cooldown: 60 * 30, // 30 minutes
  description: "Votes up a project on Khan Academy",
  usage: "[programId] {amount=100}",
  log: true,
  args: true,
  execute(msg, [projId, newVotes=100]) {
    if (isNaN(newVotes)) return msg.reply("Please enter a valid number.");
    newVotes = parseInt(newVotes);
    if (newVotes > 500) {
      msg.reply("Limit is 500 votes.");
      newVotes = 500
    }
    let url
    if (projId.includes("https://www.khanacademy.org")) {
      url = projId
      projId = url.split("/")[5]
    } else {
      url = `https://www.khanacademy.org/cs/i/${projId}`;
    }
    msg.channel.send(`${msg.author.username} is voting this program ${url}`);

    (async () => {

      // Get entity key
      let baseUrl = "https://www.khanacademy.org/api/internal";
      let res = await fetch(
        `${baseUrl}/scratchpads/${projId}?projection={"key":1}`,
        { headers: {}, method: "GET", mode: "cors" }
      );
      if (res.status !== 200) {
        return msg.channel.send(`Error getting scratchpad: ${res.status}`);
      }
      let entity = await res.json();
      let entity_key = entity.key;

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
          `${baseUrl}/discussions/voteentity?entity_key=${entity_key}&vote_type=1`,
          {
            headers: headers,
            body: ``,
            method: "POST",
          }
        );
        if (res.status !== 200) {
          console.log(`Failed to vote proj ${projId}`, res.status, KAAS, new Date());
        }
      }

      // Finish
      updateProgress()
      clearInterval(updateMessage)
      msg.channel.send(`Finished`);
    })();
  },
};
