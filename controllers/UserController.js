const bcrypt = require("bcrypt");
const {
  oneMinuteExpiry,
  threeMinuteExpiry,
} = require("../helpers/oneMinuteExpiry");
const userModel = require("../models/userModel");
const { validationResult } = require("express-validator");
const { sendMail } = require("../helpers/mailer");
const randomstring = require("randomstring");
const PasswordReset = require("../models/PasswordReset");
const jwt = require("jsonwebtoken");
const BlackListModel = require("../models/BlackList.model");
const OtpModel = require("../models/Otp.model");

const registerUser = async (req, res) => {
  try {
    const { name, password, email, phone } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Error",
        error: errors.array(),
      });
    }
    const isExists = await userModel.findOne({ email });
    if (isExists) {
      return res.status(200).json({
        success: false,
        msg: "Email Already Exists",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = userModel({
      name,
      password: hashedPassword,
      email,
      phone,
      image: "images/" + req.file.filename,
    });
    const userData = await user.save();
    const msg = `<p>Hi ${user.name}, please verify your account by clicking <a href="http://localhost:8080/mail-verification?id=${user._id}">here</a>.</p>`;

    sendMail(email, "Email Validation", msg);
    return res.status(201).json({
      msg: "Registered Successfully",
      success: true,
      user: userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Error",
        error: errors.array(),
      });
    }
    const { password, email } = req.body;
    const isUserExist = await userModel.findOne({ email: email });
    if (!isUserExist) {
      return res.status(401).json({
        success: false,
        message: "Password and Email is Incorrect!",
      });
    }
    const isCorrectPassword = await bcrypt.compare(
      password,
      isUserExist.password
    );
    if (!isCorrectPassword) {
      return res.status(401).json({
        success: false,
        message: "Password and Email is Incorrect!",
      });
    }
    if (isUserExist.is_verified == 0) {
      return res.status(401).json({
        success: false,
        message: "PLease verify your account!",
      });
    }
    const accessToken = generateAccessToken({ user: isUserExist });
    const refreshToken = generateRefeshToken({ user: isUserExist });
    res.status(200).json({
      success: false,
      message: "USer Login Successfully!",
      user: isUserExist,
      accessToken,
      refreshToken,
      tokenType: "Bearer",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["authorization"];
    const bearer = token.split(" ");
    const bearerToken = bearer[1];
    const blackListedToken = BlackListModel({
      token: bearerToken,
    });
    await blackListedToken.save();
    res.setHeader("Clear-Site-Data", '"cookies","storage"');
    res.status(200).json({
      status: true,
      message: "user logout successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const generateAccessToken = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h",
  });
  return token;
};
// refresh token should have longer expiry date than access
const generateRefeshToken = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
    expiresIn: "24h",
  });
  return token;
};

const refreshToken = async (req, res) => {
  try {
    const user_id = req.user.user._id;
    const userData = await userModel.findOne({ _id: user_id });
    const accessToken = generateAccessToken({ user: userData });
    const refreshToken = generateRefeshToken({ user: userData });
    res.status(200).json({
      success: true,
      msg: "token refreshed!",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const mailVerification = async (req, res) => {
  try {
    if (req.query.id === "undefined") {
      return res.render("404");
    }
    const userData = await userModel.findOne({ _id: req.query.id });
    if (userData) {
      if (userData.is_verified === 1) {
        return res.render("mail-verification", {
          message: "Mail already verified!",
        });
      }
      await userModel.findByIdAndUpdate(req.query.id, {
        $set: { is_verified: 1 },
      });
      return res.render("mail-verification", {
        message: "Mail has been verified successfully!",
      });
    } else {
      return res.render("mail-verification", { message: "User Not Found!" });
    }
  } catch (error) {
    console.log(error.message);
    return res.render("404");
  }
};

const sendMailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        error: errors.array(),
      });
    }
    const userData = await userModel.findOne({ email: email });
    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "Email does not Exists!",
      });
    }
    if (userData.is_verified === 1) {
      return res.status(400).json({
        success: false,
        msg: "Email is already verified!",
      });
    }
    const msg = `<p>Hi ${userData.name}, please verify your account by clicking <a href="http://localhost:8080/api/v1/mail-verification?id=${userData._id}">here</a>.</p>`;
    sendMail(userData.email, "Email Verification", msg);
    res.status(200).json({
      success: true,
      msg: "Verification link sent to your email!, Please verify!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        error: errors.array(),
      });
    }
    const userData = await userModel.findOne({ email: email });
    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "Email does not Exists!",
      });
    }
    const randString = randomstring.generate();
    const msg =
      "Hii " +
      userData.name +
      'please click <a href="http://localhost:8080/api/v1/reset-password?token=' +
      randString +
      '">here</a> to reset password';
    await PasswordReset.deleteMany({ user_id: userData._id });
    await PasswordReset.create({
      user_id: userData._id,
      token: randString,
    });
    sendMail(userData.email, "Password Reset", msg);
    res.status(200).json({
      status: true,
      msg: "Email sent, Please check your email to reset password!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    if (token == "undefined") {
      return res.render("404");
    }
    const resetData = await PasswordReset.findOne({ token });
    if (!resetData) {
      return res.render("404");
    }
    res.render("reset-password", { resetData });
  } catch (error) {
    console.log("undeo");
    return res.render("404");
  }
};

