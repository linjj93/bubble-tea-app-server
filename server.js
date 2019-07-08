const app = require("./app");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Application started server on port ${port}!`);
});
