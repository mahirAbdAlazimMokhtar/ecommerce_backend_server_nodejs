const bcrypt = require('bcryptjs');
const { validationResult } = require("express-validator");
const {User}= require('../models/user');
exports.register = async function (req, res) {
  //validate the user
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const errorMessages = errors.array().map((error)=>({
        field:error.path,
        message:error.msg,
    }));
    return res.status(400).json({errors:errorMessages});
  }
  try {
    let user = new User({
        ...req.body,
        passwordHash:  bcrypt.hashSync(req.body.password, 8),
    });
    user = await user.save();
    if(!user){
        res.status(500).json({
            type:"Internal Server Error",
            message:"Could not create a new user"
        });
    }
    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    if(error.message.includes('email_1 dup key')){
        return res.status(409).json({
            type:"AuthError",
            message:'User with that email already exists'
        });
    }
    return res.status(500).json({ type:error.name,message: error.message });
  }
  //we don't need to check the email is exists bec we have a unique condition in model
};

exports.login = async function (req, res) {
  return res.status(201).json({ name: "paul", age: 200 });
};

exports.forgetPassword = async function (req, res) {};

exports.verifyPasswordResetOtp = async function (req, res) {};

exports.resetPassword = async function (req, res) {};
