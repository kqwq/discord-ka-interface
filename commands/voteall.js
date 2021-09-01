const fetch = require("node-fetch");
const logins = require("../logins");
const { voteByEntityKey } = require("../util/votebatch");

module.exports = {
  name: "voteall",
  aliases: ["vote_all"],
  cooldown: 60 * 30, // 30 minutes
  description: "Votes a Khan Academy project the maximum number of times.",
  usage: "[programId]",
  ownerOnly: true,
  log: true,
  args: true,
  execute(msg, [projId]) {
    let url;
    if (projId.includes("https://www.khanacademy.org")) {
      url = projId;
      projId = url.split("/")[5];
    } else {
      url = `https://www.khanacademy.org/cs/i/${projId}`;
    }
    msg.channel.send(
      `${msg.author.username} is removing all artificial votes from ${url}`
    );

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

      // Remove every possible vote
      voteByEntityKey(msg, entity_key, logins.length, 1);
    })();
  }
};
