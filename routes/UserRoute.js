const express = require("express");
const router = express.Router();
const path = require("path");
const bodyParder = require("body-parser");
const multer = require("multer");
const userController = require("../controllers/UserController");
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  optMailValidator,
  verifyOtpValidator,
} = require("../helpers/validator");
const {
  sendMailVerificationValidator,
  forgotPasswordValidator,
} = require("../helpers/validator");
const auth = require("../middlewares/auth");
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      callback(null, path.join(__dirname, "../public/images"));
    }
  },
  filename: function (req, file, callback) {
    const name = Date.now() + "-" + file.originalname;
    callback(null, name);
  },
});
const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.use(bodyParder.json());
router.use(bodyParder.urlencoded({ extended: true }));
//"image" of multer should be matched with models and req.body
router
  .route("/register")
  .post(upload.single("image"), registerValidator, userController.registerUser);
router.route("/login").post(loginValidator, userController.loginUser);

router
  .route("/send-mail-verification")
  .post(sendMailVerificationValidator, userController.sendMailVerification);

router
  .route("/forgot-password")
  .post(forgotPasswordValidator, userController.forgotPassword);

router.route("/reset-password").get(userController.resetPassword);
router.route("/reset-password").post(userController.updatePassword);
router.route("/reset-success").get(userController.successPassword);

router.route("/profile").get(auth, userController.userProfile);

router
  .route("/update-profile")
  .patch(
    auth,
    upload.single("image"),
    updateProfileValidator,
    userController.updateUserProfile
  );
router.route("/refresh-token").get(auth, userController.refreshToken);
router.route("/logout").get(auth, userController.logoutUser);

// otp mail verification
router.route("/send-otp").post(optMailValidator, userController.sendOtp);
router.route("/verify-otp").post(verifyOtpValidator, userController.verifyOtp);

module.exports = router;
