const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const crypto=require('crypto');
const UserSchema=new mongoose.Schema(
    {
        //Fields
     name:{
        type:String,
        required: [true, "Name is required"],
         trim: true,
    },
    email:{
        type:String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
    },
     password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // don't return password by default in queries
    },
     resetPasswordToken: String,
    resetPasswordExpire: Date,
      },
  { timestamps: true }   //  schema options, not a field
)


UserSchema.pre("save",async function(next){
    if(!this.isModified("password")) return  next();
    //If the password is new or updated → hash it.
    //If the password hasn’t changed → skip hashing.
    const salt=await bcrypt.genSalt(10);//greater than salt value stronger the encryption
    this.password=await bcrypt.hash(this.password,salt);
      next();
});
UserSchema.methods.matchPassword=async function(enteredPassword){
return await bcrypt.compare(enteredPassword,this.password);
   // // compares a plain text password to the hashed one on 'this' user doc
}
// Generate and hash reset password token
UserSchema.methods.getResetPasswordToken =function(){
     // Generate random token
     const resetToken=crypto.randomBytes(20).toString("hex");
     // Hash token and store it in DB (so we don’t store the plain token)
     this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
      // Set token expiry (10 minutes)
        this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
         return resetToken;
}



module.exports = mongoose.model("User", UserSchema);
