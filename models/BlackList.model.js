const { default: mongoose } = require("mongoose");

const blackListSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "token is required"],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("BlackList ", blackListSchema);
