require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const msgServiceSid = process.env.TWILIO_MessagingServiceSid;
const twilio = require("twilio");
const client = new twilio(accountSid, authToken);

const sendMessage = async (body, toNumber) => {
  client.messages
    .create({
      body: body,
      messagingServiceSid: msgServiceSid,
      to: toNumber,
    })
    .then((message) => console.log(message.sid));
};

const sendMessageToList = async (currentNumbers, weatherMessagesSet) => {
  Promise.all(
    currentNumbers.map(async (sub) => {
      await sendMessage(
        weatherMessagesSet[sub.postalCode + " " + sub.countryCode],
        sub.number
      );
    })
  );
};

module.exports = { sendMessage, sendMessageToList };
