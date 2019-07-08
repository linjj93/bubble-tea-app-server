require("./db");
const cors = require("cors");
const express = require("express");
const app = express();
const usersRouter = require("./routes/users.route");

app.use(cors());
app.use(express.json());

app.use("/users", usersRouter);

app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({ message: err.message });
  }
  console.log("error", err);
  res.status(500).json({ message: err.message });
});

module.exports = app;
