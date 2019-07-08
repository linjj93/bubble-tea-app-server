require("./db");
const cors = require("cors");
const express = require("express");
const app = express();
const usersRouter = require("./routes/users.route");

// app.options("*", cors());

// app.use(
//   cors({
//     origin: "*",
//     credentials: true
//   })
// );

// app.use(cors());
app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use("/users", usersRouter);

app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({ message: err.message });
  }
  console.log("error", err);
  res.status(500).json({ message: err.message });
});

module.exports = app;
