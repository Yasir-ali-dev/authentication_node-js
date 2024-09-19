require("dotenv").config();
const jwt = require("jsonwebtoken");
const BlackListModel = require("../models/BlackList.model");

const auth = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "token is required for authentication",
    });
  }
  try {
    const bearer = token.split(" ");
    const bearerToken = bearer[1];
    const blackListedToken = await BlackListModel.findOne({
      token: bearerToken,
    });
    if (blackListedToken) {
      return res.status(400).json({
        success: false,
        message: "This sessoin has been expired. please try again!",
      });
    }

    const decodeData = jwt.verify(bearerToken, process.env.JWT_SECRET_KEY);
    req.user = decodeData;
  } catch (error) {
    console.log(error);
    res.status(401).json({
      status: false,
      message: "Invalid token!",
      error: error.message,
    });
  }
  next();
};

module.exports = auth;
