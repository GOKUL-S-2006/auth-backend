const mongoose=require('mongoose');
const connectDB=async ()=>{
    try{
         const conn=await mongoose.connect(process.env.MONGO_URL);
         console.log("MongoDB connected");
    }

    catch(err){
        console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
    }
}
mongoose.connection.on("disconnected", () => {
  console.warn(" MongoDB disconnected");
});
module.exports=connectDB;
