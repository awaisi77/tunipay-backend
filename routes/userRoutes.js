const express = require("express")
const { profile, createUser, getUsers, updateUser, updatePassword, updateProfile } = require("../controllers/userController")
const router = express.Router()
const { isAuthenticatedUser } = require("../middlewares/auth");
const { checkPermission } = require("../middlewares/checkPermissions");


//create usesrs with roles
router.route("/create-user").post(isAuthenticatedUser,checkPermission, createUser)


//get all users except logged in
router.route("/get-users").get(isAuthenticatedUser, getUsers)

//update user
router.route("/update-user").post(isAuthenticatedUser,checkPermission, updateUser)


//me
router.route("/profile").get(isAuthenticatedUser, profile)
router.route("/password/update").put(isAuthenticatedUser, updatePassword)
router.route("/me/update").put(isAuthenticatedUser, updateProfile)

module.exports = router
