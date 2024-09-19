const express = require("express");
const { isAuthenticatedUser } = require("../middlewares/auth")
const router = express.Router();
const {
  getProductsByName,
  getProductsById,
  getProductsShippingDetails,
} = require("../controllers/aliExpress");

router.get("/searchProductsByName/:productName",getProductsByName);
router.get("/searchProductsById/:productId",getProductsById);

module.exports = router;
