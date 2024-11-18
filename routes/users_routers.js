const express = require ('express');
const router = express.Router();

const userController = require('../controller/users_controller');
const wishlistController = require('../controller/wishlist_controller');
const cartController = require('../controller/cart_controller');

router.get('/',userController.getUsers);
router.get('/:id',userController.getUserById);
router.get('/:id/paymentProfile',userController.getPaymentProfile);
router.put('/:id',userController.updateUser);

//Wishlist
router.get('/:id/wishlist',wishlistController.getUserWishlist);
router.post('/:id/wishlist',wishlistController.addProductToWishlist);
router.delete('/:id/wishlist/:productId',wishlistController.deleteProductFromWishlist);

//Cart 
router.get('/:id/cart',cartController.getUserCart);
router.post('/:id/cart/count',cartController.getUserCartCount);
router.post('/:id/cart/:cartProductId',cartController.getCartProductById);
router.post('/:id/cart',cartController.addProductToCart);
router.put('/:id/cart/:cartProductId',cartController.updateProductQuantityInCart);
router.delete('/:id/cart/:carProductId',cartController.deleteProductFromCart);


module.exports = router;