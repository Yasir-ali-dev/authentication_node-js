require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  port: process.env.SMTP_PORT,
  host: process.env.SMTP_HOST,
  service: "Gmail",
  secure: true, //using google smtp mail
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = (email, content, subject) => {
  try {
    const mailOptions = {
      to: email,
      from: process.env.SMTP_MAIL,
      subject: subject,
      text: content,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      console.log(info.response);
      console.log("mail sent with id-" + info.messageId);
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendMail,
};
