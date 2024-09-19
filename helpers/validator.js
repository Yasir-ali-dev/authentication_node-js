const { check } = require("express-validator");

exports.registerValidator = [
  check("name", "name is required").not().notEmpty(),
  check("email", "please enter valid email").isEmail(),
  check("phone", "Mobile number should be 11 digits").isLength({
    max: 11,
    min: 11,
  }),
  check(
    "password",
    "password should be greater than or equal to 6 letter contains one lowercase alphabet, one uppercase alphabet, one number and an special character"
  ).isStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minLength: 6,
  }),
  check("image")
    .custom((value, { req }) => {
      if (
        req.file.mimetype === "image/jpeg" ||
        req.file.mimetype === "image/jpg" ||
        req.file.mimetype === "image/png"
      ) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("please inlclude an jpg or png file"),
];

exports.sendMailVerificationValidator = [
  check("email", "please enter valid email").isEmail(),
];

exports.forgotPasswordValidator = [
  check("email", "please enter valid email").isEmail(),
];

exports.loginValidator = [
  check("password", "password is required").not().notEmpty(),
  check("email", "please enter valid email").isEmail(),
];

exports.updateProfileValidator = [
  check("name", "name is required").not().notEmpty(),
  check("phone", "Mobile number should be 11 digits").isLength({
    max: 11,
    min: 11,
  }),
];

exports.optMailValidator = [
  check("email", "please enter valid email").isEmail(),
];

exports.verifyOtpValidator = [
  check("otp", "otp is required!").not().notEmpty(),
  check("user_id", "user_id is required!").not().notEmpty(),
];
