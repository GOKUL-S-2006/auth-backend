"use strict";

var express = require('express');

var router = express.Router();

var _require = require("../controllers/authController"),
    forgotPassword = _require.forgotPassword,
    resetPassword = _require.resetPassword;

var _require2 = require("../controllers/authController"),
    registerUser = _require2.registerUser,
    loginUser = _require2.loginUser;

router.post('/signup', registerUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post('/login', loginUser);
module.exports = router;