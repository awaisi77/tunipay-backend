const express = require("express")
const router = express.Router()
const sheinController = require("../controllers/shein")
const { isAuthenticatedUser } = require("../middlewares/auth")


router.get("/searchSheinProduct/:productName", sheinController.searchSheinProduct)
router.get("/searchSheinProductById/:productId", sheinController.searchSheinProductById)


module.exports = router



