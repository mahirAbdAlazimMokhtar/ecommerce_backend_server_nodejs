const { Review } = require("../models/reviews");
const { User } = require("../models/user");
const { Product } = require("../models/product");
const jwt = require("jsonwebtoken");

exports.leaveReview = async (req, res) => {
  try {
    const user = await User.findById(req.body.user);
    if (!user) return res.status(404).json({ message: "User not found" });
    // add the name of the user with review
    const review = await new Review({
      ...req.body,
      userName: user.name,
    }).save();
    if (!review)
      return res.status(500).json({ message: "Failed to leave review" });
    //get the product to review
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    //refresh the product data (reviews) and save this data
    product.reviews.push(review.id);
    product = await product.save();
    if (!product)
      return res
        .status(500)
        .json({ message: "Internal server error to leave review" });

    return res.status(201).json({ product, review });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.getProductsReviews = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Product not found" });
    }
    const page = req.body.page || 1;
    const pageSize = 10;
    const accessToken = req
      .headers("Authorization")
      .replace("Bearer", "")
      .trim();
    const tokenData = jwt.decode(accessToken);
    const reviews = await Review.find({ _id: { $in: product.reviews } })
      .sort({ date: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const processReviews = [];
    for (const review of reviews) {
      const user = await User.findById(review.user);
      if (!user) {
        processReviews.push(review);
        continue;
      }
      let newReview;
      if (review.userName !== user.name) {
        review.userName = user.name;
        newReview = await review.save();
      }
      processReviews.push(newReview ?? review);
    }

    await session.commitTransaction();
    return res.status(200).json({ reviews: processReviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};
