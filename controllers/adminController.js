const User = require('../models/users')
const asyncHandler = require("express-async-handler");
const sendResponse = require('../utils/responseHandler');


// Create admin user by super admin
const createAdmin = asyncHandler(async (req, res, next) => {

    if (req.body.role !== 'super-admin') {
        return next(new ErrorHandler("You are not authorized to perform this action", 403));
    }

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler("Email is already registered", 400));
    }

    const adminUser = new User({
        email,
        password, 
        role: 'admin' 
    });

    await adminUser.save();

    sendResponse(res, 201, true, 'Admin user created successfully', adminUser);

});

module.exports = {
    createAdmin
}