const { Order } = require("../../models/order");
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .select(" -statusHistory")
      .populate("user", "name,email")
      .sort({ dateOrdered: -1 })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          select: "name",
          populate: {
            path: "category",
            select: "name",
          },
        },
      });
    if (!orders) return res.status(404).json({ message: "No orders found!" });

    return res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
exports.getOrdersCount = async (_, res) => {
  try {
    const count = awaitOrder.countDocuments();
    if (!count)
      return res.status(500).json({ message: "Could not get the order count" });
    return res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.changeOrdersStatus = async (req, res) => {
  try {
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
