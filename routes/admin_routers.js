const express = require('express');
const router = express.Router();

const adminController = require('../controller/admin_controller');
// Users
router.get('/users/count',adminController.getUserCount);
router.delete('/users/:id',adminController.deleteUser);

//Categories
router.post('/categories',adminController.addCategory);
router.put('/categories/:id',adminController.editCategory)
router.delete('/categories/:id',adminController.deleteCategory)

//products
router.get('/products/count',adminController.getProductCount);
router.post('/products',adminController.addProduct);
router.put('/products/:id',adminController.editProduct);
router.delete('/products/:id/images',adminController.deleteProductImages);
router.delete('/products/:id',adminController.deleteProduct);

//orders
router.get('/orders',adminController.getOrders);
router.get('/orders/count',adminController.getOrdersCount);
router.put('/orders/:id',adminController.changeOrderStatus);

module.exports = router;