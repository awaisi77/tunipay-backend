const express = require("express")
const { registerUser, verifyEmail, loginUser, requestNewVerificationEmail, refreshToken, forgotPassword, resetPassword } = require("../controllers/authController")
const router = express.Router()


router.route("/register").post(registerUser)
router.route('/verify-email/:token').get(verifyEmail)
router.route('/login').post(loginUser)
router.route('/request-new-verification-email').post(requestNewVerificationEmail)

router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)


module.exports = router
