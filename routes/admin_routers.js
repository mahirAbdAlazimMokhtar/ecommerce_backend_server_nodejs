const express = require("express");
const router = express.Router();

const usersController = require('../controller/admin/user_controller');
const categoriesController = require('../controller/admin/categories_controller');
const productsController = require('../controller/admin/product_controller');
const ordersController = require('../controller/admin/order_controller');
// Users
router.get('/users/count',usersController.getUserCount);
router.delete('/users/:id',usersController.deleteUser);

//Categories
router.post('/categories',categoriesController.addCategory);
router.put('/categories/:id',categoriesController.editCategory)
router.delete('/categories/:id',categoriesController.deleteCategory)

//products
router.get('/products/count',productsController.getProductsCount);
router.post('/products',productsController.addProduct);
router.put('/products/:id',productsController.editProduct);
router.delete('/products/:id/images',productsController.deleteProductImage);
router.delete('/products/:id',productsController.deleteProduct);

//orders
router.get('/orders',ordersController.getOrders);
router.get('/orders/count',ordersController.getOrdersCount);
router.put('/orders/:id',ordersController.changeOrdersStatus);
router.delete('/orders/:id',ordersController.deleteOrder);

module.exports = router;