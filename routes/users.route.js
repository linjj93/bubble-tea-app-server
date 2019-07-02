require("../models/user.model");
const Joi = require("@hapi/joi");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const UserModel = mongoose.model("user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

validateRegistration = user => {
  const schema = {
    username: Joi.string().required(),
    password: Joi.string()
      .required()
      .min(8),
    drinks: Joi.array().items(Joi.string())
  };
  return Joi.validate(user, schema);
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
      password: hash
    });
    await newUser.save();

    const token = jwt.sign(
      {
        sub: newUser.id,
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
      username,
      token
    });
  } else {
    res.status(401).json({ message: "Your password is incorrect" });
  }
});

module.exports = router;
