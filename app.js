const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");

mongoose
.connect(
  `mongodb+srv://${process.env.MONGODB_NAME}:${process.env.MONGODB_PASSWORD}@cluster0.51j32.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
)
.then(() => console.log("Connection to MongoDB is a success!"))
.catch(() => console.log("Connection to MongoDB is a failure!"));

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);

module.exports = app;
