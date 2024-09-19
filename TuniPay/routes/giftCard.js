const express = require("express");
const router = express.Router();
const giftCardController = require("../controllers/giftCardController");
const { isAuthenticatedUser } = require("../middlewares/auth")
const {checkPermission} = require('../middlewares/checkPermissions')

router.post("/createCardOrder",isAuthenticatedUser,checkPermission,giftCardController.createCardOrder);
router.get("/allCardHolders",isAuthenticatedUser,checkPermission,giftCardController.allCardHolders);
router.get("/cardUser/:userId",isAuthenticatedUser,checkPermission,giftCardController.cardUser);

module.exports = router;
