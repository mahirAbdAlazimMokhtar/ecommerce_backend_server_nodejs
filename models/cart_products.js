const {Schema, model} = require('mongoose');

const cartProductsSchema = new Schema({
     product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
     quantity: { type: Number, default: 1 },
     selectedSize:String,
     selectedColor:String,
     productImage:{type:String,default:true},
     productName:{type:String,default:true},
     productPrice:{type:Number,default:true},
    reservationExpiry:{
        type:Date,
        default:()=> new Date(Date.now() + 60 * 60 * 1000),
    },
    reserved: { type: Boolean, default: Date.now },
});
cartProductsSchema.set('toObject',{virtuals:true});
cartProductsSchema.set('toJSON',{virtuals:true});
exports.CartProducts = model('CartProducts',cartProductsSchema)