// ==================
// DEPENDENCIES
// ==================
const Discord = require("discord.js");
const User = require("../../models/user");

// ==================
// RUN
// ==================
module.exports.run = async (client, msg, args, originalEmbed, foundTop, originalAsker) => {
  // find the page
  let page = args[0] || 1;

  // find the top 100
  let asker = originalAsker || false;
  const topGifters =
    foundTop ||
    (await User.aggregate(
      [
        {
          $addFields: { gifted_count: { $size: { $ifNull: ["$gifted", []] } } },
        },
        { $sort: { gifted_count: -1 } },
        { $limit: 100 },
      ],
      (err, foundUsers) => {
        return foundUsers;
      }
    ));

  // create the embed
  const embedOptions = {
    color: "0xa83232",
    title: "🎁  The Leaderboard",
    thumbnail: { url: "https://imgur.com/ZgB0QG2.png" },
    description: "Jingle appreciates everyone's help!\n\n",
  };

  // find the asker's rank, if any
  if (topGifters.some((gifter) => gifter.discordId === msg.author.id)) {
    let askerRank = topGifters.findIndex((gifter) => gifter.discordId === msg.author.id);
    asker = { dbInfo: topGifters[askerRank], rank: askerRank + 1 };
  }

  // slice the array to colect just the current page
  let currentPage = topGifters.slice((page - 1) * 10, page * 10);

  // create the leaderboard
  let codeBlock = "```md\n Rank  |  Gifts  |  User                 \n===========================\n";

  await currentPage.forEach((gifter, i) => {
    // add each top 100 gifter on the current page
    codeBlock += `  ${(page - 1) * 10 + i + 1}.  |   ${gifter.gifted.length}   | ${gifter.username}\n`;
  });

  codeBlock += "\n===========================\n```";
  embedOptions.description += codeBlock;

  // if the asker is in the top 100
  if (asker) {
    let askerRank = `\`\`\`md\n ${asker.rank}. |   ${asker.dbInfo.gifted.length}   | ${asker.dbInfo.username} (You)\`\`\``;
    embedOptions.description += askerRank;
  } else {
    // if the asker has no info in the top 100
    let askerRank = `\`\`\`md\n ${msg.author.username} is unranked\`\`\``;
    embedOptions.description += askerRank;
  }

  // set the embed footer
  embedOptions.footer = {
    text: `Viewing rank ${(page - 1) * 10 + 1} - ${(page - 1) * 10 + 1 + (currentPage.length - 1)} of ${topGifters.length}`,
  };

  // send the embed (on first run of the command )
  if (!originalEmbed) {
    msg.channel.send({ embed: embedOptions }).then((sentMessage) => {
      // if more than one page, react with arrows, if not silently return
      if (topGifters.length > 10) {
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
        // find the leaderboard command from the client
        let lbCmd = client.commands.find((commandKey) => commandKey.commandName === "leaderboard");

        // go backwards or forwards a page if possible, if not do nothing
        if (collectedReaction.emoji.name === "➡️" && topGifters.length > (page - 1) * 10 + 1 + (currentPage.length - 1)) {
          page += 1;
          lbCmd.props.run(client, msg, [page], sentMessage, topGifters, asker);
        } else if (collectedReaction.emoji.name === "⬅️" && page !== 1) {
          page -= 1;
          lbCmd.props.run(client, msg, [page], sentMessage, topGifters, asker);
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
  aliases: ["lb", "scoreboard", "sb"],
};

module.exports.help = {
  name: "leaderboard",
  shortcuts: "`lb` `scoreboard` `sb`",
  details: `Check the current leaderboard ranking of who has gifted the most villagers`,
};
