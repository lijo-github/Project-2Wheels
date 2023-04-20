const mongoose = require('mongoose')
require('dotenv').config()
 
// //*Database connection */


const url = process.env.MONGODB_URL;

const connectDB = async ()=>{
  try{
    await mongoose.connect(url,{
      useUnifiedTopology: true,
      useNewUrlParser: true,

    })
  }catch(err){
    console.error(err);
    process.exit(1)
  }
}

module.exports= connectDB
