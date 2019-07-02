const jwt = require("jsonwebtoken");
require("../models/user.model");
const mongoose = require("mongoose");
const UserModel = mongoose.model("user");

authenticate = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.sendStatus(401);
  }
  const token = req.headers.authorization.split(" ")[1];
  let foundUser;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    foundUser = await UserModel.findOne({
      _id: decoded.sub
    });
    req.user = foundUser;

    next();
  } catch (err) {
    if (err.message === "invalid signature") {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

module.exports = authenticate;
