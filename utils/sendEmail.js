const nodemailer = require("nodemailer");

const sendEmail=async (options)=>{
    const transporter=nodemailer.createTransport({
        service:'gmail',
        auth: {
      user: process.env.EMAIL_USER, //  email address
      pass: process.env.EMAIL_PASS, //  email app password
    },
});
    const mailOptions = {
    from: `"Auth System" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };
      await transporter.sendMail(mailOptions);

      
}
module.exports = sendEmail;