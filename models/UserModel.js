const { default: mongoose } = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  phone: {
    type: String,
    required: [true, "phone is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  is_verified: {
    type: Number,
    default: 0, //1-> if verified
  },
  image: {
    type: String,
    required: [true, "image is required"],
  },
});
module.exports = mongoose.model("User", userSchema);
