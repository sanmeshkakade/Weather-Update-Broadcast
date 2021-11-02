const express = require("express");
const router = express.Router();
const Subscriber = require("../models/subscriber");
const fetch = require("node-fetch-commonjs");
const { request } = require("express");

//subscribing to a service
router.post("/", getSubscriber, async (req, res) => {
  const messageArr = req.body.Body.split(" ");
  if (req.body.Body.substring(0, 5) === "Start") {
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
        res.status(201).json({ newSubscriber, message: "New Sub User" });
      } catch (err) {
        res.status(400).json({ messsage: err.message });
      }
    } else {
      //if user is already subscribed

      //check if he wants to subscribe to old service or new service
      if (req.subscriber.subscribedToService.includes(messageArr[1])) {
        console.log(
          "code to send user, let know, that he is already subscribed."
        );
        res.json({ message: "Already Subscribed to services" });
      }

      //adding new service to the number
      else {
        req.subscriber.subscribedToService.push(messageArr[1]);
        try {
          const updatedSubscriber = await req.subscriber.save();
          console.log("cose to inform user that new serv has been subscribed.");
          res.json({ updatedSubscriber, message: "New service added" });
        } catch (err) {
          console.log(err);
        }
      }
    }
  } else if (req.body.Body.startsWith("Stop")) {
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
          console.log("removed service");
          res.json({ updatedSubscriber, message: "service removed" });
        } else {
          await req.subscriber.remove();
          console.log("removed all service");
          res.json({ message: "Not subscribed to any service " });
        }
      }

      //letting user know he is not subscribed to that service
      else {
        console.log("Wrong service");
        res.json({ record: req.subscriber, message: "wrong service" });
      }
    }
    //if user is not subscribed
    else {
      console.log("send him that he has not subscribed to any service.");
      res.json({ message: "Not subscribed to any service" });
    }
  } else {
    console.log("Invalid Message");
    res.status(404).json({ message: "Invalid Message" });
  }
});

//getting the data of subscriber
async function getSubscriber(req, res, next) {
  let subscriber;
  try {
    subscriber = await Subscriber.findOne({ number: req.body.From });
    if (subscriber == undefined) {
      next();
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  req.subscriber = subscriber;
  next();
}

const sendMessage = async () => {
  console.log("code to send message");
};

module.exports = router;
