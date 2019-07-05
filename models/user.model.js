const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  drinks: [
    {
      drink: { type: String, required: true },
      toppings: { type: [String], required: true },
      price: { type: Number, required: true },
      sugarLevel: { type: Number, required: true },
      store: { type: String, required: true },
      dateBought: { type: Date, required: true }
    }
  ]
});

mongoose.model("user", userSchema);
