const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoute");
const adminRoutes = require("./routes/adminRoute");
const morgan = require("morgan");
const session = require("express-session");
require("dotenv").config();
const multer = require("multer");
const nocache = require("nocache");

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error(error.message);
  });


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(nocache());


app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);


app.use("/", userRoutes);
app.use("/admin", adminRoutes);


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
