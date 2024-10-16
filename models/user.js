const { Schema, Model, model } = require("mongoose");

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, require: true, trim: true },
  passwordHash: { type: String, required: true },
  street: String,
  apartment: String,
  postalCode: String,
  country: String,
  phone: { type: String, required: true, trim: true },
  isAdmin: { type: Boolean, default: false },
  resetPasswordOtp: Number,
  resetPasswordOtpExpires: Date,
  wishlist: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String, required: true },
      productPrice: { type: Number, required: true },
      productImage: { type: String, required: true },
      ///This For Create RelationShip Between To Models in Mongoose
    },
  ],
});
//How To Make Email Unique ?
userSchema.index({email:1},{unique:true});
exports.User = model('User',userSchema);
