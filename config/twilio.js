const dotenv =require("dotenv")
dotenv.config()
// const twilio = require("twilio")
const username = process.env.username;
const   password = process.env.password;
const verifySid = process.env.verifySid;


const client = require('twilio')(username, password);


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

