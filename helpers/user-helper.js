const user = require("../model/userModel");
const Product = require("../model/product.js")
const Category = require("../model/category.js")
const Cart = require("../model/cart.js")
const Banner = require("../model/banner")
const bcrypt = require("bcrypt");
const {Order,Address, OrderItem}= require("../model/order.js")



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
    

  },
  //*banner list  *//
  getListedBanner: async()=>{
    try{
<<<<<<< HEAD
        const banners = await Banner.find({ status: true}, {image:1 ,_id:0,headline:1, additionalInfo:1});
=======
        const banners = await Banner.find({ status: true}, {image:1 ,_id:0});
>>>>>>> 0b7da8e43902f1241da174055d35b7e32691b06d
        return banners;
    }catch(err){
        console.error(err);
    }
},
  getProductDetails: async (proId) => {
    try {
      const product = await Product.findById(proId);
      return product;
    } catch (err) {
      console.error(err);
    }
  },
  getCartProducts: async (userId) => {
    try {
      const cart = await Cart.findOne({ user: userId }).populate(
        "products.productId"
      );
      if (!cart || cart.products.length <= 0) {
        return null;
      }
      const cartItems = cart.products.map((item) => {
        const { productId, quantity } = item;
        const { _id, productName, productModel, productPrice, productImage } =
          productId;
        const totalPrice = productPrice * quantity;
        return {
          item: _id,
          quantity,
          totalPrice,
          product: {
            _id,
            productName,
            productModel,
            productPrice,
            productImage,
          },
        };
      });
      let subtotal = 0;
      cartItems.forEach((item) => {
        subtotal += item.product.productPrice * item.quantity;
      });
      let cartCount = 0;

      return { cartItems, subtotal };
    } catch (err) {
      console.error(err);
      throw new Error("Error getting cart products");
    }
  },
  addToCart: async (productId, userId) => {
    const isProductExist = await Cart.findOne({
      user: userId,
      "products.productId": productId,
    });

    if (isProductExist) {
      await Cart.updateOne(
        { user: userId, "products.productId": productId },
        { $inc: { "products.$.quantity": 1 } }
      );
    } else {
      await Cart.updateOne(
        { user: userId },
        { $push: { products: { productId, quantity: 1 } } },
        { upsert: true }
      );
    }
  },
  updateQuantity: async (userId, productId, count) => {

    try {
      const cart = await Cart.findOne({ user: userId });
      const product = cart.products.find(
        (p) => p.productId.toString() === productId
      );
      console.log('id get ****************',productId);
      if (product.quantity === 1 && parseInt(count) === -1) {
        // await cart.products.id(product._id).delete();
        // await cart.save();
        await Cart.findOneAndUpdate(
          { user: userId },
          { $pull: { products: { productId: productId } } },
          { new: true }
        );
        console.log('product id get',productId);
      } else {
        console.log('else is worked',count);
        cart.products.id(product._id).quantity += parseInt(count);
        await cart.save();
      }
    } catch (err) {
      console.log('nothing get');
      console.error(err);
    }
  },
  removeProductFromCart: async({cart, product})=>{
    try{
      const updatedCart = await Cart.findOneAndUpdate({user: cart},
        {$pull: {products:{productId:product}}},
        {new:true}
        );

        if(!updatedCart){
          throw new Error('cart not found')
        }
        console.log(`Product ${product} removed from cart ${cart}`);
        return
    }catch(error){
      console.error(error.message);
    }
  },
  getCartCount: async (userId)=>{
    try{
      const cartCount = await Cart.findOne({user:userId});
      const productCount = cartCount?.products.length;
      return productCount;
    }catch(err){
      console.error(error);
    }
  },
  getAddress: async(userId)=>{
    try{
      const isAddressExit = await Address.find({user_id: userId,}).sort({default_adress: -1});
      if(isAddressExit){
        return isAddressExit;
      }
      return isAddressExit
    }catch(err){
      console.error(err);
    }
  },
  getDefaultAddress: async(userId)=>{
    try{
      const address = await Address.find({user_id:userId});
      return address.find((item)=>{
        return item.default_address == true;

      });
    }catch(err){
      console.error(err);
    }
  },
  addAddressPost: async (userId, address) => {
    try {
      const newAddress = new Address({
        full_name: address.name,
        street_name: address.Streetaddress,
        apartment_number: address.appartments,
        city: address.city,
        state: address.state,
        postal_code: address.postalcode,
        mobile_Number: address.mobileNumber,
        user_id: userId,
      });

      await newAddress.save();
    } catch (err) {
      console.error(err);
    }
  },
  updateAddress: async (id, userId) => {
    try {
      await Address.updateMany(
        { user_id: userId },
        { default_address: false },
        { upsert: true, new: true }
      );
      await Address.findByIdAndUpdate(
        id,
        { default_address: true },
        { new: true }
      );
    } catch (err) {
      console.error(err);
    }
  },
  deleteAddress: async (id) => {
    try {
      const deletedAddress = await Address.findByIdAndDelete(id);
      return deletedAddress;
    } catch (err) {
      console.log(err);
    }
  },
  placeOrder: async (userId, PaymentMethod, address) => {
    try {
      let id = address.addressId;

      const isAddressExist = await Address.findById(id);

      if (isAddressExist) {
        isAddressExist.full_name = address.name;
        isAddressExist.street_name = address.Streetaddress;
        isAddressExist.apartment_number = address.appartments;
        isAddressExist.city = address.city;
        isAddressExist.state = address.state;
        isAddressExist.postal_code = address.postalcode;
        isAddressExist.mobile_Number = address.mobileNumber;

        await isAddressExist.save();
      }

      const cart = await Cart.findOne({ user: userId }).populate(
        "products.productId"
      );

      const cartItems = cart.products.map((item) => {
        const { productId, quantity } = item;
        const { _id, productName, productModel, productPrice, productImage } =
          productId;
        const totalPrice = productPrice * quantity;
        return {
          item: _id,
          quantity,
          totalPrice,
          product: {
            _id,
            productName,
            productModel,
            productPrice,
            productImage,
          },
        };
      });

      let subtotal = 0;
      cartItems.forEach((item) => {
        subtotal += item.product.productPrice * item.quantity;
      });

      // Create a new order

      let status =
        address.paymentMethod === "cash_on_delivery"
          ? "Placed"
          : "Payment Pending";

      console.log(status);

      const newOrder = new Order({
        user_id: userId,
        total_amount: subtotal,
        address: id,
        payment_method: PaymentMethod,
        order_status: status,
        items: [],
      });

      const orderedItems = await Promise.all(
        cartItems.map(async (item) => {
          const orderedItem = new OrderItem({
            product_id: item.product._id,
            quantity: item.quantity,
            unit_price: item.totalPrice,
          });
          return orderedItem.save();
        })
      );

      newOrder.items = newOrder.items.concat(orderedItems);

      // Save the new order to the database
      const savedOrder = await newOrder.save();

      await Cart.deleteMany({ user: userId });
      return savedOrder;
    } catch (err) {
      console.error(err);
    }
  },

  

  
};


