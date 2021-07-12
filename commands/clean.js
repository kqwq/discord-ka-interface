const fetch = require("node-fetch");
const logins = require("../logins");
const fs = require("fs");

module.exports = {
  name: "clean",
  aliases: ["unvoteall", "unvote_all"],
  cooldown: 60 * 30, // 30 minutes
  description: "Removes all artificial votes from a Khan Academy program",
  usage: "[programId]",
  ownerOnly: true,
  log: true,
  args: true,
  execute(msg, [projId]) {
    let url
    if (projId.includes("https://www.khanacademy.org")) {
      url = projId
      projId = url.split("/")[5]
    } else {
      url = `https://www.khanacademy.org/cs/i/${projId}`;
    }
    msg.channel.send(`${msg.author.username} is removing all artificial votes from ${url}`);

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

      // Update message every 2 seconds with progress bar
      let myMsg = msg.channel.send("Loading...")
      const updateProgress = () => {
        myMsg.then(m => {
          let len = 40
          let ratioFinished = i / logins.length
          let progressDots = "█".repeat(Math.floor(ratioFinished * len)) + ".".repeat(len - Math.floor(ratioFinished * len));
          m.edit(`Progress: \`[${progressDots}]\` ${i}/${logins.length} (${(ratioFinished*100).toFixed(1)}%)`);
        })
      }
      let updateMessage = setInterval(updateProgress, 1000 * 2);

      // Vote project
      let i = 0
      for (let { KAAS } of logins) {
        let headers = {
          "content-type": "application/json",
          "x-ka-fkey": `lol`,
          cookie: `KAAS=${KAAS}; fkey=lol`,
        };
        let res = await fetch(
          `${baseUrl}/discussions/voteentity?entity_key=${entity_key}&vote_type=0`,
          {
            headers: headers,
            body: ``,
            method: "POST",
          }
        );
        if (res.status !== 200) {
          console.log(`Failed to vote proj ${projId}`, res.status, KAAS, new Date());
        }
        i ++
      }

      // Finish
      updateProgress()
      clearInterval(updateMessage)
      msg.channel.send(`Finished unvoting`);
    })();
  },
};
