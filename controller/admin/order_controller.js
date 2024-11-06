const { Order } = require("../../models/order");
const { OrderItems } = require("../../models/order_items");
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
    const count = await Order.countDocuments();
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
    const orderId = req.params.id;
    const newStatus = req.body.status;
    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found!" });
    if(!order.statusHistory.includes(order.status)){
      order.statusHistory.push(order.status);
    }
    order.status = newStatus;
    await order.save();
    return res.status(200).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ message: "Order not found!" });
    for(const orderItem of order.orderItems){
      await OrderItems.findByIdAndDelete(orderItem);
    }
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