const updatePassword = async (req, res) => {
  try {
    const { user_id, password, cpassword } = req.body;
    const resetData = await PasswordReset.findOne({ user_id });
    if (password != cpassword) {
      return res.render("reset-password", {
        resetData,
        error: "password & confirm password does not matched!",
      });
    }
    const hashedPassword = await bcrypt.hash(cpassword, 10);
    await userModel.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: hashedPassword } }
    );
    await PasswordReset.deleteMany({ user_id });
    return res.redirect("reset-success");
  } catch (error) {
    console.log(error);
    return res.render("404");
  }
};

const successPassword = (req, res) => {
  try {
    res.render("reset-success");
  } catch (error) {
    console.log(error);
    return res.render("404");
  }
};

const userProfile = (req, res) => {
  try {
    const user = req.user.user;
    res.status(200).json({
      success: true,
      message: "User Profile",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Error",
        error: errors.array(),
      });
    }
    const { name, phone } = req.body;
    const data = {
      name,
      phone,
    };
    if (req.file !== undefined) {
      data.image = "image/" + req.file.filename;
    }
    const userProfile = await userModel.findByIdAndUpdate(
      { _id: req.user.user._id },
      {
        $set: data,
      },
      { new: true }
    );
    return res.status(200).json({
      success: false,
      message: "User Profile updated successfully",
      user: userProfile,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const generateSixDigitOtp = () => {
  return Math.floor(Math.random() * 1000000);
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        error: errors.array(),
      });
    }
    const userData = await userModel.findOne({ email: email });
    if (!userData) {
      return res.status(400).json({
        success: false,
        msg: "Email does not Exists!",
      });
    }
    if (userData.is_verified === 1) {
      return res.status(400).json({
        success: false,
        msg: "Email is already verified!",
      });
    }

    const oldOTP = await OtpModel.findOne({ user_id: userData._id });
    if (oldOTP) {
      const nextOtp = oneMinuteExpiry(oldOTP.timestamp);
      if (!nextOtp) {
        return res.status(400).json({
          success: false,
          msg: "Please try after some time!",
        });
      }
    }

    const otp = generateSixDigitOtp();
    const currentDate = new Date();
    await OtpModel.findOneAndUpdate(
      { user_id: userData._id },
      {
        otp,
        timestamp: new Date(currentDate.getTime()),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const msg = "<p>Hi" + userData.name + ",</br>" + "<h4>" + otp + "</h4>";
    sendMail(userData.email, "OTP Verification", msg);
    res.status(200).json({
      success: true,
      msg: "Otp has been sent to your email!, Please verify!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        error: errors.array(),
      });
    }
    const { otp, user_id } = req.body;
    const otpData = await OtpModel.findOne({
      otp,
      user_id,
    });
    if (!otpData) {
      return res.status(400).json({
        success: false,
        msg: "you entered wrong otp!",
      });
    }
    const isOtpExpired = threeMinuteExpiry(otpData.timestamp);
    if (isOtpExpired) {
      return res.status(400).json({
        success: false,
        msg: "Otp has been expired!",
      });
    }
    await userModel.findByIdAndUpdate(
      { _id: user_id },
      { $set: { is_verified: 1 } }
    );
    res.status(200).json({
      success: true,
      message: "Account is verified successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = userController = {
  registerUser,
  mailVerification,
  sendMailVerification,
  forgotPassword,
  updatePassword,
  resetPassword,
  successPassword,
  loginUser,
  userProfile,
  updateUserProfile,
  refreshToken,
  sendOtp,
  logoutUser,
  verifyOtp,
};
