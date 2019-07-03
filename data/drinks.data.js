const mongoose = require("mongoose");

module.exports = [
  {
    _v: 0,
    _id: "5d1a1d3eb555a81d301ce7a0",
    name: "Oolong Milk Tea",
    toppings: ["pudding"],
    price: 4.0,
    sugarLevel: 50,
    store: "Koi",
    dateBought: new Date().toISOString(),
    _drinker: "5d1b6ff1a6d71b36ecda492c"
  },
  {
    _id: "5d1a1d3eb555a81d301ce7a1",
    name: "Brown Sugar Milk Tea",
    topping: [null],
    price: 6.0,
    sugarLevel: null,
    store: "Tiger Sugar",
    dateBought: new Date().toISOString()
  },
  {
    _v: 0,
    _id: "5d1a1d3eb555a81d301ce7a2",
    name: "Caramel Macchiato",
    toppings: [null],
    price: 4.0,
    sugarLevel: null,
    store: "Koi",
    dateBought: new Date().toISOString(),
    _drinker: "5d1b6ff1a6d71b36ecda492c"
  },
  {
    _id: "5d1a1d3eb555a81d301ce7a3",
    name: "Earl Grey Milk Tea",
    topping: [null],
    price: 3.5,
    sugarLevel: 70,
    store: "Gong Cha",
    dateBought: new Date().toISOString()
  },
  {
    _id: "5d1a1d3eb555a81d301ce7a4",
    name: "Yakult Green Tea",
    topping: ["White Pearl"],
    price: 4.2,
    sugarLevel: 25,
    store: "Gong Cha",
    dateBought: new Date().toISOString()
  }
];
