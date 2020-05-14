const express = require("express");
const jsonwebToken = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const router = express.Router();

// const auth = require("../middleware/auth");

const User = require("../models/User");

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /* 
      On the client side check if there is an erorr
      by checking for status code 401 (Unauthorized)
    */
    res.json({
      message: "you are login",
      data: {
        user: req.user,
      },
    });
  }
);

router.post("/login", async (req, res) => {
  const { password, email } = req.body;
  // 1. check if user enter passwrd and email
  if (!email || !password) {
    return res.status(300).send({
      message: "Please enter a email and password",
    });
  }

  const user = await User.findOne({ email }).select("password");

  if (!user) {
    return res.status(300).send({
      message: "No user exist with this account",
    });
  }

  // 2. check password is correct
  bcrypt
    .compare(password, user.password)
    .then((isMatch) => {
      if (!isMatch) {
        return res.status(300).send({
          message: "Make sure your password is  correct",
        });
      }
      // 3. create jwt
      const token = jsonwebToken.sign({ id: user._id }, process.env.JWTSECRET);
      // 4. send jwt and client (react, vue) should save it somewhere to reuse when making request
      return res.status(200).send({
        message: "You are login",
        data: {
          token,
        },
      });
    })
    .catch((err) => {
      return res.status(300).send({
        message: "Make sure your password and username are correct",
      });
    });
});

router.post("/signup", async (req, res) => {
  const { email, name, password } = req.body;

  // 1. check if user exist
  const userExist = await User.find({ email });

  // 2. check for email and password in red.body
  if (userExist.length > 0) {
    return res.status(404).send({
      message: "User already exist",
    });
  }

  if (!email || !name || !password) {
    return res.status(300).send({
      message: "Please enter a email, name and password",
    });
  }

  // 3.
  const newUser = await new User({ name, email, password });

  newUser.save();

  // create token
  // when we create the user we send the tooken
  let token = jsonwebToken.sign({ id: newUser._id }, process.env.JWTSECRET);

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
