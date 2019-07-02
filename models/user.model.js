const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  drinks: [{ type: mongoose.Schema.ObjectId, ref: "drink" }]
});

mongoose.model("user", userSchema);
