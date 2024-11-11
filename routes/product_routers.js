const express = require("express");
const router = express.Router();
const productsController = require("../controller/product_controller");
const reviewController = require("../controller/reviews_controller");

router.get("/",productsController.getProducts);
//search product
router.get("/search",productsController.searchProduct);
router.get("/:id",productsController.getProductById);
//reviews
router.get("/:id/reviews",reviewController.leaveReview);
router.post("/:id/reviews",reviewController.getProductsReviews);

module.exports = router;