const express = require('express');
const router = express.Router();
const orderController = require('../controller/orders_controller');

router.get('/users/:userId', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
