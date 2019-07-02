const mongoose = require("mongoose");

const drinkSchema = new mongoose.Schema({
  _drinker: { type: mongoose.Schema.ObjectId, ref: "user" },
  id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  toppings: { type: [String], required: true },
  price: { type: Number, required: true },
  sugarLevel: { type: Number, required: true },
  store: { type: String, required: true },
  dateBought: { type: Date, required: true }
});

mongoose.model("drink", drinkSchema);
