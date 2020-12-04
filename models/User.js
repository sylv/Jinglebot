// ==================
// DEPENDENCIES
// ==================
const mongoose = require("mongoose");

// ==================
// SCHEMA
// ==================
const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  gifted: { type: Array, default: [] },
});

// ==================
// EXPORT
// ==================
const User = mongoose.model("User", userSchema);
module.exports = User;
