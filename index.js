// ================
// DEPENDENCIES
// ================
// PACKAGES
const Discord = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");
const config = require("./config.json");

const client = new Discord.Client({ messageEditHistoryMaxSize: 0 });
const uri = config.mongo_uri;
const db = mongoose.connection;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set("useCreateIndex", true);

db.on("open", () => {
  console.log("Connected to mongoose");
});

// ================
// INITIALIZING
// ================
client.on("debug", (msg) => console.debug(msg));
client.on("ready", () => {
  console.log("\n\n\x1b[32m%s\x1b[0m", " 🦌  Jinglebot ready to spread cheer! \n\n");
  const globalMemberCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
  client.user.setActivity(`with ${globalMemberCount} users! 🦌 `);
  client.prefix = config.prefix;
});

// load all the events
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach((file) => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

// load all the commands
fs.readdir("./commands/", (err, folders) => {
  if (err) return console.error(err);
  // initializing commands and aliases array
  client.commands = new Map();
  client.aliases = new Map();
  // loop through the command folders and push each one into the commands array
  folders.forEach((folder) => {
    fs.readdir(`./commands/${folder}/`, (error, files) => {
      // for each command
      files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${folder}/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
        // if the command has aliases, push those into the alias array
        for (const alias of props.conf?.aliases ?? []) {
          client.aliases.set(alias, commandName);
        }
      });
    });
  });
});

// ================
// LOGIN
// ================
client.login(config.token);
