const { User } = require("../models/user");
const { Product } = require("../models/product");
const {default: mongoose} = require('mongoose');

exports.getUserWishlist = async function (req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wishlist = [];
    for (const wishProduct of user.wishlist) {
      const product = await Product.findById(wishProduct.productId);
      if (!product) {
        wishlist.push({
          ...wishProduct,
          productExists: false,
          productOutOfStock: false,
        });
      } else if (product.countInStock < 1) {
        wishlist.push({
          ...wishProduct,
          productExists: true,
          productOutOfStock: true,
        });
      } else {
        wishlist.push({
          productId: product._id,
          productImage: product.image,
          productPrice: product.price,
          productName: product.name,
          productExists: true,
          productOutOfStock: false,
        });
      }
    }
    return res.json(wishlist);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.addProductToWishlist = async function (req, res) {
  try {
    console.log("Received request to add to wishlist");
    console.log("User ID:", req.params.id);
    console.log("Request Body:", req.body);

    if (!req.params.id || !req.body.productId) {
      return res.status(400).json({ message: "User ID and Product ID are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productAlreadyExists = user.wishlist.find((item) =>
      item.productId.toString() === req.body.productId
    );

    if (productAlreadyExists) {
      return res.status(409).json({ message: "Product already exists in wishlist" });
    }

    user.wishlist.push({
      productId: req.body.productId,
      productImage: product.image,
      productPrice: product.price,
      productName: product.name,
    });

    await user.save();
    return res.status(200).json({ message: "Product added successfully", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteProductFromWishlist = async function (req, res) {
  try {
    const userId = req.params.id;
    const productId = req.params.productId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.wishlist.findIndex((item) =>
      item.productId.equals(new mongoose.Schema.Types.ObjectId(productId))
    );

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }
    user.wishlist.splice(index, 1);

    await user.save();
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
