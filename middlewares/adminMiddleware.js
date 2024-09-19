
const userModel = require("../models/users");
const ErrorHandler = require("../utils/errorHandler");
const asyncHandler = require("express-async-handler")


const onlyAdminAccess = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'super-admin') {
        return next(new ErrorHandler("You are not authorized to access this resource", 403));
    }
    next();
});

module.exports =
{
    onlyAdminAccess
}