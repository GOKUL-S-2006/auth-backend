const express=require('express');
const app=express();
const cors=require('cors');
const dotenv=require('dotenv');
const connectDB=require('./config/connectDB');
const authRoutes = require("./routes/auth");
dotenv.config();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 8000;
// connect to DB, then start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();