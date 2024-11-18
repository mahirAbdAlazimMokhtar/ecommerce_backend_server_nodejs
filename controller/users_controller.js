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
  //Fetch The Data Form The Data Base
  try {
    const users = await User.find().select("name email id isAdmin");
    if (!users) return res.status(404).json({ message: "Users not Found !" });
    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

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
      "-passwordHash -resetPasswordOtpExpires -resetPasswordOtp - cart"
    );
    if (!user) return res.status(404).json({ message: "User not Found !" });
    user.passwordHash = undefined;
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
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
      { new: true }
    );
    if (!user) return res.status(404).
    json({ message: "User not found" });
    user.passwordHash = undefined;
    user.cart = undefined;
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.getPaymentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    } else if (!user.paymentCustomerId) {
      return res.status(404).json({
        message:
          'You do not have a payment profile yet. Complete an order to see your payment profile.',
      });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: user.paymentCustomerId,
      return_url: 'https://dbestech.biz/ecomly',
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};