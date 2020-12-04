const humanInterval = require("human-interval");
const axios = require("axios");
const config = require("../config.json");
const GuildSettings = require("../models/GuildSettings");
const User = require("../models/User");
const villagers = require("../data/villagers.json");
const colors = require("../data/colors.json");
const items = require("../data/items.json");

const minEventTime = humanInterval(config.time_between_events.min);
const maxEventTime = humanInterval(config.time_between_events.max);
// filter out just the tops
const tops = items.filter((item) => item.sourceSheet === "Tops" && item.seasonalAvailability === "Winter");

async function runCommand(client, msg) {
  const args = msg.content.slice(client.prefix.length).trim().split(/ +/g);
  const commandName = args.shift().toLowerCase();
  if (!commandName) return;
  const command = client.commands.get(client.aliases.get(commandName) ?? commandName);
  if (!command) {
    return msg.channel.send(`<@${msg.author.id}> that is not a command! Check \`j!help\` to find out what commands are available to use.`);
  }

  try {
    // run the command
    await command.run(client, msg, args);
  } catch (err) {
    // catch any errors so the bot doesn't restart
    console.error(`Error running command ${command.help.name}`, err);
  }
}

async function startEvent(client, msg) {
  if (msg.guild.nextEvent !== undefined && msg.guild.nextEvent > Date.now()) return;
  const nextEventRelative = Math.floor(Math.random() * (maxEventTime - minEventTime) + minEventTime);
  console.debug(`Next event for ${msg.guild.id} in ${nextEventRelative / 60000} minutes`);
  msg.guild.nextEvent = Date.now() + nextEventRelative;

  const serverSettings = await GuildSettings.findOne({ id: msg.guild.id });
  if (!serverSettings) return console.debug(`No server settings for guild ${msg.guild.id}`);
  const giftChannel = client.channels.resolve(serverSettings.giftChannel);
  if (!giftChannel) return console.debug(`Invalid gift channel ${serverSettings.giftChannel}`);
  const villagerData = villagers[Math.floor(Math.random() * villagers.length)];
  // api call to get extra villager data and image
  await axios
    .get(`https://api.nookipedia.com/villagers?name=${villagerData.name}`, {
      headers: { "X-API-KEY": config.nookipedia_key },
    })
    .then((vilData) => {
      villagerData.transparentImage = vilData.data[0].image_url;
      villagerData.titleColor = vilData.data[0].title_color;
    });

  // send the embed
  const embed = {
    color: `0x${villagerData.titleColor}`,
    title: `🎁  ${villagerData.name} needs winter clothing, ${villagerData.catchphrase}!`,
    description: `Jingle needs help dressing **${villagerData.name} the ${villagerData.personality} ${villagerData.species}** for winter.\n Can you help him? React to the color you think **${villagerData.name}** likes best!`,
    image: {
      url: villagerData.transparentImage,
    },
    footer: {
      text: "Image provided by Nookipedia. Data from ACNH Spreadsheet",
    },
  };

  const sentMessage = await giftChannel.send({ embed });
  let colorChoices = colors.slice();
  let villColors = [];
  let gifter;
  let existingUser;

  // remove the 2 colors that the villager likes
  await villagerData.colors.forEach((color) => {
    let colorId = colorChoices.findIndex((colorData) => color == colorData.color);
    if (colorId >= 0) {
      villColors.push(colorChoices[colorId]);
      colorChoices.splice(colorId, 1);
    }
  });

  // shuffle the array and slice the first two
  colorChoices = await colorChoices.sort(() => 0.5 - Math.random()).slice(0, 2);
  // add a random emoji the villager likes
  let randomColor = villColors[Math.floor(Math.random() * villColors.length)];
  colorChoices.push(randomColor);

  // shuffle again
  await colorChoices.sort(() => 0.5 - Math.random());

  // react to the message
  let emojiFilter = [];
  await colorChoices.forEach((color) => {
    sentMessage.react(color.emoji);
    emojiFilter.push(color.emoji);
  });

  // filter for checking reactions
  const filter = (reaction, user) => emojiFilter.includes(reaction.emoji.name) && !user.bot;
  // reaction collector - will wait up to 120 seconds
  const collector = sentMessage.createReactionCollector(filter, {
    // time: 120000,
    time: humanInterval(config.wait_time),
  });

  // when someone reacts
  collector.on("collect", async (collectedReaction, reactingUser) => {
    // when the wrong color is clicked, apply a 1min cooldown to the user so they can't just spam click all colors
    if (collectedReaction.emoji.name !== randomColor.emoji) {
      reactingUser.giftCooldown = Date.now() + 60000;
    }

    // when right color is clicked and user is not on cd
    if (collectedReaction.emoji.name === randomColor.emoji && (!reactingUser.giftCooldown || reactingUser.giftCooldown < Date.now())) {
      // find the gifting user
      User.findOne({ discordId: reactingUser.id }, (err, foundUser) => {
        existingUser = foundUser;
        // if error, silently return
        if (err) return console.log(err);

        // if no user, set the reactor as the gifter and end the collector
        if (!foundUser) {
          gifter = reactingUser;
          return collector.stop(false);
        }

        // if found user, and have gifted this villager  before, silently return
        if (foundUser && foundUser.gifted.some((g) => g.name === villagerData.name)) return;

        // if found user, and they havent gifted this villager before, end the collector and pass the user's data
        if (foundUser && !foundUser.gifted.some((g) => g.name === villagerData.name)) {
          gifter = reactingUser;
          return collector.stop(foundUser);
        }
      });
    }
  });

  // when collector stops
  collector.on("end", async () => {
    // edit the embed to say the villager wasn't gifted if no correct reactors after 2 mins
    if (!gifter) {
      embed.color = "0xE92F38";
      embed.title = `${randomColor.emoji} No one guessed ${villagerData.name}'s favorite color correctly, ${villagerData.catchphrase}`;
      embed.description = `${villagerData.name} was not gifted in time, but that's okay. Better luck next time!`;
      embed.image = null;
      return sentMessage.edit({ embed });
    }

    // select a random gift
    await tops.sort(() => 0.5 - Math.random()).slice(0, 2);
    const gift = tops.find((top) => top.variants.some((variant) => variant.colors.includes(randomColor.color)));
    const giftVariant = gift.variants.find((variant) => variant.colors.includes(randomColor.color));
    // create the gifted villager object
    const giftedVillager = {
      name: villagerData.name,
      emoji: randomColor.emoji,
      dateGifted: new Date(),
      gift: {
        name: `${randomColor.color} ${gift.name}`,
        image: giftVariant.closetImage,
      },
    };

    // if gifter doesn't have an entry yet, create one
    if (!existingUser) {
      await User.create({
        discordId: gifter.id,
        username: gifter.tag,
        gifted: [giftedVillager],
      });
    }

    // if gifter has an entry, update their gifted array
    if (existingUser) {
      await User.update({ discordId: gifter.id, $push: { gifted: giftedVillager } });
    }

    if (serverSettings.leaderRole) {
      const role = msg.guild.roles.resolve(serverSettings.leaderRole);
      const giftingMember = msg.guild.members.resolve(gifter.id);
      if (role && giftingMember) {
        const currentUser = role.members.first();
        const leaderboardTop = (
          await User.aggregate([
            { $addFields: { gifted_count: { $size: { $ifNull: ["$gifted", []] } } } },
            { $sort: { gifted_count: -1 } },
            { $limit: 1 },
          ])
        ).shift();

        if (leaderboardTop && leaderboardTop.discordId === gifter.id) {
          if (currentUser && currentUser.id !== gifter.id) await currentUser.roles.remove(role.id);
          if (!giftingMember.roles.cache.has(role.id)) await giftingMember.roles.add(role.id);
        }
      }
    }

    // edit the embed
    embed.color = "0x84f542";
    embed.title = `${randomColor.emoji}  ${villagerData.name} has been gifted, ${villagerData.catchphrase}!`;
    embed.description = `<@${gifter.id}> gifted **${villagerData.name}**: ${giftedVillager.gift.name}!`;
    embed.thumbnail = { url: giftedVillager.gift.image };
    await sentMessage.edit({ embed });
  });
}

// on message
module.exports = (client, msg) => {
  if (msg.author.bot) return;
  if (msg.content.startsWith(config.prefix)) {
    if (!msg.guild) return msg.channel.send("❌🦌 Jingle is not available in DM's!");
    return runCommand(client, msg);
  }

  if (!msg.guild) return;
  return startEvent(client, msg);
};
