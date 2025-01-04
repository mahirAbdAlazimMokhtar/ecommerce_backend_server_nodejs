const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const { Token } = require("../models/token");
const jwt = require("jsonwebtoken");
const mailSender = require("../helpers/email_senders");
exports.register = async function (req, res) {
  //validate the user
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }
  try {
    let user = new User({
      ...req.body,
      passwordHash: bcrypt.hashSync(req.body.password, 8),
    });
    user = await user.save();
    if (!user) {
      res.status(500).json({
        type: "Internal Server Error",
        message: "Could not create a new user",
      });
    }
    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    if (error.message.includes("email_1 dup key")) {
      return res.status(409).json({
        type: "AuthError",
        message: "User with that email already exists",
      });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
  //we don't need to check the email is exists bec we have a unique condition in model
};

exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    //undefended => user not exist or not found.
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found\n Check your email and try again" });
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ message: "Incorrect Password!" });
    }
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    const refreshTokenToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "60d" }
    );
    const token = await Token.findOne({ userId: user.id });
    if (token) await token.deleteOne();
    await new Token({
      userId: user.id,
      refreshToken: refreshTokenToken,
      accessToken: accessToken,
    }).save();
    user.passwordHash = undefined;
    return res
      .status(200)
      .json({ ...user.doc, accessToken, refreshTokenToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.forgotPassword = async function (req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with that email does NOT exist!' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 600000;

    await user.save();

    const response = await mailSender.sendMail(
      email,
      'Password Reset OTP',
      `Your OTP for password reset is: ${otp}`
    );
    return res.json({ message: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
//verify token
exports.verifyToken = async function (req, res) {
  try {
    let accessToken = req.headers.authorization;
    if (!accessToken) return res.json(false);
    accessToken = accessToken.replace("Bearer", "").trim();

    const token = await Token.findOne({ accessToken });
    if (!token) return res.json(false);

    const tokenData = jwt.decode(token.refreshToken);

    const user = await User.findById(token.id);

    if (!user) return res.json(false);

    const isValid = jwt.verify(
      token.refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!isValid) return res.json(false);

    return res.json(true);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.verifyPasswordResetOtp = async function (req, res) {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User with that email does NOT exists!" });

    if (
      user.resetPasswordOtp !== +otp ||
      Date.now() > user.resetPasswordOtpExpires
    ) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    user.resetPasswordOtp = 1;
    user.resetPasswordOtpExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Password Reset OTP verified" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.resetPassword = async function (req, res) {
 
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      }));
      return res.status(400).json({ errors: errorMessages });
    }
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User with that email does NOT exists!" });
    if (user.resetPasswordOtp !== 1) {
      return res
        .status(401)
        .json({ message: "Confirm OTP before resetting password" });
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 8);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Password Reset Successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
