const { default: mongoose } = require("mongoose");

const OtpSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "user_id is required"],
    ref: "User",
  },
  otp: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    get: (timestamp) => timestamp.getTime(), //time in milli seconds
    set: (timestamp) => new Date(timestamp),
  },
});
module.exports = mongoose.model("OTP", OtpSchema);
