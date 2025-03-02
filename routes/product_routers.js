const express = require("express");
const router = express.Router();
const productsController = require("../controller/product_controller");
const reviewController = require("../controller/reviews_controller");

router.get("/",productsController.getProducts);
//search product
router.get("/search",productsController.searchProduct);
router.get("/:id",productsController.getProductById);
//reviews
router.post("/:id/reviews",reviewController.leaveReview);
router.get("/:id/reviews",reviewController.getProductsReviews);

module.exports = router;