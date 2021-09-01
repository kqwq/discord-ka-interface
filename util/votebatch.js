const fetch = require("node-fetch");
const logins = require("../logins");
const fs = require("fs");

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

function voteByEntityKey(msg, entity_key, amount, voteDirection) {// Vote direction is either 0 (unvote) or 1 (vote)

  // Update total votes
  let bot_data = JSON.parse(fs.readFileSync("./bot_data.json"));
  bot_data.votes += parseInt(bot_data.votes) + amount;
  fs.writeFileSync("./bot_data.json", JSON.stringify(bot_data));

  // Update message every 3 seconds with progress bar
  let i = 0;
  let myMsg = msg.channel.send("Loading...");
  const updateProgress = () => {
    myMsg.then((m) => {
      let len = 40;
      let ratioFinished = i / amount;
      let progressDots =
        "█".repeat(Math.floor(ratioFinished * len)) +
        ".".repeat(len - Math.floor(ratioFinished * len));
      m.edit(
        `Progress: \`[${progressDots}]\` ${i}/${amount} (${(
          ratioFinished * 100
        ).toFixed(1)}%)`
      );
    });
  };
  let updateMessage = setInterval(updateProgress, 1000 * 3);

  // Create list of KAASs
  let KAASs = [];
  for (let j = 0; j < amount; j++) {
    let { KAAS } = logins[(bot_data.votes + j) % logins.length];
    KAASs.push(KAAS);
  }
  let baseUrl = "https://www.khanacademy.org/api/internal";

  // Define task
  const task = (KAAS) => {
    return fetch(
      `${baseUrl}/discussions/voteentity?entity_key=${entity_key}&vote_type=${voteDirection}`,
      {
        headers: {
          "content-type": "application/json",
          "x-ka-fkey": `lol`,
          cookie: `KAAS=${KAAS}; fkey=lol`,
        },
        body: ``,
        method: "POST",
      }
    ).then((res) => {
      i++;
      if (res.status !== 200) {
        return console.log(`Error voting: ${res.status}`);
      }
    });
  };

  promiseAllInBatches(task, KAASs, 10)
    .then(() => {
      // Finish
      updateProgress();
      clearInterval(updateMessage);
      msg.channel.send(`Finished - Khan Academy's servers may take a few minutes to update`);
    })
    .catch((err) => {
      // Error
      clearInterval(updateMessage);
      msg.channel.send(`Error: ${err}`);
    });
}

module.exports = {
  voteByEntityKey,
};