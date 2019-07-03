require("./db");
const authenticateUser = require("./middleware/auth");
const express = require("express");
const app = express();
const drinksRouter = require("./routes/drinks.route");
const usersRouter = require("./routes/users.route");
app.use(express.json());

//public route
app.use("/users", usersRouter);

//private route
// app.use("/drinks", authenticateUser, drinksRouter);
// app.use("/user/drinks", authenticateUser, drinksRouter);

app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({ message: err.message });
  }
  console.log("error", err);
  res.status(500).json({ message: err.message });
});

module.exports = app;
