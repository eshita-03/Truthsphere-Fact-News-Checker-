const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ["vote", "verify"],
    required: true
  },
  title: String,      // article title or the claim text
  url: String,         // article url (votes only)
  source: String,       // article source name (votes only)
  verdict: String,       // verification verdict (verify only)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Activity", activitySchema);
