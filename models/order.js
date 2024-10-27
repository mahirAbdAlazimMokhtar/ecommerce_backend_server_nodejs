const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dateOrdered:{type:Date,},
  shippingAddress: { type: String, required: true ,default:Date.now},
  orderItems: [{type:Schema.Types.ObjectId,ref:'OrderItems',required:true}],
  city: { type: String, required: true },
  postcode: String,
  country: { type: String, required: true },
  phone: { type: String, required: true },
  paymentId: String,
  status: {
    type: String,
    default: "Pending",
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "out-for-delivery",
      "Delivered",
      "Cancelled",
      "on-hold",
      "expired",
    ],
  },
  statusHistory: {
    type: [String],
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "out-for-delivery",
      "Delivered",
      "Cancelled",
      "on-hold",
      "expired",
    ],
    required: true,
    default:['Pending'],
  },
  totalPrice:Number,
});
orderSchema.set('toObject',{virtuals:true});
orderSchema.set('toJSON',{virtuals:true});
exports.Order = model("Order", orderSchema);
