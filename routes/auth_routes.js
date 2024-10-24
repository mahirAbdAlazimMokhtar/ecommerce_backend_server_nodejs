const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controller/auth_controller");

const validateUser = [
  body("name").not().isEmpty().withMessage("Name is Required!"),
  body("email").isEmail().withMessage("Please enter a valid email Address!"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least one uppercase, on lowercase . and one symbol."
    ),
  body("phone")
    .isMobilePhone()
    .withMessage("Please enter a valid phone number"),
];

const validatePassword =[ body("newPassword")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .isStrongPassword()
  .withMessage(
    "Password must contain at least one uppercase, on lowercase . and one symbol."
  )];

router.post("/login", authController.login);
router.post("/register", validateUser, authController.register);
router.post("/verify-token", authController.verifyToken);
router.post("/forgot-password", authController.forgetPassword);
router.post("/verify-otp", authController.verifyPasswordResetOtp);
router.post("/reset-password",validatePassword, authController.resetPassword);
module.exports = router;
