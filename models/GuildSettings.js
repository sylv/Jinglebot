const mongoose = require("mongoose");
const guildSettingsSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  giftChannel: { type: String },
  leaderRole: { type: String },
});

const GuildSettings = mongoose.model("GuildSettings", guildSettingsSchema);
module.exports = GuildSettings;
