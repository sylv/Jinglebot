// ==================
// DEPENDENCIES
// ==================
const axios = require("axios");
const config = require("../../config.json");

// - data
const User = require("../../models/user");
const villagers = require("../../data/villagers");
const colors = require("../../data/colors");
const items = require("../../data/items");

// filter out just the tops
const tops = items.filter((item) => item.sourceSheet === "Tops" && item.seasonalAvailability === "Winter");

// ==================
// RUN
// ==================
module.exports.run = async (client) => {
  // find the playable channel
  const giftChannel = client.channels.cache.find((channel) => channel.id === client.playableChannel);

  // send a random villager every x minutes
  client.enableGame = setInterval(async () => {
    // get a random villager
    let villagerData = villagers[Math.floor(Math.random() * villagers.length)];

    // api call to get extra villager data and image
    await axios
      .get(`https://api.nookipedia.com/villagers?name=${villagerData.name}`, {
        headers: { "X-API-KEY": config.nookipedia_key },
      })
      .then((vilData) => {
        villagerData.transparentImage = vilData.data[0].image_url;
        villagerData.titleColor = vilData.data[0].title_color;
      });

    // create the embed
    embedOptions = {
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

    // send the embed
    giftChannel.send({ embed: embedOptions }).then(async (sentMessage) => {
      let colorChoices = colors.slice();
      let villColors = [];
      let gifter;

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
      const filter = (reaction, user) => {
        return emojiFilter.includes(reaction.emoji.name) && !user.bot;
      };

      // reaction collector - will wait up to 120 seconds
      const collector = sentMessage.createReactionCollector(filter, {
        time: 120000,
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
      collector.on("end", async (collected, existingUser) => {
        // edit the embed to say the villager wasn't gifted if no correct reactors after 2 mins
        if (!gifter) {
          embedOptions.color = "0xE92F38";
          embedOptions.title = `${randomColor.emoji} No one guessed ${villagerData.name}'s favorite color correctly, ${villagerData.catchphrase}`;
          embedOptions.description = `${villagerData.name} was not gifted in time, but that's okay. Better luck next time!`;
          embedOptions.image = null;
          return sentMessage.edit({ embed: embedOptions });
        }

        // select a random gift
        await tops.sort(() => 0.5 - Math.random()).slice(0, 2);
        let randomGift = this.methods.getGift(tops, randomColor.color);

        // create the gifted villager object
        let giftedVillager = {
          name: villagerData.name,
          emoji: randomColor.emoji,
          gift: randomGift,
          dateGifted: new Date(),
        };

        // if gifter doesn't have an entry yet, create one
        if (!existingUser) {
          this.methods.createUser(gifter.id, `${gifter.username}#${gifter.discriminator}`, giftedVillager);
        }

        // if gifter has an entry, update their gifted array
        if (existingUser) {
          this.methods.updateUser(existingUser, giftedVillager);
        }

        // edit the embed
        embedOptions.color = "0x84f542";
        embedOptions.title = `${randomColor.emoji}  ${villagerData.name} has been gifted, ${villagerData.catchphrase}!`;
        embedOptions.description = `<@${gifter.id}> gifted **${villagerData.name}**: ${randomGift.name}!`;
        embedOptions.thumbnail = { url: randomGift.image };

        sentMessage.edit({ embed: embedOptions });
      });
    });
  }, config.spawn_time * 60000);
};

// ==================
// STOP GAME
// ==================
module.exports.stop = (client) => {
  if (client.enableGame) clearInterval(client.enableGame);
};

// ==================
// METHODS
// ==================
module.exports.methods = {
  getGift: (tops, favColor) => {
    // find random gift
    const gift = tops.find((top) => top.variants.some((variant) => variant.colors.includes(favColor)));
    // find the exact variant
    const giftVariant = gift.variants.find((variant) => variant.colors.includes(favColor));
    // return the relevant info
    return {
      name: `${favColor} ${gift.name}`,
      image: giftVariant.closetImage,
    };
  },
  createUser: (userID, username, villager) => {
    User.create(
      {
        discordId: userID,
        username: username,
        gifted: [villager],
      },
      (err, createdUser) => {
        if (err) return;
        return createdUser;
      }
    );
  },
  updateUser: (foundUser, villager) => {
    foundUser.gifted.unshift(villager);
    foundUser.save();
  },
};
