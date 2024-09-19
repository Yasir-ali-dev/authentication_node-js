const { default: mongoose } = require("mongoose");

const passwordResetSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "user_id is required"],
    ref: "User",
  },
  token: {
    type: String,
    required: [true, "token is required"],
  },
});
module.exports = mongoose.model("PasswordReset", passwordResetSchema);
