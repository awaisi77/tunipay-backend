const userModel = require("../models/users");
const ErrorHandler = require("../utils/errorHandler");
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");


exports.isAuthenticatedUser = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer")) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.TOKEN_SECRET);
        req.user = await userModel.findById(decoded.id);
        next();
    } catch (error) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }
});

