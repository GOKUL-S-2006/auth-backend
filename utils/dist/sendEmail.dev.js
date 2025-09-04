"use strict";

var nodemailer = require("nodemailer");

var sendEmail = function sendEmail(options) {
  var transporter, mailOptions;
  return regeneratorRuntime.async(function sendEmail$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              //  email address
              pass: process.env.EMAIL_PASS //  email app password

            }
          });
          mailOptions = {
            from: "\"Auth System\" <".concat(process.env.EMAIL_USER, ">"),
            to: options.to,
            subject: options.subject,
            html: options.html
          };
          _context.next = 4;
          return regeneratorRuntime.awrap(transporter.sendMail(mailOptions));

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
};

module.exports = sendEmail;