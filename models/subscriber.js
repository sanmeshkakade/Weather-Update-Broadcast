const mongoose = require("mongoose");

const subcribersSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  subscribeToService: {
    services: [
      {
        type: String,
      },
    ],
    required: true,
  },
  subscribeDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  postalCode: {
    type: Number,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  timeOffset: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Subscriber", subcribersSchema);
