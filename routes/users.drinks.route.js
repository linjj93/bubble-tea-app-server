require("../models/user.model");
require("../db");

const Joi = require("@hapi/joi");
const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const UserModel = mongoose.model("user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateUser = require("../middleware/auth");

const userDrinksRouter = require("./routes/users.drinks.route");


router.get("/:username/drinks", authenticateUser, async (req, res, next) => {
  const { username } = req.params;
  const user = await UserModel.findOne({ username }).catch(err => next(err));
  res.status(200).json({ drinks: user.drinks });
});

router.post("/:username/drinks", authenticateUser, async (req, res, next) => {

  const validation = validateDrink(req.body);
  if (validation.error) {

    return res
      .status(400)
      .json({ message: validation.error.details[0].message });
  }

  const { username } = req.params;
  const newDrink = req.body;

  try {
    const user = await UserModel.findOne({ username });
    const drinks = user.drinks;
    drinks.push(newDrink);
    await user.save();
    res.status(201).json({ drinkAdded: newDrink, drinksAfterAddition: drinks });
  } catch (err) {
    next(err);
  }
});

router.delete(
  "/:username/drinks/:id",
  authenticateUser,
  async (req, res, next) => {
    const { username, id } = req.params;
    try {
      const user = await UserModel.findOne({ username });
      const drinks = user.drinks;
      const drinkToDelete = drinks.find(drink => drink._id.toString() === id);
      if (drinkToDelete === undefined) {
        return res.status(404).json({ message: "No such drink exists." });
      }
      const drinkIndex = drinks.findIndex(drink => drink._id.toString() === id);

      drinks.splice(drinkIndex, 1);

      await user.save();
      res.status(200).json({ drinkDeleted: drinkToDelete, drinksLeft: drinks });
    } catch (err) {
      next(err);
    }
  }
);

router.put("/:username/drinks/:id", async (req, res, next) => {
  const { username, id } = req.params;
  const fieldsToUpdate = req.body;

  try {
    const user = await UserModel.findOne({ username });
    const drinks = user.drinks;
    const drinkIndex = drinks.findIndex(drink => drink._id.toString() === id);
    if (drinks[drinkIndex] === undefined) {
      return res.status(404).json({ message: "No such drink exists." });
    }

    for (let field in fieldsToUpdate) {
      drinks[drinkIndex][field] = fieldsToUpdate[field];
    }

    await user.save();
    res.status(200).json(drinks[drinkIndex]);
  } catch (err) {
    next(err);
  }
});