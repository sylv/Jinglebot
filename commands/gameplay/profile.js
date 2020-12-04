// ==================
// DEPENDENCIES
// ==================
const Discord = require("discord.js");
const User = require("../../models/user");

// ==================
// RUN
// ==================
module.exports.run = async (client, msg, args, originalEmbed, foundUser) => {
  // find user's personality role if any
  let personalityColor = 0x6fe3f2; // if none, color will default to a light blue
  await msg.member.roles.cache.forEach((role) => {
    if (["Peppy", "Normal", "Snooty", "Uchi", "Smug", "Cranky", "Lazy", "Jock"].includes(role.name)) personalityColor = role.color;
  });

  // find the page
  let page = args[0] || 1;

  // find the user
  let userData = foundUser || {
    error: `❄️ You have not gifted any villagers yet! <@${msg.author.id}>`,
  };
  await User.findOne({ discordId: msg.author.id }, (err, foundUser) => {
    // if error or no user found, silently return
    if (err || !foundUser) return;

    // otherwise return the user data
    return (userData = foundUser);
  });

  // if no user data, send the error message
  if (userData && userData.error) return msg.channel.send(userData.error);

  // set the initial embed
  const embedOptions = {
    color: personalityColor,
    title: `:christmas_tree: ${msg.author.username}'s Profile`,
    thumbnail: { url: msg.author.avatarURL() },
    description: `<@${msg.author.id}> has spread holiday cheer to the following villagers\n\n`,
  };

  // slice the array to collect just the current page
  let currentPage = userData.gifted.slice((page - 1) * 10, page * 10);

  // loop through the current page of the user's gifted villagers and add them onto the description
  currentPage.forEach((villager) => {
    // format the date
    let date = `${villager.dateGifted.getMonth() + 1}/${villager.dateGifted.getDate().toString().padStart(2, "0")}`;
    // add the villager to the desc
    embedOptions.description += `${villager.emoji} · \`${date}\` · **${villager.name}** · ${villager.gift.name}\n`;
  });

  // set the embed footer
  embedOptions.footer = {
    text: `Viewing villagers ${(page - 1) * 10 + 1} - ${(page - 1) * 10 + 1 + (currentPage.length - 1)} of ${userData.gifted.length}`,
  };

  // send the embed (on first run of the command)
  if (!originalEmbed) {
    msg.channel.send({ embed: embedOptions }).then((sentMessage) => {
      // if more than one page, react with arrows, if not silently return
      if (userData.gifted.length > 10) {
        sentMessage.react("⬅️");
        sentMessage.react("➡️");
      } else return;

      // filter for checking reactions
      const filter = (reaction, user) => {
        return ["⬅️", "➡️"].includes(reaction.emoji.name) && !user.bot;
      };

      // reaction collector - will collect up to 60 seconds
      const collector = sentMessage.createReactionCollector(filter, {
        time: 60000,
      });

      // when someone reacts
      collector.on("collect", async (collectedReaction) => {
        // find the profile command from the client
        let profileCmd = client.commands.find((commandKey) => commandKey.commandName === "profile");

        // go backwards or forwards a page if possible, if not do nothing
        if (collectedReaction.emoji.name === "➡️" && userData.gifted.length > (page - 1) * 10 + 1 + (currentPage.length - 1)) {
          page += 1;
          profileCmd.props.run(client, msg, [page], sentMessage, userData);
        } else if (collectedReaction.emoji.name === "⬅️" && page !== 1) {
          page -= 1;
          profileCmd.props.run(client, msg, [page], sentMessage, userData);
        }
      });
    });
  } else {
    // edit the embed (on changing page)
    const editedEmbed = new Discord.MessageEmbed(embedOptions);
    originalEmbed.edit(editedEmbed);
  }
};

// ==================
// CONFIG & HELP
// ==================
module.exports.conf = {
  aliases: ["pro", "p"],
};

module.exports.help = {
  name: "profile",
  shortcuts: "`pro` `p`",
  details: `Check how many villagers you've gifted and your current rank`,
};
