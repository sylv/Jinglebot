// ==================
// RUN
// ==================
module.exports.run = (client, msg, args) => {
  // if no command provided, show all available commands and info about the bot
  if (args.length === 0) {
    return msg.channel.send({
      embed: {
        color: 0x89d67e,
        title: `🦌 Jinglebot Commands`,
        description: "Below are all the Jinglebot commands available.\n \nTo run a command, run `j!commandNameHere`\n",
        fields: [
          {
            name: "Gameplay",
            value: "· `leaderboard` · see who's on the top 100\n· `profile` · see who you've gifted",
          },
          {
            name: "System",
            value: "· `colors` · see the color - emoji key\n· `credits` · see what made this bot possible",
          },
        ],
      },
    });
  }

  const cmd = client.commands.get(client.aliases.get(args[0]) ?? args[0]);
  if (!cmd) {
    return msg.channel.send(
      `❌🎄 That command does not exist! Please use the \`${client.prefix}help\` command to see what commands are available`
    );
  }

  // if the command exists, send an information embed
  if (cmd) {
    return msg.channel.send({
      embed: {
        color: 0x89d67e,
        title: `Command  🦌  \`${cmd.commandName}\``,
        description: `
                **Aliases:** ${cmd.help.shortcuts}\n
                **Details:** ${cmd.help.details}
            `,
      },
    });
  }
};

// ==================
// CONFIG & HELP
// ==================
module.exports.conf = {
  aliases: ["h"],
};

module.exports.help = {
  name: "help",
  shortcuts: "`h`",
  details: `See what commands are available`,
};
