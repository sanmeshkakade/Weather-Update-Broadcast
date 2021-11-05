const moment = require("moment");
const fetch = require("node-fetch-commonjs");
const Subscriber = require("./models/subscriber");

const getCurrentNumbers = async () => {
  // console.log(getOffSetForTen());
  const rightLimit = getUTCTimeOffset();
  const leftLimit = rightLimit - 30 * 60;
  console.log(leftLimit, rightLimit);
  const subscribers = await Subscriber.find({
    timeOffset: { $gt: leftLimit, $lte: rightLimit },
  }).select({ number: 1, postalCode: 1, countryCode: 1 });

  const postalCodeList = new Set(
    subscribers.map((sub) => {
      return sub.postalCode + " " + sub.countryCode;
    })
  );
  return { subscribers: subscribers, postalCodeList: postalCodeList };
};

const getUTCTimeOffset = () => {
  let now = moment().utc();
  let ten = moment().utc().hours(22).minutes(30);
  let offSet = moment.duration(ten.diff(now));
  return offSet.hours() * 60 * 60 + offSet.minutes() * 60;
};

async function fetchWeather(postalCodeList) {
  let prediction;
  try {
    prediction = await Promise.all(
      postalCodeList.map(async (code) => {
        codeArr = code.split(" ");
        const fetchUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${codeArr[0]},${codeArr[1]}&appid=c53f009bbb95ce9097f5946c11a304b2`;
        const fetchData = await fetch(fetchUrl).then((resp) => resp.json());
        return {
          postalCode: code,
          data: [
            fetchData["list"][0],
            fetchData["list"][2],
            fetchData["list"][3],
            fetchData["list"][7],
          ],
          place: fetchData["city"]["name"],
        };
      })
    );
  } catch (err) {
    console.log(err);
  }
  return prediction;
  //   console.log(JSON.stringify(prediction, null, 4));
}

const getWeatherMessage = (weatherInfo) => {
  const messageArr = weatherInfo.map((item) => {
    const message = `Weather Report  \nPlace :${item["place"]} ${
      item["postalCode"]
    }\nDate:${new Date().toLocaleDateString(
      "en-US"
    )}\nMorning:: \n\tDescription: ${
      item["data"][0]["weather"][0]["description"]
    }\n\tTemperature: max :${item["data"][0]["main"]["temp_max"]} °F, min :${
      item["data"][0]["main"]["temp_min"]
    } °F\n\tWind Speed : ${
      item["data"][0]["wind"]["speed"]
    }\nNight:: \n\tDescription: ${
      item["data"][1]["weather"][0]["description"]
    }\n\tTemperature: max :${item["data"][1]["main"]["temp_max"]} °F, min :${
      item["data"][1]["main"]["temp_min"]
    } °F\n\tWind Speed : ${
      item["data"][1]["wind"]["speed"]
    }\nTomorrow:: \n\tDescription: ${
      item["data"][2]["weather"][0]["description"]
    }\n\tTemperature: max :${item["data"][2]["main"]["temp_max"]} °F, min :${
      item["data"][2]["main"]["temp_min"]
    } °F\n\tWind Speed : ${item["data"][2]["wind"]["speed"]}`;

    return { postalCode: item["postalCode"], message: message };
  });
  return [...messageArr];
};
module.exports = {
  getCurrentNumbers,
  getUTCTimeOffset,
  fetchWeather,
  getWeatherMessage,
};
