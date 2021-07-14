const fetch = require("node-fetch");
const logins = require("../logins");
const fs = require("fs");
const { voteByEntityKey } = require("../util/votebatch");

/**
 * Same as Promise.all(), but it waits for the first {batchSize} promises to finish
 * before starting the next batch.
 *
 * @template A
 * @template B
 * @param {function(A): B} task The task to run for each item.
 * @param {A[]} items Arguments to pass to the task for each call.
 * @param {int} batchSize
 * @returns {B[]}
 */
async function promiseAllInBatches(task, items, batchSize) {
  let position = 0;
  let results = [];
  while (position < items.length) {
    const itemsForBatch = items.slice(position, position + batchSize);
    results = [
      ...results,
      ...(await Promise.all(itemsForBatch.map((item) => task(item)))),
    ];
    position += batchSize;
  }
  return results;
}

module.exports = {
  name: "program",
  aliases: ["project"],
  cooldown: 60 * 30, // 30 minutes
  description: "Votes up a project on Khan Academy",
  usage: "[programId] {amount=100}",
  log: true,
  args: true,
  execute(msg, [projId, newVotes = 100]) {
    if (isNaN(newVotes)) return msg.reply("Please enter a valid number.");
    newVotes = parseInt(newVotes);
    if (newVotes > 500) {
      msg.reply("Limit is 500 votes.");
      newVotes = 500;
    }
    let url;
    if (projId.includes("https://www.khanacademy.org")) {
      url = projId;
      projId = url.split("/")[5];
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

      voteByEntityKey(msg, entity_key, newVotes, 1)
    })();
  },
};
