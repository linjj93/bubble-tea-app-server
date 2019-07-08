const app = require("./app");
require("dotenv").config({ silent: process.env.NODE_ENV === "production" });
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Application started server on port ${port}!`);
});
