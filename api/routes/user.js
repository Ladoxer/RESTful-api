const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user) {
        return res.status(409).json({
          message: "Email exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({
                  message: "User created",
                });
              })
              .catch((err) => {
                console.log(err.message);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({
        message: "Auth Failed",
      });
    }
    const isPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isPassword){
      return res.status(401).json({
        message: "Auth Failed",
      });
    }
    const token = jwt.sign({
      email: user.email,
      userId: user._id
    },
    process.env.JWT_KEY,
    {
      expiresIn: "1h"
    }
    );
    return res.status(200).json({
      message: 'Auth successful',
      token: token
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error: error.message,
    });
  }
});

router.delete("/:userId", async (req, res, next) => {
  try {
    await User.deleteOne({ _id: req.params.userId });
    res.status(200).json({
      message: "User deleted",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
