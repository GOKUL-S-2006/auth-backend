"use strict";

var express = require('express');

var app = express();

var cors = require('cors');

var dotenv = require('dotenv');

var connectDB = require('./config/connectDB');

var authRoutes = require("./routes/auth");

dotenv.config();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
var PORT = process.env.PORT || 8000; // connect to DB, then start server

var startServer = function startServer() {
  return regeneratorRuntime.async(function startServer$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(connectDB());

        case 2:
          app.listen(PORT, function () {
            console.log("\uD83D\uDE80 Server running on http://localhost:".concat(PORT));
          });

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
};

startServer();