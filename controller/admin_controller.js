const { User } = require("../models/user");
const { Order } = require("../models/order");
const { OrderItems } = require("../models/order_items");
const { CartProduct } = require("../models/cart_products");
const { Token } = require("../models/token");
exports.getUserCount = async (_, res) => {
  try {
    const userCount = await User.countDocuments();
    if (!userCount)
      return res.status(500).json({ message: "Could not count users." });
    return res.status(200).json({ userCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not Found!" });
    const orders = await Order.find({ user: userId });
    const orderItemsIds = Order.flatMap(orders, (order) => order.orderItems);
    await Order.deleteMany({ user: userId });
    await OrderItems.deleteMany({ _id: { $in: orderItemsIds } });

    await CartProduct.deleteMany({ _id: { $in: user.cart } });
    await User.findByIdAndUpdate(userId, {
      $pull: { cart: { $exists: true } },
    });
  
    await Token.deleteOne({ userId: userId });
    await User.deleteOne({ _id: userId });
    
    return res.status(204).end();

  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.addCategory = async (req, res) => {};
exports.editCategory = async (req, res) => {};

exports.deleteCategory = async (req, res) => {};

exports.getOrders = async (req, res) => {};
exports.getOrdersCount = async (req, res) => {};

exports.changeOrdersStatus = async (req, res) => {};
exports.getProductsCount = async (req, res) => {};
exports.addProduct = async (req, res) => {};
exports.editProduct = async (req, res) => {};
exports.deleteProductImage = async (req, res) => {};
exports.deleteProduct = async (req, res) => {};
