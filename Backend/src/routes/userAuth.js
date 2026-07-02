const express = require("express");
const authRouter = express.Router();

const { register, verifyOtp, resendOtp, login, logout, getProfile, adminReg, deleteUser } = require("../controller/userAuthent");
const validatecookie = require("../middleware/validatecookie");
const adminValidation = require("../middleware/adminValidation");


// register
authRouter.post("/register", register);

// verify-otp
authRouter.post("/verify-otp", verifyOtp);

// resend-otp
authRouter.post("/resend-otp", resendOtp);

// login
authRouter.post("/login", login);

// logout
authRouter.post("/logout", validatecookie, logout);

// getprofile
authRouter.get("/getProfile", validatecookie, getProfile);

// Adminregister
authRouter.post("/admin/register", adminValidation, adminReg);

authRouter.delete("/delete", validatecookie, deleteUser)

module.exports = authRouter;