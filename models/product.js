const { Schema, model } = required("mongoose");

const productSchema = new Schema({
     name: { type: String, required: true },
     image: { type: String, required: true },
     description: { type: String, required: true },
     price: { type: Number, required: true },
     category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
     images: [{ type: String }],
     sizes: [{ type: String }],
     colors: [{ type: String }],
     rating: { type: Number, default: 0 },
     numberOfReviews: { type: Number, default: 0 },
     genderAgeCategory: { type: String, enum: ["men", "women", "unisex", "kids"] },
     countInStock: { type: Number, required: true, min: 0, max: 255 },
     dateAdded: { type: Date, default: Date.now },
     reviews: { type: Schema.Types.ObjectId, ref: "Review" },
});

productSchema.pre("save", async function (next) {
     if (this.reviews.length > 0) {
          await this.populate("reviews");
          const reviews = this.reviews.reduce(
               (acc, review) => acc + review.rating,
               (acc, review) => acc + review.rating,
               0
          );

          this.rating = totalRating / this.reviews.length;
          this.rating = parseFloat((totalRating / this.reviews.length).toFixed(1));
          this.numberOfReviews = this.reviews.length;
     }

     next();
});


// productSchema.virtual('productInitials').get(function () {
//      return this.firstBit + this.secondBit ;
// });

productSchema.index({name:'text',description:'text'});
productSchema.set('toObject',{virtuals:true});
productSchema.set('toJSON',{virtuals:true});

exports.Product = model("Product", productSchema);
