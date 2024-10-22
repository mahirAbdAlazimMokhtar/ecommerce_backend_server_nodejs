const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const { Token } = require("../models/token");
const jwt = require("jsonwebtoken");
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
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.forgetPassword = async function (req, res) {};
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
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.verifyPasswordResetOtp = async function (req, res) {};

exports.resetPassword = async function (req, res) {};
