const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categories_controller');

router.get('/',categoryController.getCategories);
router.get('/:id',categoryController.getCategoryById);

module.exports = router;
