const dotenv =require("dotenv")
dotenv.config()
// const twilio = require("twilio")
const accountSid = process.env.accountSid;
const   authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.verifySid;


const client = require('twilio')(accountSid, authToken);


 const twilioFunctions ={
    client,
    verifySid,
    generateOTP: async (mobNumber, channel) => {
      return client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${mobNumber}`, channel: channel });
    }
  }
 
  module.exports = twilioFunctions

