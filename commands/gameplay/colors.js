// ==================
// RUN
// ==================
module.exports.run = (client, msg, args) => {
  // create the embed
  const embedOptions = {
    color: `0x1c612b`,
    title: `🎁  Emoji Color Key`,
    description: `The favorite colors assigned to each villager is based on their actual in-game favorite colors. Below is the emoji key to find out which emoji corresponds to what color!`,
    fields: [
      {
        name: "Beige",
        value: "🐕",
        inline: true,
      },
      {
        name: "Black",
        value: "🖤",
        inline: true,
      },
      {
        name: "Blue",
        value: "💙",
        inline: true,
      },
      {
        name: "Brown",
        value: "🤎",
        inline: true,
      },
      {
        name: "Color",
        value: "🌈",
        inline: true,
      },
      {
        name: "Gray",
        value: "🐘",
        inline: true,
      },
      {
        name: "Green",
        value: "💚",
        inline: true,
      },
      {
        name: "Light blue / Aqua",
        value: "🌊",
        inline: true,
      },
      {
        name: "Orange",
        value: "🧡",
        inline: true,
      },
      {
        name: "Pink",
        value: "💗",
        inline: true,
      },
      {
        name: "Purple",
        value: "💜",
        inline: true,
      },
      {
        name: "Red",
        value: "❤️",
        inline: true,
      },
      {
        name: "White",
        value: "🤍",
        inline: true,
      },
      {
        name: "Yellow",
        value: "💛",
        inline: true,
      },
    ],
  };
  // send the embed
  msg.channel.send({ embed: embedOptions });
};

// ==================
// CONFIG & HELP
// ==================
module.exports.conf = {
  aliases: ["color", "col"],
};

module.exports.help = {
  name: "colors",
  shortcuts: "`color` `col`",
  details: `See what emoji corresponds to what color`,
};
