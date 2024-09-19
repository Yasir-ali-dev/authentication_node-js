require("dotenv").config();
const express = require("express");
const { default: mongoose } = require("mongoose");
const userRoutes = require("./routes/UserRoute");
const authRoutes = require("./routes/AuthRoutes");
const morgan = require("morgan");
var colors = require("colors");

const app = express();
app.set("view engine", "ejs");
app.set("views", "./views"); // foldername,folder location

// middlewares
app.use(express.json());

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res).bgBlue, // HTTP method in blue
      tokens.url(req, res).bgYellow, // URL in yellow
      tokens.status(req, res).bgMagenta, // Status code in green
      tokens["response-time"](req, res), // Response time
      "ms".cyan, // Time unit in cyan
    ].join(" ");
  })
);

app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", userRoutes);
app.use("/api/v1", authRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("mongoose is connected~".underline.bgMagenta);
    });
    app.listen(process.env.PORT, () => {
      console.log(`app is listening to the port ${process.env.PORT}`.bgBlue);
    });
  } catch (error) {
    console.error(error.red);
  }
};
start();
