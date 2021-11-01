const express = require("express");
const router = express.Router();
const Subscriber = require("../models/subscriber");

//subscribing to a service

//Getting all
router.get("/", (req, res) => {
  console.log(req);
  // try {
  //   const subscribers = await Subscriber.find();
  //   res.json(subscribers);
  // } catch (error) {
  //   res.status(500).json({ message: error.message });
  // }
});

router.post("/", (req, res) => {
  console.log(req.params, req.body, req.query, req.headers);
  res.json({ message: "received" });
});

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

module.exports = router;
