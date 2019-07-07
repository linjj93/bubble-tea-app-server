const mongoose = require("mongoose");

const dbURI =
  "mongodb://jinjia:psd270718pmo@ds347367.mlab.com:47367/heroku_0s93gqpp";
// ||
// global.__MONGO_URI__ ||
// "mongodb://localhost:27017/bbtapp";

mongoose.connect(dbURI, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  user: process.env.MONGODB_USERNAME,
  pass: process.env.MONGODB_PASSWORD
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  console.log("MongoDB connected");
});
