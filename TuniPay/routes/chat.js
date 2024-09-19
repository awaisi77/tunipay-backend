const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { checkPermission } = require("../middlewares/checkPermissions");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.post("/chat", isAuthenticatedUser, chatController.saveChat);
router.get("/getChat", isAuthenticatedUser, chatController.getChat);
router.get("/getAllChats", isAuthenticatedUser,checkPermission, chatController.allChats);

module.exports = router;
