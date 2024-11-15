const { User } = require("../models/user");
const { CartProduct } = require("../models/cart_products");
const { Product } = require("../models/product");
exports.getUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartProducts = await CartProduct.find({ _id: { $in: user.cart } });
    if (!cartProducts)
      return res.status(404).json({ message: "Cart not found" });

    const cart = [];
    for (const cartProduct of cartProducts) {
      const product = await Product.findById(cartProduct.product);
      if (!product) {
        cart.push({
          ...cartProduct._doc,
          productExists: false,
          productOutOfStock: false,
        });
      } else {
        cartProduct.productName = product.name;
        cartProduct.productPrice = product.price;
        cartProduct.productImage = product.image;
        if (product.countInStock < cartProduct.quantity) {
          cart.push({
            ...cartProduct._doc,
            productExists: true,
            productOutOfStock: true,
          });
        } else {
          cart.push({
            ...cartProduct._doc,
            productExists: true,
            productOutOfStock: false,
          });
        }
      }
      return res.json(cart);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.getUserCartCount = async (req, res) => {
     try {
          const user = await User.findById(req.params.id);
          if (!user) return res.status(404).json({ message: "User not found"});
          return res.json(user.cart.length);
     } catch (error) {
          console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    }); 
     }
};
exports.getCartProductById = async (req, res) => {};
exports.addProductToCart = async (req, res) => {};
exports.updateProductQuantityInCart = async (req, res) => {};
exports.deleteProductFromCart = async (req, res) => {};
