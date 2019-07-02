require("../models/drink.model");
const Joi = require("@hapi/joi");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const DrinkModel = mongoose.model("drink");

validateDrink = drink => {
  const schema = {
    id: Joi.number()
      .integer()
      .required(),
    name: Joi.string().required(),
    topping: Joi.array().items(Joi.string()),
    price: Joi.number().required(),
    sugarLevel: Joi.number().required(),
    store: Joi.string().required(),
    dateBought: Joi.date().required()
  };
  return Joi.validate(drink, schema);
};

router.get("/", async (req, res, next) => {
  const drinks = await DrinkModel.find().catch(err => next(err));
  res.status(200).json(drinks);
});

router.post("/", async (req, res, next) => {
  const validation = validateDrink(req.body);
  if (validation.error) {
    let err = new Error(validation.error.details[0].message);
    err.statusCode = 400;
    return next(err);
  }
  try {
    const newDrink = new DrinkModel(req.body);
    await newDrink.save();
    res.status(200).json(newDrink);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  const deletedDrink = await DrinkModel.findOne({ id }).catch(err => next(err));
  if (deletedDrink === null) {
    res.status(400).json(`Drink with id ${id} does not exist`);
  }
  await DrinkModel.deleteOne({ id });
  res.status(200).json(deletedDrink);
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await DrinkModel.findOneAndUpdate({ id }, req.body);
    const updatedDrink = await DrinkModel.findOne({ id });
    res.status(200).json(updatedDrink);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
