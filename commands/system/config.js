// ==================
// RUN
// ==================
module.exports.run = async (client, msg, args) => {
  // if not server owner, return error
  if (msg.author.id !== msg.guild.ownerID && msg.author.id !== client.bot_owner) {
    return msg.channel.send("❌🎅 You don't have permission to use this command");
  }

  // if no args given, return error
  if (!args[0]) {
    return msg.channel.send("❌🎅 Must provide at least one argument: `enable` or `disable`. Run `j!help config` if you need help.");
  }

  // if incorrect first arg
  if (args[0] !== "enable" && args[0] !== "disable") {
    return msg.channel.send("❌🎅 Incorrect argument supplied or incorrect order. Run `j!help config` to find proper usage.");
  }

  // if enable command
  if (args[0] === "enable") {
    // enable the appropriate channel
    if (!args[1]) client.playableChannel = msg.channel.id;
    if (args[1]) client.playableChannel = args[1].replace(/\D/g, "");

    // return success message
    msg.channel.send(`🎅 **Successfully set <#${client.playableChannel}> as the playable channel!** Jingle will ask for your help soon!`);

    // run the game command
    let gameCmd = client.commands.find((commandKey) => commandKey.commandName === "game");
    gameCmd.props.stop(client);
    return gameCmd.props.run(client);
  }

  // if disable command
  if (args[0] === "disable") {
    // return a message
    msg.channel.send(`🎅 Disabling <#${client.playableChannel}> as the playable channel...`).then((sentMessage) => {
      let disabledChannel = client.playableChannel;
      // disable the channel
      if (!args[1]) client.playableChannel = null;

      // stop the game
      let gameCmd = client.commands.find((commandKey) => commandKey.commandName === "game");
      gameCmd.props.stop(client);

      // edit the message
      sentMessage.edit(`🎅 **Successfully disabled <#${disabledChannel}>!** Jingle will not ask for help in that channel anymore.`);
    });
  }
};

// ==================
// CONFIG & HELP
// ==================
module.exports.help = {
  name: "enable",
  shortcuts: "none",
  details: `Server owner use only. Configure the bot and where it can spawn villagers. Can only have one channel active at a time. \n\n**Usage:** \nTo enable a channel: \`j!config enable #channel-name\` or just \`j!config enable\` in the channel you want to enable. Enabling a different channel will automatically disable the previously enabled channel. \n\nTo disable a channel: \`j!config disable #channel-name\` or just \`j!config disable\` in the channel you want to disable`,
};
