const crypto = require("crypto");
const asyncHandler = require("express-async-handler");

const userModel = require("../models/users");
const addressModel = require("../models/address");

const sendEmail = require("../utils/sendEmail");
const sendToken = require("../utils/jwtToken");
// const generateTokens = require('../utils/generateTokens');
const sendResponse = require("../utils/responseHandler");
const ErrorHandler = require("../utils/errorHandler");
const generateTokens = require("../utils/generateTokens");

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password, phoneNo, address } = req.body;

  console.log('first')
  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("Email already exists, please user other email", 400));
  }

  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Set email verification token and expiry time
  const emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;

  // Create the address first
  const newAddress = await addressModel.create({ address, phoneNo });
  const user = await userModel.create({
    username,
    email,
    password,
    address_id: newAddress._id,
    emailVerificationToken: verificationToken,
    emailVerificationExpiry: emailVerificationExpiry,
  });

  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/verify-email/${verificationToken}`;
  const message = `Hello ${username},\n\nPlease click on the following link to verify your email:\n${verificationUrl}`;

  await sendEmail(
    {
      email: email,
      subject: "Email Verification",
      message: message,
    },
    "text"
  );


  sendResponse(
    res,
    201,
    true,
    "Account created. Please verify your email address.",
    user
  );
});

const verifyEmail = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  console.log(token);

  // Find user by verification token
  const user = await userModel.findOne({
    emailVerificationToken: token,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired verification token", 400));
  }

  // Check if the user is already verified
  if (user.isEmailVerified) {
    return next(new ErrorHandler("Email is already verified", 400));
  }

  // Update user's email verification status
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save();

  sendResponse(
    res,
    200,
    true,
    "Email verification successful. You can now login."
  );
});

const requestNewVerificationEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Find user by email
  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Check if the user's email is already verified
  if (user.isEmailVerified) {
    return next(new ErrorHandler("Email is already verified", 400));

  }

  // Reset verification token and update expiry time
  user.emailVerificationToken = crypto.randomBytes(20).toString("hex"); // Implement your token generation logic here
  user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expiry time (e.g., 24 hours from now)
  await user.save();

  // Send new verification email
  const verificationUrl = `${req.protocol}://${req.get("host")}/verify-email/${
    user.emailVerificationToken
  }`;
  const message = `Hello ${user.username},\n\nPlease click on the following link to verify your email:\n${verificationUrl}`;

  await sendEmail(
    {
      email: email,
      subject: "Email Verification",
      message: message,
    },
    "text"
  );

  sendResponse(
    res,
    200,
    true,
    "A new verification email has been sent. Please check your email inbox."
  );
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("please enter email and password", 400));
  }

  const user = await userModel
    .findOne({ email })
    .select("+password")
    .populate("address_id");

    console.log("+++",user)
  if (!user) {
    return next(new ErrorHandler("invalid email or password", 401));
  }

  if (!user.isEmailVerified) {
    return next(new ErrorHandler("Email is not verified. Please verify your email to log in.", 401));
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("invalid email or password", 401));
  }

  //get user data with all permissions
  const data = await userModel.aggregate([
    {
      $match: { email: user.email },
    },
    {
      $lookup: {
        from: "userpermissions", //collection name
        localField: "_id",
        foreignField: "user_id", //common field
        as: "permissions",
      },
    },
    {
      $lookup: {
        from: "addresses", // Assuming your address collection is named "addresses"
        localField: "address_id",
        foreignField: "_id",
        as: "address",
      },
    },
    {
      $project: {
        _id: 1,
        username: 1,
        email: 1,
        role: 1,
        address: { $arrayElemAt: ["$address", 0] }, // Extract the first element from the address array
        isEmailVerified: 1,
        createdAt: 1,
        updatedAt: 1,
        permissions: {
          $cond: {
            if: { $isArray: "$permissions" },
            then: { $arrayElemAt: ["$permissions", 0] },
            else: null,
          },
        },
      },
    },
    {
      $addFields: {
        permissions: {
          permissions: "$permissions.permissions",
        },
      },
    },
  ]);


  const token = generateTokens(user);

  const msg = "login successfully";

  sendToken(data[0], 200, res, msg, token);
});

//forgot password
const forgotPassword = asyncHandler(async (req, res, next) => {

  const user = await userModel.findOne({ email: req.body.email });
  //check user exist
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  if (!user.isEmailVerified) {
    return next(new ErrorHandler("Email is not verified. Please verify your email to log in.", 401));
  }
  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // const resetPasswordUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/password/reset/${resetToken}`;
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;


  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail(
      {
        email: user.email,
        subject: `TuniPay Password Recovery`,
        message,
      },
      "text"
    );

    sendResponse(res, 200, true, `Email sent to ${user.email} successfully`);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error, 500));
  }
});

//Reset password======================================================================
const resetPassword = asyncHandler(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  //find user having reset hashed token and whose expiry time is grater than current data
  const user = await userModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  //check user exists
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  //check bot pass and Cpass which will be sent by the user
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not password", 400));
  }

  //if passwords match and setted undefined for resetTokens because no further usage
  user.password = req.body.newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendResponse(res, 200, true, `password resetted successfully`);
});

module.exports = {
  registerUser,
  verifyEmail,
  requestNewVerificationEmail,
  loginUser,
  forgotPassword,
  resetPassword,
};
