// ==================
// RUN
// ==================
module.exports.run = async (client, msg, args) => {
  const pong = await msg.channel.send("Pinging Jinglebot");
  const time = pong.createdTimestamp - msg.createdTimestamp;
  pong.edit(`Pong! \`${time}\`ms`);
};

// ==================
// CONFIG & HELP
// ==================
module.exports.help = {
  name: "ping",
  shortcuts: "none",
  details: `Check the bot's ping`,
};
