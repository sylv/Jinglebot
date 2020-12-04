// ==================
// RUN

const GuildSettings = require("../../models/GuildSettings");

// ==================
module.exports.run = async (client, msg, args) => {
  // if not server owner, return error
  if (msg.author.id !== msg.guild.ownerID) {
    return msg.channel.send("❌🎅 You don't have permission to use this command");
  }

  // if no args given, return error
  if (!args[0]) {
    return msg.channel.send("❌🎅 Must provide at least one argument: `enable` or `disable`. Run `j!help config` if you need help.");
  }

  if (args[0] === "set-role") {
    const role = args[1] && msg.guild.roles.resolve(args[1].replace(/[\D]/g, ""));
    if (!role) return msg.channel.send("❌🎅 You must provide a role.");
    await GuildSettings.findOneAndUpdate({ id: msg.guild.id }, { id: msg.guild.id, leaderRole: role.id }, { upsert: true });
    return msg.channel.send(`🎅 The person on top of the leaderboard will get the ${role.name} role.`);
  }

  // if enable command
  if (args[0] === "enable") {
    const channel = args[1] ? client.channels.resolve(args[1].replace(/[\D]/g, "")) : msg.channel;
    await GuildSettings.findOneAndUpdate({ id: msg.guild.id }, { id: msg.guild.id, giftChannel: channel.id }, { upsert: true });

    // return success message
    return msg.channel.send(`🎅 **Successfully set <#${channel.id}> as the playable channel!** Jingle will ask for your help soon!`);
  }

  // if disable command
  if (args[0] === "disable") {
    await GuildSettings.update({ id: msg.guild.id }, { giftChannel: null });
    return msg.channel.send(`🎅 Disabled the gift channel for this server.`);
  }

  return msg.channel.send("❌🎅 Incorrect argument supplied or incorrect order. Run `j!help config` to find proper usage.");
};

// ==================
// CONFIG & HELP
// ==================
module.exports.help = {
  name: "enable",
  shortcuts: "none",
  details: `You must be the server *and* bot owner to use this command. Configure the bot and where it can spawn villagers. Can only have one channel active at a time. \n\n**Usage:** \nTo enable a channel: \`j!config enable #channel-name\` or just \`j!config enable\` in the channel you want to enable. Enabling a different channel will automatically disable the previously enabled channel. \n\nTo disable a channel: \`j!config disable #channel-name\` or just \`j!config disable\` in the channel you want to disable`,
};
