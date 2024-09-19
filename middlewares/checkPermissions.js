const asyncHandler = require("express-async-handler");
const ErrorHandler = require("../utils/errorHandler");

const checkPermission = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    return next(
      new ErrorHandler("You are not allowed to  access this route", 400)
    );
  }

  return next();

  //     if(req.user.role != 'super-admin'){
  //         const routerPermission = await helper.getRouterPermission(req.path, req.user.role)
  //         const userPermissions = await helper.getUserPermissions(req.user._id)

  //         // console.log("router permissions", routerPermission)
  //         // console.log("++++ user permissions ++++", userPermissions.permissions.permissions)

  //         if( userPermissions.permissions.permission == undefined || !routerPermission){
  //             return next(new ErrorHandler("You are not allowed to  access this route", 400))
  //         }

  //         const permission_name = routerPermission.permission_id.permission_name
  //         const permission_value = routerPermission.permission

  //     //  console.log("++++ user permissions ++++", userPermissions.permissions.permission)

  //       const hasPermission = Object.keys(userPermissions.permissions.permission.some(permission => {
  //             permission.permission_name == permission_name &&
  //             permission.permission_value.some(value => {
  //                 permission_value.includes(value)
  //             })
  //         }))
  //         // console.log("++++ has permissions ++++",hasPermission)

  //         if(!hasPermission){
  //             return next(new ErrorHandler("You are not allowed to access this route", 400))
  //         }

  //     }
  //     return next();
});

module.exports = {
  checkPermission,
};
