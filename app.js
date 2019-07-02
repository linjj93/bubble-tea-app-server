require("./db");
const express = require("express");
const app = express();
const drinksRouter = require("./routes/drinks.route");
app.use(express.json());
app.use("/drinks", drinksRouter);
app.get("/", (req, res, next) => {
  res.status(200).json("Hello World!");
});

app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({ message: err.message });
  }
  console.log("error", err);
  res.sendStatus(500);
});

module.exports = app;
