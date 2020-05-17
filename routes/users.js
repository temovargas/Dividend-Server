const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const router = express.Router();

const { createToken } = require("../helper/index");
// const auth = require("../middleware/auth");

const User = require("../models/User");

router.get("/profile", (req, res, next) => {
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send({ message: "Make sure you are signed in" });
    }
    return res.json({
      message: "you are loged in",
      data: {
        user,
      },
    });
  })(req, res, next);
});

router.post("/login", async (req, res, next) => {
  const { password, email } = req.body;
  // 1. check if user enter passwrd and email
  if (!email || !password) {
    return next(
      createError(401, "Make sure you enter a correct email and password.")
    );
  }

  const user = await User.findOne({ email }).select("password");

  if (!user) {
    return next(createError(401, "No user exist with this account."));
  }

  // 2. check password is correct
  bcrypt
    .compare(password, user.password)
    .then((isMatch) => {
      if (!isMatch) {
        return next(createError(401, "Passwords don't match."));
      }
      // 3. create jwt
      const token = createToken({ id: user._id });

      // 4. send jwt and client (react, vue) should save it somewhere to reuse when making request
      return res.status(200).send({
        message: "You are login",
        data: {
          token,
        },
      });
    })
    .catch((err) => {
      return next(createError(401, "Please enter a password."));
    });
});

router.post("/signup", async (req, res, next) => {
  const { email, name, password } = req.body;

  // 1. check if user exist
  const userExist = await User.findOne({ email });

  // 2. check for email and password in red.body
  if (userExist) {
    return next(createError(401, "User already exist."));
  }

  if (!email || !name || !password) {
    return next(createError(401, "Please enter a email, name, and password."));
  }

  // 3.
  const newUser = await new User({ name, email, password });

  newUser.save();

  // create token
  // when we create the user we send the tooken
  const token = createToken({ id: newUser._id });

  return res.json({
    message: "user has been created",
    data: {
      token: token,
    },
  });
});

// router.post("/logout", async (req, res) => {
//   /*
//   since this is an api I store the token on local storage
//   and send it in the authentication header.

//   ---- when a use logs out
//   1) Do I just remove the token from local storage (easiest)
//   2) Do I create a blacklist of tokens that should not be used again?
//     -- also remove it from local storage
//     -- also if I added it to the list how do I check if the token has expired already
//   */
// });

module.exports = router;
