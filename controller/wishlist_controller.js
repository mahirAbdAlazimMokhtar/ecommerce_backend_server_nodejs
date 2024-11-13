const { User } = require("../model/user");
const { Product } = require("../model/product");

exports.getUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const wishlist = [];
    for (const wishProductId of user.wishlist) {
      const product = await Product.findById(wishProductId.productId);
      if (product) {
        wishlist.push({
          ...wishProductId,
          productExists: false,
          productOutOfStock: false,
        });
      } else if (product.countInStock < 0) {
        wishlist.push({
          ...wishProductId,
          productExists: true,
          productOutOfStock: true,
        });
      }else {
          wishlist.push({
           productId:product._id,
           productImage:product.image,
           productName:product.name,
           productPrice:product.price,
           productExists: true,
           productOutOfStock: false
          });
      }
      return res.status(200).json({ wishlist });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.addProductToWishlist = async (req, res) => {
  try {
     const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existingProduct = user.wishlist.find((item)=>
     item.productId.equals(new mongoose.Schema.Types.ObjectId(req.body.productId))
    );

    if (existingProduct) {
      return res.status(409).json({ message: "Product already exists in wishlist" });
    }

    user.wishlist.push({
      productId: req.body.productId,
      productImage: product.image,
      productName: product.name,
      productPrice: product.price,
    });

    await user.save();
    return res.status(201).json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.deleteProductFromWishlist = async (req, res) => {
  try {
     const userId = req.params.id;
     const productId = req.params.productId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const index = user.wishlist.findIndex(
      (item) => item.productId.equals(new mongoose.Schema.Types.ObjectId(productId))
    );

    if (index === -1) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    user.wishlist.splice(index, 1);
    await user.save();
    return res.status(204).json({ message: "Product removed from wishlist" });
    
    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const existingProduct = user.wishlist.find((item)=>
     item.productId.equals(new mongoose.Schema.Types.ObjectId(req.body.productId))
    );
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }
    user.wishlist = user.wishlist.filter((item) => !item.productId.equals(existingProduct.productId));
    await user.save();
    return res.status(204).json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
