const express=require('express');
const router=express.Router();
const { forgotPassword, resetPassword } = require("../controllers/authController");
const { registerUser, loginUser } = require("../controllers/authController");
router.post('/signup',registerUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post('/login',loginUser);
module.exports=router;

