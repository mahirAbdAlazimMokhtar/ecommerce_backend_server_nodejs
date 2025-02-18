const { User } = require("../models/user");
/**
 * Fetch all users from the database.
 * @function getUsers
 * @param {express.Request} _ - Express request object (not used)
 * @param {express.Response} res - Express response object
 * @returns {Promise<express.Response>} Promise that resolves to an Express response object
 * @throws {Error} If there is an error finding users in the database
 */
exports.getUsers = async (_, res) => {
  try {
    const users = await User.find().select("name email id isAdmin");
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found!" });
    }
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error in getUsers:", error.message, error.stack);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
/**

/**
 * Fetch a user by ID from the database.
 * @function getUserById
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Promise<express.Response>} Promise that resolves to an Express response object
 * @throws {Error} If there is an error finding the user in the database
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-passwordHash -resetPasswordOtpExpires -resetPasswordOtp -cart"
    );
    if (!user) return res.status(404).json({ message: "User not found!" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getUserById:", error.message, error.stack);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};


/**
 * Update a user in the database by ID.
 * @function updateUser
 * @param {express.Request} req - Express request object containing user ID and updated user data
 * @param {express.Response} res - Express response object
 * @returns {Promise<express.Response>} Promise that resolves to an Express response object
 * @throws {Error} If there is an error updating the user in the database
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true, runValidators: true } // إضافة `runValidators` لضمان صحة البيانات
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.passwordHash = undefined;
    user.cart = undefined;
    return res.json(user);
  } catch (error) {
    console.error("Error in updateUser:", error.message, error.stack);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};


const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // تأكد من استيراد stripe

exports.getPaymentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.paymentCustomerId) {
      return res.status(404).json({
        message: "You do not have a payment profile yet. Complete an order to see your payment profile.",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.paymentCustomerId,
      return_url: process.env.RETURN_URL || "https://dbestech.biz/ecomly",
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Error in getPaymentProfile:", error.message, error.stack);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
