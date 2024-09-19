const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

router.route("/mail-verification").get(userController.mailVerification);

module.exports = router;
