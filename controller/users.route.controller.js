require("../models/user.model");
require("../db");

const Joi = require("@hapi/joi");

const mongoose = require("mongoose");
const UserModel = mongoose.model("user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

validateRegistration = user => {
  const schema = {
    username: Joi.string()
      .alphanum()
      .required(),
    password: Joi.string()
      .required()
      .min(8),
    passwordCfm: Joi.string().allow("")
  };
  return Joi.validate(user, schema);
};

validateDrink = drink => {
  const schema = {
    _id: Joi.string(),
    drink: Joi.string().required(),
    toppings: Joi.array().items(Joi.string()),
    price: Joi.number().required(),
    sugarLevel: Joi.number()
      .min(0)
      .max(100)
      .required(),
    store: Joi.string().required(),
    dateBought: Joi.date().required()
  };
  return Joi.validate(drink, schema);
};

registerUser = async (req, res, next) => {
  const { username, password, passwordCfm } = req.body;
  const validation = validateRegistration(req.body);
  if (validation.error) {
    return res
      .status(400)
      .json({ message: validation.error.details[0].message });
  }
  if (password !== passwordCfm) {
    return res.status(400).json({
      message: "Password confirmation must be the same as password"
    });
  }

  const userExists = await UserModel.findOne({ username });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
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
      token
    });
  }
};

userLogin = async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await UserModel.findOne({
    username: username.trim()
  });
  if (foundUser === null) {
    return res.status(401).json({ message: "Invalid credentials" });
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
      username: username.trim(),
      token
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

userLogout = async (req, res) => {
  res.sendStatus(200);
};

accessDashboard = async (req, res, next) => {
  const { username } = req.params;
  const userData = await UserModel.findOne({ username }).catch(err =>
    next(err)
  );

  res.status(200).json({ message: `Welcome, ${username}!`, username });
};

populateDrinks = async (req, res, next) => {
  const { username } = req.params;
  const user = await UserModel.findOne({ username }).catch(err => next(err));
  res.status(200).json({ drinks: user.drinks });
};

addDrink = async (req, res, next) => {
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
    console.log("error");
    return res.status(400).json({ message: err.message });
  }
};

deleteDrink = async (req, res, next) => {
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
};

updateDrink = async (req, res, next) => {
  const { username, id } = req.params;
  const updatedDrink = req.body;

  try {
    const user = await UserModel.findOne({ username });
    const drinks = user.drinks;
    const drinkIndex = drinks.findIndex(drink => drink._id.toString() === id);

    if (drinks[drinkIndex] === undefined) {
      return res.status(404).json({ message: "No such drink exists." });
    }
    const drinkToUpdate = drinks[drinkIndex];

    for (let field in updatedDrink) {
      drinkToUpdate[field] = updatedDrink[field];
    }

    await user.save();
    res
      .status(200)
      .json({ updatedDrink: drinkToUpdate, drinksAfterUpdate: drinks });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  userLogin,
  userLogout,
  accessDashboard,
  populateDrinks,
  addDrink,
  deleteDrink,
  updateDrink
};
