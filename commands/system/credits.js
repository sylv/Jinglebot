// ==================
// RUN
// ==================
module.exports.run = async (client, msg, args) => {
  // create the embed
  const embedOptions = {
    title: "Jinglebot Credits",
    color: 0x4dd170,
    thumbnail: { url: "https://imgur.com/VE3VEpS.png" },
    description:
      "Jinglebot was created by <@331295166856167424> exclusively for the ACNH server. \n\nThe following resources were essential for this bot: \n- **Nookipedia API:** https://api.nookipedia.com/ \n- **ACNH Data Sheet:** https://tinyurl.com/acnh-sheet\n - **Google sheets to JSON:** https://github.com/acdb-team/google-sheets-to-json",
  };

  // send the message
  msg.channel.send({ embed: embedOptions });
};

// ==================
// CONFIG & HELP
// ==================
module.exports.conf = {
  aliases: ["cred", "creds", "cr"],
};

module.exports.help = {
  name: "credits",
  shortcuts: "`cred` `creds` `cr`",
  details: `See what resources made this bot possible!`,
};
