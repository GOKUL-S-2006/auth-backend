const User=require('./../models/Users');
const crypto = require("crypto");
const jwt=require('jsonwebtoken');
const sendEmail=require('./../utils/sendEmail');
//Generate JWT Token
const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
         expiresIn: "1h"
    })
};
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
 
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create user
    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser=async (req,res)=>{
    try{
          const {email,password}=req.body;
          const user=await User.findOne({email}).select("+password");//.select("+password") temporarily includes the password field, which is normally hidden, so you can check it during login.
              if (!user) {
           return res.status(400).json({ message: "Invalid credentials" });
                    }    

        const isMatch = await user.matchPassword(password);//custom method you defined in UserSchema
           if (!isMatch) {
                  return res.status(400).json({ message: "Invalid credentials" });
              }


               res.json({
                   _id: user._id,
                   name: user.name,
                    email: user.email,
                    token: generateToken(user._id),
                  })


    }catch(err){
             console.error("Login error:", err);
              res.status(500).json({ message: "Server error" });
    }
}
// @route   POST /api/auth/forgot-password
exports.forgotPassword=async (req,res)=>{
  const {email}=req.body;
   try{
       const user=await User.findOne({email});
       if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }
       //generate reset token
       const resetToken=user.getResetPasswordToken();
       
       // Save user without validation (skip required fields check)
        await user.save({ validateBeforeSave: false });

         // Create reset URL
        const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;
         
        // 4️ Message content
    const message = `
      <h2>Password Reset Request</h2>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
    `;

      
    //  Send email
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: message,
    });
       
      res.status(200).json({ message: "Password reset link sent to email" });


   }catch (err) {
  console.error("Forgot password error:", err);

  if (user) { // ✅ check first
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
  }

  res.status(500).json({ message: "Email could not be sent" });
}
}
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword=async (req,res)=>{
  try{
      // 1️) Hash token from URL (same way we stored it in DB)
        const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

      // 2️) Find user with valid token (not expired)
        const user=await User.findOne({resetPasswordToken,
           resetPasswordExpire: { $gt: Date.now() }
        });
        
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
     // 3️) Set new password
    user.password = req.body.password;

     // 4️) Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

     await user.save();
      res.status(200).json({ message: "Password updated successfully" });


  }catch(err){
         console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });

  }
}