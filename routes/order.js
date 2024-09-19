const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const {isAuthenticatedUser} = require('../middlewares/auth');
const { checkPermission } = require("../middlewares/checkPermissions");

router.post("/createOrder",isAuthenticatedUser,checkPermission, orderController.createOrder);
router.get("/allOrders",isAuthenticatedUser,checkPermission, orderController.allOrders);
router.put("/updatestatus/:_orderId",isAuthenticatedUser,checkPermission, orderController.updateStatus);

module.exports = router;
