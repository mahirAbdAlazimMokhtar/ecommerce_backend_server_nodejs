const { Schema, model } = require("mongoose");

const orderItemsSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
  selectedSize:String,
  selectedColor:String,
  productImage:{type:String,default:true},
  productName:{type:String,default:true},
  productPrice:{type:Number,default:true},
});
orderItemsSchema.set('toObject',{virtuals:true});
orderItemsSchema.set('toJSON',{virtuals:true});
exports.OrderItems = model("OrderItems", orderItemsSchema);
