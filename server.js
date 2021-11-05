require("dotenv").config();

let shelljs = require("shelljs");
const cron = require("node-cron");
const express = require("express");
const { sendMessageToList } = require("./MessageUtils");
const app = express();

const mongoose = require("mongoose");
const {
  getCurrentNumbers,
  fetchWeather,
  getWeatherMessage,
} = require("./OtherUtils");
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (err) => console.log(err));
db.once("open", () => console.log("connected to database .."));

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const messageRouter = require("./routes/received");
app.use("/received", messageRouter);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

cron.schedule("0 * * * * *", async () => {
  const currentNumbers = await getCurrentNumbers();
  const weatherInfo = await fetchWeather([...currentNumbers.postalCodeList]);
  const weatherMessages = getWeatherMessage(weatherInfo);
  const weatherMessagesSet = new Set();
  weatherMessages.forEach((item) => {
    weatherMessagesSet[item["postalCode"]] = item["message"];
  });
  // console.log(weatherMessagesSet["431605 IN"]);
  sendMessageToList(currentNumbers.subscribers, weatherMessagesSet);
});

app.listen(PORT, () => {
  console.log(`Server started listening on port:${PORT}`);
});
