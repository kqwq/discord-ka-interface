
const fetch = require("node-fetch");
const logins = require("../logins");
const fs = require("fs");


module.exports = {
  name: "eval",
  aliases: ["e"],
  cooldown: 5,
  ownerOnly: true,
  description: "Evaluates code, owner only. `msg` is the message object.",
  args: true,
  usage: "[code]",
  execute(msg, args) {
    msg.channel.send(eval(args.join(" ")) || "[empty]");
  }
};
