const user = require("../model/userModel");
const userHelper = require("../helpers/user-helper");
const bcrypt = require("bcrypt");
const twilioFunctions = require("../config/twilio.js");
const Cart = require("../model/cart");


module.exports = {
    //*get home Page  */

    homePage: async (req, res, next) => {
        
        let user = req.session.user;
        try {
            const allProductWithCategory = await userHelper.getAllProducts();
            const products = allProductWithCategory.products;
            const categories = allProductWithCategory.categories;
            const banners = await userHelper.getListedBanner();
            

            if (user) {
                user.count = await userHelper.getCartCount(user._id);
                res.render("user/userLandingPage", { user, products, categories, banners });
            } else {
                
                res.render("user/userLandingPage", { user, products, categories , banners });
            }
        } catch (err) {
            console.error(err);
        }
    },

    //*get login Page  */

    login: (req, res) => {
        if (req.session.user) {
            res.redirect("/");
        } else res.render("user/login", { message: false, user: false });
    },

    //*get signup Page  */

    getsignup: (req, res) => {
        res.render("user/signup");
    },

    //*post signup Page  */

    postsignup: async (req, res) => {
        try {
            const userData = await userHelper.doSignup(req.body);
            if (userData) {
                console.log(userData);
                res.render("../views/user/login", { message: false });
            } else {
                req.session.user = userData;
                req.session.loggedIn = true;
                res.redirect("/");
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error.message);
        }
    },
    //*post signup Page  */

    postLogin: (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        user.findOne({ email }).then((user) => {
            if (user && user.status) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result) {
                        req.session.user = user;
                        req.session.loggedIn = true;
                        // console.log(req.session.user);
                        res.redirect("/");
                    } else {
                        return res.render("user/login", { message: "Invalid password", user: false });
                    }
                });
            } else if (user && user.status == false) {
                console.log("user blocked!");

                res.render("user/login", { message: "You were blocked..!!" });
            } else {
                console.log("user not found!!");

                res.render("user/login", { message: "user not found!!" });
            }
        });
    },

    //*get userlogout Page  */

    userLogout: (req, res) => {
        req.session.loggedIn = false;
        delete req.session.user;
        req.session.destroy();
        res.redirect("/");
    },

    //*get otp Page  */

    otpLogin: (req, res) => {
        if (req.session.user) {
            res.redirect("/login");
        } else res.render("user/otp-login", { message: false });
    },

    //*post signup Page  *//

    otpLoginPost: async (req, res) => {
        console.log(req.body);
        const mobNumber = req.body.mobile;
        try {
            console.log("++++++++++++");
            const validUser = await userHelper.getmobileNumber(mobNumber);
            if (validUser !== undefined && validUser !== false) {
                console.log(validUser);
                twilioFunctions
                    .generateOTP(mobNumber, "sms")
                    .then((verification) => {
                        console.log(req.body);
                        console.log("=============");
                        res.render("../views/user/verify-otp-forPassword", {
                            loginErr: false,
                            user: false,
                            mobile: mobNumber,
                            message: false,
                        });
                        console.log(verification.status);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.render("../views/user/otp-login", { otpErr: true, loginErr: false, user: false, block: false });
                    });
            } else if (validUser == undefined) {
                res.render("../views/user/otp-login", {
                    otpErr: false,
                    block: false,
                    loginErr: true,
                    user: false,
                    message: false,
                });
            } else {
                res.render("../views/user/otp-login", { otpErr: false, block: true, loginErr: false, user: false });
            }
        } catch (err) {
            console.error(err);
        }
    },

    //*post resend Page  */

    resendOtp: async (req, res) => {
        if (req.session.loggedIn) {
            res.redirect("/");
            return;
        }

        try {
            const mobNumber = req.query.mobile;
            console.log(mobNumber);

            if (!mobNumber) {
                return res.render("../views/user/verify-otp-forPassword", {
                    status: "error",
                    message: "Invalid phone number",
                });
            }

            const verification = await twilioFunctions.generateOTP(mobNumber, "sms");

            if (verification.status === "pending") {
                return res.json({ status: "success" });
            } else {
                return res.status(500).json({ status: "error", message: "Failed to generate OTP" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: "error", message: "Internal server error" });
        }
    },

    //*post verify otp  */

    verifyOtp: async (req, res) => {
        let mobNumber = req.body.mobile;
        console.log(req.body);
        try {
            const validUser = await userHelper.getmobileNumber(mobNumber);
            const enteredOTP = req.body.code;
            twilioFunctions.client.verify.v2
                .services(twilioFunctions.verifySid)
                .verificationChecks.create({ to: `+91${mobNumber}`, code: enteredOTP })
                .then((verification_check) => {
                    if (verification_check.status === "approved") {
                        req.session.user = validUser;;
                        req.session.loggedIn = true;
                        if (req.session.user) {
                            res.redirect("/");
                        }
                    } else {
                        res.render("../views/user/verify-mobile", {
                            loginErr: true,
                            user: false,
                            mobile: mobNumber,
                            message: false,
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send("internal server error");
                });
        } catch (err) {
            console.error(err);
        }
    },

    //*post verify otpforPassword */

    verifyOtpforpassword: async (req, res) => {
        try {
            const mobileNum = req.body.mobile;
            const user = await userHelper.getUser(mobileNum);
            const enteredOTP = req.body.code;
            twilioFunctions.client.verify.v2
                .services(twilioFunctions.verifySid)
                .verificationChecks.create({ to: `+91${mobNumber}`, code: enteredOTP })
                .then((verification_check) => {
                    if (verification_check.status === "approved") {
                        req.session.user = user;
                        console.log(user);
                        res.render("change-password");
                    } else {
                        res.render("verify-otp-forPassword", { loginErr: true, user: false, mobile: mobileNum });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    res.render("verify-otp-forPassword", { loginErr: true, user: false, mobile: mobileNum });
                });
        } catch (err) {
            console.error(err);
        }
    },
    listProductCategory: async (req, res) => {
        try {
            let user = req.session.user;
            const categoryId = req.query.category;
            const products = await userHelper.getAllProductsForList(categoryId);
            if (user) {
                res.render("productList", { user, products });
            } else {
                res.render("productList", { user: false, products });
            }
        } catch (err) {
            console.error(err);
        }
    },
    productView: async (req, res) => {
        const user = req.session?.user;
        
        try {
            
            if(user){
                user.count = await userHelper.getCartCount(user._id);
     
                var products = await userHelper.getProductDetails(req.params.id);

            console.log("product list view success");

            res.render("user/product-view", { user, products});
            }else{
                var products = await userHelper.getProductDetails(req.params.id);

            console.log("product list view success");

            res.render("user/product-view", { user, products});
            }
            
            
        } catch (err) {
            console.error(err);
        }
    },
    cartPage: async (req, res) => {
        try {
            let user = req.session.user;
            user.count = await userHelper.getCartCount(user._id);

            const items = await userHelper.getCartProducts(req.session.user._id);
            if (items === null) {
                res.render("../views/user/emptyCart", { user});
                return;
            }

            const { cartItems: products, subtotal } = items;

            res.render("user/cart", { user, products, total: subtotal });
        } catch (err) {
            res.render("catchError", {
                message: err.message,
                user: req.session.user,
            });
        }
    },

    addToCart: async (req, res) => {
        try {
            await userHelper.addToCart(req.params.id, req.session.user._id);
            res.json({
                status: "success",
                message: "product added to cart",
            });
        } catch (err) {
            console.error(err);
        }
    },
    changeProductQuantity: async (req, res) => {
        try {
            const { userId, prodId, count } = req.body;
            console.log("got here", userId, prodId, count);
            await Cart.updateOne(
                { user: userId, "products.productId": prodId },
                {
                    $inc: {
                        "products.$.quantity": count,
                    },
                }
            );

            res.status(200).json({ error: false, message: "Product quantity has been changed successfully" });

            //   if (!Array.isArray(product)) {
            //     throw new Error('Invalid product data');
            //   }

            //   if (product.length < 3) {
            //     throw new Error('Product data must have at least three elements');
            //   }

            //   const [userId, productId, count] = product;

            //   console.log(product);

            //   await userHelper.updateQuantity(userId, productId, count);

            //   res.json({ status: "success" });
        } catch (err) {
            console.error(err);
            res.json({ status: "error" });
        }
    },
    removeProductFromCart: async (req, res) => {
        try {
            
            console.log(req.body);
            await userHelper.removeProductFromCart(req.body);
            res.json({ status: "success", message: "product added to cart", });
        } catch (err) {
            console.error(error);
        }
    },
    checkOut: async (req, res) => {
        try {
          let user = req.session.user;
          const items = await userHelper.getCartProducts(req.session.user._id);
          const address = await userHelper.getDefaultAddress(req.session.user._id);
          console.log('adress not get',address);
          const { cartItems: products, subtotal } = items;
          res.render("../views/user/checkout", { user, products, subtotal, address});
        } catch (err) {
          console.error(err);
        }
      },
      placeOrderPost: async (req, res) => {
        try {
          const { userId, paymentMethod } = req.body;
    
          const response = await userHelper.placeOrder(
            userId,
            paymentMethod,
            req.body
          );
          console.log(response);
          res.json({ status: "success" });
        } catch (err) {
          console.error(err);
          res.json({ status: "error" });
        }
      },
      addAddress: async (req, res) => {
        try {
            
          res.render("../views/user/add-address", { user: req.session.user});
        } catch (err) {
          console.error(err);
        }
      },
      selectAddress: async (req, res) => {
        try {
          const address = await userHelper.getAddress(req.session.user._id);
          res.render("../views/user/address", { user: req.session.user, address });
        } catch (err) {
          console.error(err);
        }
      },
      addAddressPost: async (req, res) => {
        try {
          let { userId } = req.body;
          let address = req.body;
          await userHelper.addAddressPost(userId, address);
          res.redirect("/address");
        } catch (err) {
          console.error(err);
        }
      },
      select: async (req, res) => {
        try {
          await userHelper.updateAddress(req.params.id, req.session.user._id);
          res.json({ status: "success" });
        } catch (err) {
          console.error(err);
        }
        // res.json({ status: "success" });
      },
    
      deleteAddress: async (req, res) => {
        try {
          await userHelper.deleteAddress(req.params.id);
          res.json({ status: "success" });
        } catch (err) {
          console.error(err);
        }
      },
      getOrderDetails: async (req, res) => {
        try {
          const orderHistory = await userHelper.getOrderHistory(
            req.session.user._id
          );
    
          const orderDetails = orderHistory.reverse();
          res.render("order", { user: req.session.user, orderDetails });
        } catch (err) {
          console.log(err);
        }
      },
      orderSuccess: async (req, res) => {
        const user= req.session.user;
        

        res.render("../views/user/placeOrderSuccess", {user});
      },
      viewOrder: async (req, res) => {
        try {
          const currentOrder = await adminHelper.getSpecificOrder(req.params.id);
          const { productDetails } = currentOrder;
          res.render("view-order", { user: req.session.user, productDetails });
        } catch (err) {
          console.error(err);
        }
      },


};
