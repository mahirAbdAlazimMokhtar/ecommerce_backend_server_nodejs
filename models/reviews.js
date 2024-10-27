const { Schema, model } = require("mongoose");

const reviewSchema = new Schema({
     user: { type: Schema.Types.ObjectId, ref: "User", required: true },
     //product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
     rating: { type: Number, required: true },
     comment: { type: String, required: true },
     userName:{type:String,required:true},
     date: { type: Date, default: Date.now },
});

reviewSchema.set('toObject',{virtuals:true});
reviewSchema.set('toJSON',{virtuals:true});
exports.Review = model("Review", reviewSchema)