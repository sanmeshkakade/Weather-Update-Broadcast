// require("dotenv").config();

let shelljs = require("shelljs");
const cron = require("node-cron");
const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (err) => console.log(err));
db.once("open", () => console.log("connected to database .."));

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const messageRouter = require("./routes/received");
app.use("/received", messageRouter);

app.get("/", (req, res) => {
  res.status(200).send("Server is running...");
});

cron.schedule("* * * * *", () => {
  // console.log("Code to send messages");
  //code to send weather update.
});

app.listen(PORT, () => {
  console.log(`Server started listening on port:${PORT}`);
});
