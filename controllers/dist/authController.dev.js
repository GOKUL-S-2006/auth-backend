"use strict";

var User = require('./../models/Users');

var crypto = require("crypto");

var jwt = require('jsonwebtoken');

var sendEmail = require('./../utils/sendEmail'); //Generate JWT Token


var generateToken = function generateToken(id) {
  return jwt.sign({
    id: id
  }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });
}; // @route   POST /api/auth/register


exports.registerUser = function _callee(req, res) {
  var _req$body, name, email, password, userExists, _user;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password; // check if user exists

          _context.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 4:
          userExists = _context.sent;

          if (!userExists) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: "User already exists"
          }));

        case 7:
          _context.next = 9;
          return regeneratorRuntime.awrap(User.create({
            name: name,
            email: email,
            password: password
          }));

        case 9:
          _user = _context.sent;
          res.status(201).json({
            _id: _user._id,
            name: _user.name,
            email: _user.email,
            token: generateToken(_user._id)
          });
          _context.next = 17;
          break;

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](0);
          console.error("Register error:", _context.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 13]]);
};

exports.loginUser = function _callee2(req, res) {
  var _req$body2, email, password, _user2, isMatch;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;
          _context2.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select("+password"));

        case 4:
          _user2 = _context2.sent;

          if (_user2) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Invalid credentials"
          }));

        case 7:
          _context2.next = 9;
          return regeneratorRuntime.awrap(_user2.matchPassword(password));

        case 9:
          isMatch = _context2.sent;

          if (isMatch) {
            _context2.next = 12;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Invalid credentials"
          }));

        case 12:
          res.json({
            _id: _user2._id,
            name: _user2.name,
            email: _user2.email,
            token: generateToken(_user2._id)
          });
          _context2.next = 19;
          break;

        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](0);
          console.error("Login error:", _context2.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 15]]);
}; // @route   POST /api/auth/forgot-password


exports.forgotPassword = function _callee3(req, res) {
  var email, _user3, resetToken, resetUrl, message;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          email = req.body.email;
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 4:
          _user3 = _context3.sent;

          if (_user3) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            message: "No user found with this email"
          }));

        case 7:
          //generate reset token
          resetToken = _user3.getResetPasswordToken(); // Save user without validation (skip required fields check)

          _context3.next = 10;
          return regeneratorRuntime.awrap(_user3.save({
            validateBeforeSave: false
          }));

        case 10:
          // Create reset URL
          resetUrl = "".concat(req.protocol, "://").concat(req.get("host"), "/api/auth/reset-password/").concat(resetToken); // 4️ Message content

          message = "\n      <h2>Password Reset Request</h2>\n      <p>Please click the link below to reset your password:</p>\n      <a href=\"".concat(resetUrl, "\" target=\"_blank\">").concat(resetUrl, "</a>\n      <p>This link will expire in 10 minutes.</p>\n    "); //  Send email

          _context3.next = 14;
          return regeneratorRuntime.awrap(sendEmail({
            to: _user3.email,
            subject: "Password Reset",
            html: message
          }));

        case 14:
          res.status(200).json({
            message: "Password reset link sent to email"
          });
          _context3.next = 26;
          break;

        case 17:
          _context3.prev = 17;
          _context3.t0 = _context3["catch"](1);
          console.error("Forgot password error:", _context3.t0);

          if (!user) {
            _context3.next = 25;
            break;
          }

          // ✅ check first
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          _context3.next = 25;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 25:
          res.status(500).json({
            message: "Email could not be sent"
          });

        case 26:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 17]]);
}; // @route   PUT /api/auth/reset-password/:token


exports.resetPassword = function _callee4(req, res) {
  var resetPasswordToken, _user4;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          // 1️) Hash token from URL (same way we stored it in DB)
          resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex"); // 2️) Find user with valid token (not expired)

          _context4.next = 4;
          return regeneratorRuntime.awrap(User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: {
              $gt: Date.now()
            }
          }));

        case 4:
          _user4 = _context4.sent;

          if (_user4) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: "Invalid or expired token"
          }));

        case 7:
          // 3️) Set new password
          _user4.password = req.body.password; // 4️) Clear reset fields

          _user4.resetPasswordToken = undefined;
          _user4.resetPasswordExpire = undefined;
          _context4.next = 12;
          return regeneratorRuntime.awrap(_user4.save());

        case 12:
          res.status(200).json({
            message: "Password updated successfully"
          });
          _context4.next = 19;
          break;

        case 15:
          _context4.prev = 15;
          _context4.t0 = _context4["catch"](0);
          console.error("Reset password error:", _context4.t0);
          res.status(500).json({
            message: "Server error"
          });

        case 19:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 15]]);
};