module.exports = {
  name: "ping",
  cooldown: 5,
  description: "Returns bot latency in milliseconds",
  args: false,
  execute(msg) {
    msg.channel
      .send("Pinging...")
      .then((m) => {
        let ping = m.createdTimestamp - msg.createdTimestamp;
        m.edit(`Latency: ${ping}ms`);
      })
      .catch(console.error);
  }
};
