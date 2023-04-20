const { body } = require("express-validator");
const user = require("../model/userModel");
const Product = require("../model/product.js")
const Category = require("../model/category.js")
const bcrypt = require("bcrypt");
const { category } = require("../controllers/admin-controller");

module.exports = {

  //*signup Helper  */

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

  //*get mobilenumber Helper  */


  getmobileNumber: async(mobNumber)=>{
    try{
      const User = await user.findOne({mobile:mobNumber})
      if(User){
        return User
      }else{
        console.log(User)
        return User
      }
    }catch{
      console.log('*****erro occured*******');
      console.log(err);
    }
  },
  getUser: async(mob)=>{
    try{
      const User = await user.findOne({mobile:mob});
      if(user && User.status){
        return User;

      }return false;
    }catch(err){
      console.log(err);
    }
  },
  findUser: async(id)=>{
    return await user.findById(id)
  },
  getAllProducts: async (userId) => {
    try {
      const products = await Product.find({
        productStatus: "Listed",
      }).populate("category");

      const categories = await Category.find({ isListed: true });

      // const cartCount = await Cart.findById(userId);
      // console.log(cartCount);

      return { products, categories };
    } catch (err) {
      console.error(err);
    }
  },
  getAllProductsForList: async(categoryId) =>{
    try{
      const productsQuery = Product.find({category:categoryId}).populate("category");

      const products = await productsQuery.exec();

      return products;
    }catch(erer){
      console.error(err);
    }
    

  }
  
};


