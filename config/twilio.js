const dotenv =require("dotenv")
dotenv.config()
// const twilio = require("twilio")
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const   authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.verifySid;


// client.verify.v2
//   .services(verifySid)
//   .verifications.create({ to: "+918606276113", channel: "sms" })
//   .then((verification) => console.log(verification.status))
//   .then(() => {
//     const readline = require("readline").createInterface({
//       input: process.stdin,
//       output: process.stdout,
//     });
//     readline.question("Please enter the OTP:", (otpCode) => {
//       client.verify.v2
//         .services(verifySid)
//         .verificationChecks.create({ to: "+918606276113", code: otpCode })
//         .then((verification_check) => console.log(verification_check.status))
//         .then(() => readline.close());
//     });
//   });
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

