const user = require("../model/userModel.js");
const Product = require("../model/product.js");
const Category = require("../model/category.js");
const Cart = require("../model/cart.js");
const Banner = require("../model/banner.js");
const Coupon = require("../model/coupon.js");
const Wishlist = require("../model/wishlist.js")
const bcrypt = require("bcrypt");
const { Order, Address, OrderItem } = require("../model/order.js");
const moment = require("moment/moment");
const { body } = require("express-validator");

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

    updatePassword: async (id, newPassword) => {
      try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
      } catch (err) {
        console.error(err);
      }
    },

    //*get mobilenumber Helper  */

    getmobileNumber: async (mobNumber) => {
        try {
            const User = await user.findOne({ mobile: mobNumber });
            if (User) {
                return User;
            } else {
                console.log(User);
                return User;
            }
        } catch {
            console.log("*****erro occured*******");
            console.log(err);
        }
    },
    getUser: async (mob) => {
        try {
            const User = await user.findOne({ mobile: mob });
            if (User && User.status) {
                return User;
            }
            return false;
        } catch (err) {
            console.log(err);
        }
    },
    findUser: async (id) => {
        return await user.findById(id);
    },
    getAllProducts: async (userId) => {
        try {
            const products = await Product.find({
                productStatus: "Listed",
            }).populate("category");

            const categories = await Category.find({ isListed: true });

            const cartCount = await Cart.findById(userId);
            console.log(cartCount);

            return { products, categories };
        } catch (err) {
            console.error(err);
        }
    },
    getProductQuantity: async(productId)=> {
        const product = await Product.findById(productId);
        if (product && product.productQuantity !== null) {
          return product.productQuantity;
        }
        return 0;
      },


    getAllProductsForList: async (categoryId, sort, userId) => {
        try {
            let sortOption = { productPrice: -1 };
            if (sort == "price-asc") {
                sortOption = { productPrice: 1 };
            }
            const productsQuery = Product.find({ category: categoryId }).populate("category").sort(sortOption);

            const products = await productsQuery.exec();

            const cart = await Cart?.findOne({ user: userId });

            if (cart) {
                for (const product of products) {
                    const isProductInCart = cart.products.some((prod) => prod.productId.equals(product._id));
                    product.isInCart = isProductInCart; // Add a boolean flag to indicate if the product is in the cart
                }
            }

            return products;
        } catch (err) {
            console.error(err);
        }
    },
    //*banner list  *//
    getListedBanner: async () => {
        try {
            const banners = await Banner.find({ status: true }, { image: 1, _id: 0, headline: 1, additionalInfo: 1 });
            return banners;
        } catch (err) {
            console.error(err);
        }
    },
    getProductDetails: async (slug, userId) => {
        try {
            const product = await Product.findOne({slug:slug});
    
          if (!product) {
            throw new Error("Product not found"); // Handle case where product does not exist
          }
    
          const cart = await Cart.findOne({
            user: userId,
            "products.productId": product._id,
          });
    
          if (cart) {
            console.log(cart,'%^&*%^%*%*%&**%%**%*%&*%%&*%&*%&*%&*%^');
            product.isInCart = true; // Add a boolean flag to indicate if the product is in the cart
          } else {
            product.isInCart = false; // Add a boolean flag to indicate if the product is in the cart
          }
    
          return product;
        } catch (err) {
          console.error(err);
        }
      },
    getCartProducts: async (userId) => {
        try {
            const cart = await Cart.findOne({ user: userId }).populate("products.productId");
            if (!cart || cart.products.length <= 0) {
                return null;
            }
            const cartItems = cart.products.map((item) => {
                const { productId, quantity } = item;
                const { _id, productName, productModel, productPrice, productImage } = productId;
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
    getCheckoutProducts: async (userId) => {
        try {
            const cart = await Cart.findOne({ user: userId }).populate("products.productId");
            if (!cart || cart.products.length <= 0) {
                return null;
            }
            let isAllProductsInStock = true;
            const cartItems = cart.products.map((item) => {
                const { productId, quantity } = true;
                const { _id, productName, productModel, productPrice, productImage, productQuantity: stock } = productId;
                const totalPrice = productPrice * quantity;

                if (quantity > stock) {
                    isAllProductsInStock = false;
                }
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
            if (!isAllProductsInStock) {
                return false;
            }
            return { cartItems, subtotal };
        } catch (err) {
            console.error(err);
            throw new Error("Error getting cart products");
        }
    },
    // addToCart: async (productId, userId) => {
    //     const isProductExist = await Cart.findOne({
    //         user: userId,
    //         "products.productId": productId,
    //     });

    //     if (isProductExist) {
    //         await Cart.updateOne({ user: userId, "products.productId": productId }, { $inc: { "products.$.quantity": 1 } });
    //     } else {
    //         await Cart.updateOne({ user: userId }, { $push: { products: { productId, quantity: 1 } } }, { upsert: true });
    //     }
    // },
    addToCart: async (productId, userId) => {
        try {
          // Find the product
          const product = await Product.findById(productId);
          if (!product) {
            return { success: false, error: "Product not found." };
          }
      
          // Check if the product quantity is sufficient
          if (product.productQuantity <= 0) {
            return { success: false, error: "Product out of stock." };
          }
      
          // Decrease the product quantity by 1 and save the updated product
          product.productQuantity -= 1;
          await product.save();
      
          // Add the product to the user's cart
          const cart = await Cart.findOne({ user: userId });
          if (cart) {
            // If the cart already exists, update the quantity of the existing product
            const existingProduct = cart.products.find((p) => p.productId.toString() === productId);
            if (existingProduct) {
              existingProduct.quantity += 1;
            } else {
              // If the product doesn't exist in the cart, add it with quantity 1
              cart.products.push({ productId, quantity: 1 });
            }
            await cart.save();
          } else {
            // If the cart doesn't exist, create a new cart and add the product
            const newCart = new Cart({
              user: userId,
              products: [{ productId, quantity: 1 }],
            });
            await newCart.save();
          }
      
          return { success: true };
        } catch (error) {
          console.error(error);
          return { success: false, error: "An error occurred while adding the product to the cart." };
        }
      },
      
    updateQuantity: async (userId, productId, count) => {
        try {
          const cart = await Cart.findOne({ user: userId });
          const product = cart.products.find(
            (p) => p.productId.toString() === productId
          );
          if (!product) {
            throw new Error("Product not found in cart");
          }
          // Calculate new quantity
          const newQuantity = product.quantity + parseInt(count);
    
          if (newQuantity < 0) {
            return false;
          }
    
          // Update product quantity in the database
          const productToUpdate = await Product.findById(productId);
          const updatedProductQuantity =
            count === "1"
              ? productToUpdate.productQuantity - 1
              : productToUpdate.productQuantity + 1;
    
          if (updatedProductQuantity < 0) {
            return false;
          }
    
          if (newQuantity === 0) {
            // If new quantity is 0, remove product from cart
            await Cart.findOneAndUpdate(
              { user: userId },
              { $pull: { products: { productId: productId } } },
              { new: true }
            );
          } else {
            // Otherwise, update product quantity in cart and save cart
            cart.products.id(product._id).quantity = newQuantity;
            await cart.save();
          }
    
          await Product.findByIdAndUpdate(productId, {
            $set: { productQuantity: updatedProductQuantity },
          });
    
          return true;
        } catch (err) {
          console.error(err);
          return false;
        }
      },
    //   removeProductFromCart: async ({ cart, product }) => {
    //     try {
    //       const cartDoc = await Cart.findOne({ user: cart }); // Find the cart document
    //       if (!cartDoc) {
    //         throw new Error("Cart not found");
    //       }
    //       // Find the product document
    //       const productDoc = await Product.findById(product);
    //       console.log(productDoc);
    //       if (!productDoc) {
    //         throw new Error("Product not found");
    //       }
    
    //        // Find the index of the product in the cart
    //       const productIndex = cartDoc.products.findIndex(
    //         (p) => p.productId.toString() === product
    //       );
    //       // console.log(productIndex);
    
    //       if (productIndex === -1) {
    //         throw new Error("Product not found in cart");
    //       }
    //       // Remove the product from the cart
    //       cartDoc.products.splice(productIndex, 1);
    //       await cartDoc.save();
    //       return;
    //     } catch (err) {
    //       console.error(err);
    //     }
    //   },
    removeProductFromCart: async ({ cart, product }) => {
        try {
          const cartDoc = await Cart.findOne({ user: cart }); // Find the cart document
          if (!cartDoc) {
            throw new Error("Cart not found");
          }
      
          // Find the product document
          const productDoc = await Product.findById(product);
          if (!productDoc) {
            throw new Error("Product not found");
          }
      
          // Find the index of the product in the cart
          const productIndex = cartDoc.products.findIndex(
            (p) => p.productId.toString() === product
          );
      
          if (productIndex === -1) {
            throw new Error("Product not found in cart");
          }
      
          // Update the product quantity and save the updated product
          productDoc.productQuantity += cartDoc.products[productIndex].quantity;
          await productDoc.save();
      
          // Remove the product from the cart
          cartDoc.products.splice(productIndex, 1);
          await cartDoc.save();
        } catch (err) {
          console.error(err);
          throw new Error("An error occurred while removing the product from the cart.");
        }
      },
      
    addToCartFromWish: async (productId, userId) => {
        // Find product
        const product = await Product.findById(productId);
    
        if (!product) {
          throw new Error("Product not found");
        }
    
        const quantity = product.productQuantity;
    
        if (quantity <= 0) {
          return false;
        }
    
        await Cart.updateOne(
          { user: userId },
          { $push: { products: { productId, quantity: 1 } } },
          { upsert: true }
        ).then(() => {
          return Wishlist.findOneAndUpdate(
            { userId: userId },
            { $pull: { items: { productId: productId } } },
            { new: true }
          );
        });
        return true;
      },
      removeProdctFromWishLIst: async (userId, productId) => {
        try {
          const response = await Wishlist.findOneAndUpdate(
            { userId: userId },
            { $pull: { items: { productId: productId } } },
            { new: true }
          );
    
          return;
        } catch (err) {
          console.error(err);
        }
      },

      getCartCount: async (userId) => {
        try {
          const cartCount = await Cart.findOne({ user: userId });
          const productCount = cartCount?.products.length;
          if (!productCount) return 0;
    
          return productCount;
        } catch (err) {
          console.error(err);
        }
      },
    getAddress: async (userId) => {
        try {
            const isAddressExit = await Address.find({ user_id: userId }).sort({ default_adress: -1 });
            if (isAddressExit) {
                return isAddressExit;
            }
            return isAddressExit;
        } catch (err) {
            console.error(err);
        }
    },
    getDefaultAddress: async (userId) => {
        try {
            const address = await Address.find({ user_id: userId });
            return address.find((item) => {
                return item.default_address == true;
            });
        } catch (err) {
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
            await Address.updateMany({ user_id: userId }, { default_address: false }, { upsert: true, new: true });
            await Address.findByIdAndUpdate(id, { default_address: true }, { new: true });
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
    placeOrder: async (userId, PaymentMethod, totalAmount, couponCode, address) => {
        try {
            let id = address?.addressId;

            if (id) {
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
            }
            //create new  address
            else {
                const newAddress = new Address({
                    user_id: userId,
                    full_name: address.name,
                    street_name: address.Streetaddress,
                    apartment_number: address.appartments,
                    city: address.city,
                    state: address.state,
                    postal_code: address.postalcode,
                    mobile_Number: address.mobileNumber,
                    default_address: true,
                });

                const response = await newAddress.save();

                id = response._id;
            }

            const cart = await Cart.findOne({ user: userId }).populate("products.productId");

            const cartItems = cart.products.map((item) => {
                const { productId, quantity } = item;
                const { _id, productName, productModel, productPrice, productImage } = productId;
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

            //extracting totalamount
            let subtotal = 0;
            if (isNaN(totalAmount)) {
                cartItems.forEach((item) => {
                    subtotal += item.product.productPrice * item.quantity;
                });
            } else {
                subtotal = totalAmount;
                const coupon = await Coupon.findOne({ code: couponCode });
                if (coupon) {
                    coupon.usedBy.push(userId);
                    await coupon.save();
                }
            }

            // Create a new order

            let status = "";
            if (PaymentMethod === "cash_on_delivery") {
                status = "Placed";
            } else if (PaymentMethod === "wallet") {
                const User = await user.findById(userId);

                if (User.wallet >= subtotal) {
                    User.wallet -= parseInt(subtotal);
                    await User.save();
                    status = "Placed";
                    var paymentStatus = "paid";
                } else {
                    status = "Payment Pending";
                }
            } else if (PaymentMethod == "online_payment") {
                status = "Payment Pending";
                const newOrder = new Order({
                    user_id: userId,
                    total_amount: subtotal,
                    address: id,
                    payment_method: PaymentMethod,
                    payment_status: paymentStatus,
                    order_status: status,
                    items: [],
                });

                const orderedItems = await Promise.all(
                    cartItems.map(async (item) => {
                        const orderedItem = new OrderItem({
                            productName: item.product.productName,
                            product_id: item.product._id,
                            quantity: item.quantity,
                            unit_price: item.totalPrice,
                        });
                        await orderedItem.save();
                        return orderedItem;
                    })
                );

                newOrder.items = newOrder.items.concat(orderedItems);

                // Save the new order to the database
                const savedOrder = await newOrder.save();
                return savedOrder;
            }

            const newOrder = new Order({
                user_id: userId,
                total_amount: subtotal,
                address: id,
                payment_method: PaymentMethod,
                payment_status: paymentStatus,
                order_status: status,
                items: [],
            });

            const orderedItems = await Promise.all(
                cartItems.map(async (item) => {
                    const orderedItem = new OrderItem({
                        productName: item.product.productName,
                        product_id: item.product._id,
                        quantity: item.quantity,
                        unit_price: item.totalPrice,
                    });
                    await orderedItem.save();

                    // Update product quantity in product collection
                    const product = await Product.findById(item.product._id);
                    if (product) {
                        // Subtract ordered quantity from product quantity
                        product.productQuantity -= item.quantity;
                        await product.save();
                    }

                    return orderedItem;
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
    changeOnlinePaymentStatus: async (orderId, userId) => {
        try {
            const order = await Order.findById(orderId);
            const orderItems = order?.items;
            await Promise.all(
                orderItems.map(async (item) => {
                    const product = await Product.findById(item.product_id);
                    if (product) {
                        // Add returned quantity to product quantity
                        product.productQuantity -= item.quantity;
                        await product.save();
                    }
                })
            );
            await Order.findByIdAndUpdate(
                orderId,
                {
                    payment_status: "paid",
                    order_status: "Placed",
                },
                {
                    new: true,
                }
            );
            await Cart.deleteMany({ user: userId });
        } catch (err) {
            console.error(err);
        }
    },
    getOrderHistory: async (userId) => {
        try {
            const orders = await Order.find({ user_id: userId }).populate("address").populate("items.product_id").exec();
            if (orders.length === 0) {
                console.log("No orders found for user", userId);
            }
            return orders;
        } catch (err) {
            console.error(err);
        }
    },
    cancelOrder: async (orderId) => {
        console.log("order id:", orderId);
        try {
            await Order.updateOne({ _id: orderId }, { $set: { order_status: "Cancelled" } });

            // Retrieve updated order
            const order = await Order.findOne({ _id: orderId });
            console.log("+++++++++++++++++++++++++", order);

            // Retrieve user
            const userId = order.user_id;

            const User = await user.findOne({ _id: userId });
            console.log("cancel ***********************", user);

            // Update user's wallet balance (if payment method is 'onlinePayment')

            if (order.payment_method === "online_payment") {
                if (User.wallet) {
                    User.wallet += order.total_amount;
                } else {
                    User.wallet = order.total_amount;
                }
                await User.save(); // Save updated user object
            }
        } catch (err) {
            console.log("helper cancel error");
            console.error(err);
        }
    },

    returnOrder: async (orderId, reason) => {
        try {
            await Order.updateMany(
                { _id: orderId },
                {
                    $set: {
                        order_status: "Returned",
                        return_status: "pending",
                        return_reason: reason,
                    },
                }
            );
        } catch (err) {
            console.error(err);
        }
    },

    getCoupons: async (userId) => {
        try {
            const coupons = await Coupon.find();
            const unusedCouponsWithDaysRemaining = coupons
                .filter((coupon) => !coupon.usedBy.includes(userId)) // Filter out coupons with usedBy field
                .map((coupon) => {
                    const current_date = moment();
                    const expiration_date = moment(coupon.expirationDate);
                    coupon.days_remaining = expiration_date.diff(current_date, "days");
                    return coupon;
                });
            return unusedCouponsWithDaysRemaining;
        } catch (err) {
            console.error(err);
        }
    },
    
    applyCoupon: async (couponCode, totalAmount, userId) => {
        try {
            const coupon = await Coupon.findOne({ code: couponCode });
            if (coupon) {
                if (coupon.usedBy.includes(userId)) {
                    var discountAmount = {};
                    discountAmount.status = false;
                    return discountAmount;
                }
                let discount = (totalAmount / coupon.discount) * 100;
                let maxdiscount = coupon.maxdiscount;
                if (maxdiscount < discount) {
                    var discountAmount = {};
                    let disPrice = totalAmount - maxdiscount;
                    discountAmount.couponCode = coupon.code;
                    discountAmount.disAmount = maxdiscount;
                    discountAmount.disPrice = disPrice;
                    discountAmount.status = true;
                    return discountAmount;
                } else {
                    var discountAmount = {};
                    let disPrice = totalAmount - maxdiscount;
                    discountAmount.couponCode = coupon.code;
                    discountAmount.disAmount = maxdiscount;
                    discountAmount.disPrice = disPrice;
                    discountAmount.status = true;
                    return discountAmount;
                }
            }
        } catch (err) {
            console.error(err);
        }
    },

    searchQuery: async (query, userId) => {
        try {
            const products = await Product.find({
                $or: [
                    { productName: { $regex: query, $options: "i" } },
                    { productModel: { $regex: query, $options: "i" } },
                    { productDescription: { $regex: query, $options: "i" } },
                ],
            }).populate("category");
            if (products.length > 0) {
                const cart = await Cart?.findOne({ user: userId });
                if (cart) {
                    for (const product of products) {
                        const isProductInCart = cart.products.some((prod) => prod.productId.equals(product._id));
                        product.isInCart = isProductInCart;
                    }
                }
                return products;
            }
            return null;
        } catch (err) {
            console.error(err);
            
        }
    },

    sortQuery: async (sort, userId) => {
        try {
          let sortOption = { productPrice: -1 }; // Default sort by productPrice in ascending order
    
          if (sort === "price-desc") {
            sortOption = { productPrice: 1 }; // Sort by productPrice in descending order
          }
    
          const products = await Product.find({})
            .populate("category")
            .sort(sortOption);
          if (products.length > 0) {
            const cart = await Cart?.findOne({ user: userId });
    
            if (cart) {
              for (const product of products) {
                const isProductInCart = cart.products.some((prod) =>
                  prod.productId.equals(product._id)
                );
                product.isInCart = isProductInCart; // Add a boolean flag to indicate if the product is in the cart
              }
            }
            return products;
          }
          return null;
        } catch (err) {
          console.error(err);
        }
      },

    addToWishListUpdate: async (userId, productId) => {
        try {
          const wishlistDoc = await Wishlist.findOne({ userId: userId });
          if (!wishlistDoc) {
            // If wishlist doesn't exist for user, create a new one
            const newWishlist = new Wishlist({
              userId: userId,
              items: [
                {
                  productId: productId,
                  addedAt: new Date(),
                },
              ],
            });
            await newWishlist.save();
          } else {
            // Check if the product is already present in the wishlist
            const productIndex = wishlistDoc.items.findIndex(
              (item) => item.productId.toString() === productId
            );
    
            if (productIndex !== -1) {
              // If the product is already present, remove it and return 'removed' status
              await Wishlist.findOneAndUpdate(
                { userId: userId },
                { $pull: { items: { productId: productId } } },
                { new: true }
              );
              return "removed";
            }
    
            // If the product is not already present, add it to the wishlist
            wishlistDoc.items.push({
              productId: productId,
              addedAt: new Date(),
            });
            await wishlistDoc.save();
          }
        } catch (err) {
          console.error(err);
        }
      },
    showWishList: async (userId) =>{
        try{
            const wishlistDoc = await Wishlist.findOne({
                userId: userId}).populate({
                    path: "items.productId",
                    select: "productName productModel porductPrice productQuantity productImage _id",
                    populate: {
                        path: "category",
                        select: "categoryName _id",
                    },
                });
                if(!wishlistDoc){
                    // if wishlist doesn't exist, return an empty array
                    return [];
                }else{
                    //if wishlist exist , return the items array with product details
                    return wishlistDoc.items;
                }
        }catch(err){
            console.error(err);
            return [];
        }
    },

    countWish: async (userId) => {
        try {
          const wishCount = await Wishlist.findOne({ userId: userId });
          const productCount = wishCount?.items.length;
          if (!productCount) return 0;
          return productCount;
        } catch (err) {
          console.error(err);
        }
      },

      getUserWalletAmount: async(userId) =>{
        try {
          const User = await user.findOneAndUpdate(userId);
          return User.wallet;
        } catch (err) {
          console.error(err);
          throw new Error('Error getting user wallet amount');
        }
      },

      
}
