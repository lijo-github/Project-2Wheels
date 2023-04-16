const { body } = require("express-validator");
const user = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports = {
  doSignup: (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        bcrypt.hash(body.password, 10, async (err, hash) => {
          if (err) {
            return reject(err);
          } else {
            const newUser = new user({
              name: body.name,
              mobile: body.mobile,
              email: body.email,
              password: hash,
            });
            await newUser.save();
            resolve(newUser);
          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  getmobileNumber: async(mobNumber)=>{
    try{
      const User = await user.findOne({mobile:mobNumber})
      console.log('******hello******');
      if(User){
        console.log(mobNumber);
        return User
      }else{
        console.log(User)
        return User
      }
    }catch{
      console.log('*****erro occured*******');
      console.log(err);
    }
  }
};


