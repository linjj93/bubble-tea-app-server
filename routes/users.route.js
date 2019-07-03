require("../models/user.model");
const Joi = require("@hapi/joi");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const UserModel = mongoose.model("user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateUser = require("../middleware/auth");

validateRegistration = user => {
  const schema = {
    username: Joi.string().required(),
    password: Joi.string()
      .required()
      .min(8)
  };
  return Joi.validate(user, schema);
};

validateDrink = drink => {
  const schema = {
    name: Joi.string().required(),
    toppings: Joi.array().items(Joi.string()),
    price: Joi.number().required(),
    sugarLevel: Joi.number().required(),
    store: Joi.string().required(),
    dateBought: Joi.date().required()
  };
  return Joi.validate(drink, schema);
};

router.post("/register", async (req, res, next) => {
  const validation = validateRegistration(req.body);
  if (validation.error) {
    let err = new Error(validation.error.details[0].message);
    err.statusCode = 400;
    return next(err);
  }
  const { username, password } = req.body;

  const userExists = await UserModel.findOne({ username });
  if (userExists) {
    res.status(400).json({ message: "User already exists" });
  } else {
    const saltRound = 10;
    const hash = await bcrypt.hash(password, saltRound);
    const newUser = new UserModel({
      username,
      password: hash,
      drinks: []
    });
    await newUser.save();

    const token = jwt.sign(
      {
        sub: newUser._id,
        iat: new Date().getTime(),
        user: newUser.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );
    res.status(200).json({
      token,
      message: `User ${username} created!`
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await UserModel.findOne({ username });
  if (foundUser === null) {
    return res.status(400).json({ message: "User not found" });
  }
  const isUser = await bcrypt.compare(password, foundUser.password);
  if (isUser) {
    const token = jwt.sign(
      {
        sub: foundUser._id,
        iat: new Date().getTime(),
        user: foundUser.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );
    res.status(200).json({
      _id: foundUser._id,
      username,
      token
    });
  } else {
    res.status(401).json({ message: "Your password is incorrect" });
  }
});

router.get("/:username", authenticateUser, async (req, res, next) => {
  const { username } = req.params;
  const userData = await UserModel.findOne({ username });
  res.status(200).json({ message: `Welcome, ${username}!` });
});

router.get("/:username/drinks", authenticateUser, async (req, res, next) => {
  const { username } = req.params;
  const user = await UserModel.findOne({ username });
  res.status(200).json(user.drinks);
});

router.post("/:username/drinks", authenticateUser, async (req, res, next) => {
  const { username } = req.params;
  const user = await UserModel.findOne({ username });
  const newDrink = req.body;
  user.drinks.push(newDrink);
  res.status(200).json(newDrink);
});

router.delete(
  "/:username/drinks/:id",
  authenticateUser,
  async (req, res, next) => {
    const { username, id } = req.params;
    await UserModel.update({ username });

    const user = await UserModel.findOne({ username });
    let drinks = user.drinks;
    const drinkToDelete = drinks.find(drink => drink._id.toString() === id);
    drinks = drinks.splice(drinks.indexOf(drinkToDelete), 1);

    res.status(200).json(drinkToDelete);
  }
);
module.exports = router;
