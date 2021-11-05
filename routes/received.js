const express = require("express");
const router = express.Router();
const Subscriber = require("../models/subscriber");
const fetch = require("node-fetch-commonjs");
const { sendMessage } = require("../MessageUtils");

//subscribing to a service
router.post("/", getSubscriber, async (req, res) => {
  const messageArr = req.body.Body.split(" ");
  //checking if the service is valid
  if (messageArr[1] == "WEA" || messageArr[1] == "FOR") {
    if (messageArr[0] == "Start") {
      if (req.subscriber == null) {
        // subscribed for the first time for weather service
        const fetchUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${messageArr[2]},${messageArr[3]}&appid=c53f009bbb95ce9097f5946c11a304b2`;

        //getting the timeOffset
        const fetchData = await fetch(fetchUrl).then((resp) => resp.json());
        const timeOffset = fetchData["timezone"];

        //creating new doc
        const subscriber = new Subscriber({
          number: req.body.From,
          subscribedToService: [messageArr[1]],
          subscribeDate: new Date(),
          postalCode: messageArr[2],
          countryCode: messageArr[3],
          timeOffset: timeOffset,
        });
        //saving new document in the received collection
        try {
          const newSubscriber = await subscriber.save();

          sendMessage(
            `Subscribed to service ${newSubscriber.subscribedToService}`,
            req.body.From
          );
          res.json({ subscriber: newSubscriber, message: "New Sub User" });
        } catch (err) {
          console.log("first time block", err.message);
        }
      } else {
        //if user is already subscribed

        //check if he wants to subscribe to old service or new service
        if (req.subscriber.subscribedToService.includes(messageArr[1])) {
          console.log(
            "code to send user, let know, that he is already subscribed."
          );
          sendMessage(
            `already subscribed to ${newSubscriber.subscribedToService}`,
            req.body.From
          );
          res.json({ message: "Already Subscribed to services" });
        }

        //adding new service to the number
        else {
          req.subscriber.subscribedToService.push(messageArr[1]);
          try {
            const updatedSubscriber = await req.subscriber.save();
            sendMessage(`subscribed to ${messageArr[1]}`, req.body.From);
            res.json({ updatedSubscriber, message: "New service added" });
          } catch (err) {
            console.log(err);
          }
        }
      }
    } else if (messageArr[0] == "Stop") {
      //check if user is subscribed or not
      if (req.subscriber !== undefined) {
        //if he is subscribed to service hes trying to unsubscribe
        if (req.subscriber.subscribedToService.includes(messageArr[1])) {
          //removing that service
          const filteredArray = req.subscriber.subscribedToService.filter(
            (item) => item !== messageArr[1]
          );
          req.subscriber.subscribedToService = filteredArray;
          if (req.subscriber.subscribedToService.length > 0) {
            const updatedSubscriber = await req.subscriber.save();
            sendMessage(`removed service ${messageArr[1]}`, req.body.From);
            res.json({ updatedSubscriber, message: "service removed" });
          } else {
            await req.subscriber.deleteOne();
            sendMessage(`Not subscribed to any service`, req.body.From);
            res.json({ message: "Not subscribed to any service " });
          }
        }

        //letting user know he is not subscribed to that service
        else {
          sendMessage(`unsupported service`, req.body.From);
          res.json({ record: req.subscriber, message: "wrong service" });
        }
      }
      //if user is not subscribed
      else {
        sendMessage(`not subscribed to any service`, req.body.From);
        res.json({ message: "Not subscribed to any service" });
      }
    } else {
      sendMessage(
        `invalid message \n send {Start/Stop <service code> <postalcode> <countrycode>}`,
        req.body.From
      );
      res.json({ message: "Invalid Message" });
    }
  } else {
    sendMessage(`invalid service \n try FOR/WEA`, req.body.From);
    res.json({ message: "Invalid Service" });
  }
});

//getting the data of subscriber
async function getSubscriber(req, res, next) {
  let subscriber;
  try {
    subscriber = await Subscriber.findOne({ number: req.body.From });
  } catch (err) {
    console.log({ message: "Error in middleware \n" + err.message });
  }
  req.subscriber = subscriber;
  next();
}

module.exports = router;
