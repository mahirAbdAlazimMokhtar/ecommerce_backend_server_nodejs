const {User} = require("../../models/user");
const { Order } = require("../../models/order");
const { OrderItems } = require("../../models/order_items");
const { CartProduct } = require("../../models/cart_products");
const { Token } = require("../../models/token");
exports.getUserCount = async (_, res) => {
  try {
    const userCount = await User.countDocuments();
    return res.status(200).json({ userCount });
  } catch (error) {
    console.error("Error in getUserCount:", error.message, error.stack);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // البحث عن المستخدم
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    // جلب الطلبات للمستخدم
    const orders = await Order.find({ user: userId });
    const orderItemsIds = orders.flatMap(order => order.orderItems);

    // حذف الطلبات وعناصر الطلبات
    await Order.deleteMany({ user: userId });
    if (orderItemsIds.length) {
      await OrderItems.deleteMany({ _id: { $in: orderItemsIds } });
    }

    // حذف المنتجات من السلة
    if (user.cart?.length) {
      await CartProduct.deleteMany({ _id: { $in: user.cart } });
    }

    // حذف التوكنات المرتبطة بالمستخدم
    await Token.deleteOne({ userId });

    // حذف المستخدم نهائيًا
    await User.deleteOne({ _id: userId });

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error in deleteUser:", error.message, error.stack);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
