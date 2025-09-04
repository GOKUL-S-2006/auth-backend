"use strict";

var mongoose = require('mongoose');

var bcrypt = require('bcryptjs');

var crypto = require('crypto');

var UserSchema = new mongoose.Schema({
  //Fields
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false // don't return password by default in queries

  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
} //  schema options, not a field
);
UserSchema.pre("save", function _callee(next) {
  var salt;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (this.isModified("password")) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next());

        case 2:
          _context.next = 4;
          return regeneratorRuntime.awrap(bcrypt.genSalt(10));

        case 4:
          salt = _context.sent;
          _context.next = 7;
          return regeneratorRuntime.awrap(bcrypt.hash(this.password, salt));

        case 7:
          this.password = _context.sent;
          next();

        case 9:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
});

UserSchema.methods.matchPassword = function _callee2(enteredPassword) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(bcrypt.compare(enteredPassword, this.password));

        case 2:
          return _context2.abrupt("return", _context2.sent);

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
}; // Generate and hash reset password token


UserSchema.methods.getResetPasswordToken = function () {
  // Generate random token
  var resetToken = crypto.randomBytes(20).toString("hex"); // Hash token and store it in DB (so we don’t store the plain token)

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex"); // Set token expiry (10 minutes)

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);