const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
  User.findOne({email: req.body.email}).exec()
  .then(user => {
    if(user){
      return res.status(409).json({
        message: 'Email exists'
      })
    }else{
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
          .then(result => {
            console.log(result);
            res.status(201).json({
              message: 'User created'
            });
          })
          .catch(err => {
            console.log(err.message);
            res.status(500).json({
              error:err
            })
          });
        }
      });
    }
  })
});

router.delete('/:userId', async(req, res, next) => {
  try {
    await User.deleteOne({_id:req.params.userId});
    res.status(200).json({
      message: 'User deleted'
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error:error.message
    })
  }
})

module.exports = router;
