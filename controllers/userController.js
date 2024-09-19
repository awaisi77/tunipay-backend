const asyncHandler = require("express-async-handler")
const userModel = require('../models/users');
const sendEmail = require('../utils/sendEmail');
const ErrorHandler = require('../utils/errorHandler');
const { default: mongoose } = require("mongoose");
const sendResponse = require("../utils/responseHandler");
const addressModel = require('../models/address');


// Get User Detail (profile)
const profile = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user.id);
    //check user exists
    if (!user) {
        return next(new ErrorHandler("user not found..", 404))
    }
    sendResponse(res, 200, true, `profile info fetched`, user);  
});

// Route to create a new user by admin
const createUser = asyncHandler(async (req, res, next) => {
    const { username, email, role, phoneNo, address } = req.body;

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler('User with this email already exists', 400));
    }

    // Determine the role for the new user
    let userRole = 'user';
    if (role) {
        if (role.toLowerCase() === 'super-admin') {
            return next(new ErrorHandler('You cannot create super-admin', 400));
        }
        userRole = role;
    }

    // Generate a random password for the new user
    const password = generateRandomPassword();

    // Create a new address for the user
    const newAddress = await addressModel.create({
        address,
        phoneNo
    });

    // Create the new user
    const newUser = await userModel.create({
        username,
        email,
        phoneNo,
        address_id: newAddress._id, // Associate the user with the new address
        role: userRole,
        password,
        isEmailVerified: true
    });



// Get role permissions
// const rolePermissions = await getRolePermissions(userRole);


// // Add role permissions to the user
// const permissionArray = rolePermissions.map(permission => ({
//     permission_name: permission.permission_name,
//     permission_value: permission.permission_value
// }));


//     const userPermission = new UserPermission({
//         user_id: newUser._id,
//         permission: permissionArray
//     });

//     console.log(userPermission)

//     await userPermission.save();

    // Send email to the user
    try {
        await sendEmail({
            email: email,
            subject: 'Account Created Successfully',
            username: username,
            password: password,
            role: userRole
        }, 'html');
    } catch (error) {
        console.error('Error sending email:', error);
    }

    sendResponse(res, 201, true, 'User created successfully', newUser);
});



// Get all users except the logged-in user
const getUsers = asyncHandler(async (req, res, next) => {
    const loggedInUserId = req.user.id;

   //get user data with all permissions
   const data =  await userModel.aggregate([
    {
        $match:{
            _id: { $ne: new mongoose.Types.ObjectId(loggedInUserId)}
        }
    },
    {
        $lookup:{
            from:"userpermissions", //collection name
            localField:"_id",
            foreignField:"user_id", //common field 
            as: "permissions"
        }
    },
    {
        $project:{
            _id:1,
            username:1,
            email:1,
            password:1,
            role:1,
            isEmailVerified:1,
            createdAt:1,
            updatedAt:1,
            permissions:{
                $cond:{
                    if : {$isArray: "$permissions"},
                    then : {$arrayElemAt : ["$permissions", 0]},
                    else: null
                }
            }

        }
    },
    {
        $addFields:{
            "permissions":{
                "permissions":"$permissions.permissions"
            }
        }
    }
])


    if (!data) {
        return next(new ErrorHandler('Failed to retrieve users', 404));
    }


    sendResponse(res, 200, true, 'Users retrieved successfully', data);

});

// Update user details
const updateUser = asyncHandler(async (req, res, next) => {

    
    const { password, id } = req.body;

  
     // Create an object with the fields to update
     const updateFields = {};
     if (password) {
         updateFields.password = password;
     }
    //  if (role) {
    //      updateFields.role = role;
    //  }

   // Find and update the user
   let updatedUser = await userModel.findByIdAndUpdate(id, updateFields, { new: true });


   // Check if user exists
   if (!updatedUser) {
       return next(new ErrorHandler('User not found', 404));
   }

         //add permission to user if coming from request
        //  if(req.body.permissions != undefined && req.body.permissions.length > 0){
        //     const addPermissionData = req.body.permissions
        //     const permissionArray = []
        //     await Promise.all( addPermissionData.map( async (permission) => {
        //     const permissionData = await Permission.findOne({_id : permission.id})
        //     permissionArray.push({
        //         permission_name : permissionData.permission_name,
        //         permission_value : permission.value
        //     })
        // }))

        // await UserPermission.findOneAndUpdate({ user_id: id }, { permission: permissionArray }, { upsert: true });

        // }

// Retrieve the updated user data after permission update
updatedUser = await userModel.findById(id);
sendResponse(res, 200, true, 'User updated successfully', updatedUser);

});

// update User password
const updatePassword = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user.id).select("+password");

    //check old password 
    const isPasswordMatch = await user.comparePassword(req.body.oldPassword)

    //check password status
    if (!isPasswordMatch) {
        return next(new ErrorHandler("old password is incorrect", 400))
    }

    //match new password and confirm password
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match", 400))
    }

    user.password = req.body.newPassword;
    await user.save()

    sendResponse(res, 200, true, 'password has been updated', user);

    // const msg = "password updated successfully"
    // sendToken(user, 200, res, msg);

});

// update User Profile
const updateProfile = asyncHandler(async (req, res, next) => {
    const { username, phoneNumber } = req.body;

    // Find the user in the database by their ID
    const user = await userModel.findById(req.user.id);

    if (!user) {
        return sendResponse(res, 404, false, "User not found");
    }

    // Check if the user's email is verified
    if (!user.isEmailVerified) {
        return sendResponse(res, 401, false, "Email is not verified. Please verify your email to update your profile.");
    }

    // If the email is not changed, update the profile without sending verification email
    user.username = username;
    user.phoneNumber = phoneNumber

    await user.save();

    sendResponse(res, 200, true, "Your profile has been updated", user);
});

// Delete user
const deleteUser = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;

    // Find the user to delete
    const user = await userModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Delete the user
    await user.remove();

    sendResponse(res, 200, true, "User deleted successfully");
});


// Generate a random password
const generateRandomPassword = () => {
    const randomDigits = Math.random().toString().slice(-6);
    return randomDigits;
};

module.exports = {
    createUser,
    getUsers,
    updateUser,
    deleteUser,
    profile,
    updatePassword,
    updateProfile,
}