const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");

const userRoutes = require("./routes/users");

const PORT = process.env.PORT || 3000;

const app = express();

// Dev middleware
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  const morgan = require("morgan");

  app.use(morgan("dev"));
}

// connect to db
const DB = process.env.MONGO_URI;

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
//  passport
require("./middleware/passportAuth");
app.use(passport.initialize());
app.use(cors());
// middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use("/users", userRoutes);
// server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log("Im on port ", PORT);
});
