const express = require("express");
const Router = express.Router();
const Subscriber = require("../models/subscriber");

//subscribing to a service

//getting the data of subscriber
async function getSubscriber(req, res, next) {
  let subscriber;
  try {
    subscriber = await Subscriber.findById(req.params.id);
    if (subscriber == null) {
      return res.status(404).json({ message: "Cannot find subscriber" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  res.subscriber = subscriber;
  next();
}
