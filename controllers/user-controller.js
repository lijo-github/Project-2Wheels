const user = require("../model/userModel");
const userHelper = require("../helpers/user-helper");
const adminHelper = require("../helpers/admin-helper");
const bcrypt = require("bcrypt");
const twilioFunctions = require("../config/twilio.js");
const Cart = require("../model/cart");
const instance = require("../config/paymentGateway.js");
const { generateInvoice } = require("../config/pdfKit")
const CryptoJS = require("crypto-js");
require("dotenv").config();

module.exports = {
    //*get home Page  */

    homePage: async (req, res, next) => {
        let user = req.session.user;
        try {
            const allProductWithCategory = await userHelper.getAllProducts();
            const products = allProductWithCategory.products;
            const categories = allProductWithCategory.categories;
            const banners = await userHelper.getListedBanner();
            const productQuantity = await userHelper.getProductQuantity();
            if (user) {
                user.count = await userHelper.getCartCount(user._id);
                user.wish = await userHelper.countWish(user._id);
                res.render("user/userLandingPage", { user, products, categories, banners, productQuantity });
            } else {
                res.render("user/userLandingPage", { user, products, categories, banners, productQuantity });
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
        try {
            let user = req.session.user;
            res.render("user/signup", { user });
        } catch (err) {
            console.error(err);
            res.render("../views/user/catchError");
        }
    },

    //*post signup Page  */

    postsignup: async (req, res) => {
        try {
            let user = req.session.user;
            const userData = await userHelper.doSignup(req.body);
            if (userData) {
                console.log(userData);
                res.render("../views/user/login", { message: false, user });
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
        let user = req.session.user;
        try {
            if (user) {
                res.redirect("/login");
            } else res.render("user/otp-login", { message: false, user });
        } catch (err) {
            console.error(err);
            res.render("../views/user/catchError");
        }
    },

    //*post signup Page  *//

    otpLoginPost: async (req, res) => {
        console.log(req.body);
        const mobNumber = req.body.mobile;
        try {
            
            const validUser = await userHelper.getmobileNumber(mobNumber);
            if (validUser !== undefined && validUser !== false) {
                console.log(validUser);
                twilioFunctions
                    .generateOTP(mobNumber, "sms")
                    .then((verification) => {
                       
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
                        req.session.user = validUser;
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
    
    //* get forgopassword *//

    forgotPassword: (req, res) => {
        res.render("../views/user/forgotpassword", { otpErr: false, loginErr: false, user: false });
    },

    //*post forgotPassword */

    forgotPasswordPost:async (req, res) => {
       
        const mobNumber = req.body.mobile;
        try {
            
            const validUser = await userHelper.getUser(mobNumber);
            if (validUser) {
               
                twilioFunctions
                    .generateOTP(mobNumber, "sms")
                    .then((verification) => {
                        console.log(req.body);
                       
                        res.render("../views/user/verify-otp-forgotpassword", {
                            loginErr: false,
                            user: false,
                            mobile: mobNumber,
                            message: false,
                        });
                        console.log(verification.status);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.render("../views/user/forgotpassword", { otpErr: true, loginErr: false, user: false, block: false });
                    });
            } else if (validUser == undefined) {
                res.render("../views/user/forgotpassword", {
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

    //*post verify otpforPassword */

    verifyOtpforpassword: async (req, res) => {
        try {
            const mobNumber = req.body.mobile;
            const user = await userHelper.getUser(mobNumber);
            const enteredOTP = req.body.code;
            twilioFunctions.client.verify.v2
                .services(twilioFunctions.verifySid)
                .verificationChecks.create({ to: `+91${mobNumber}`, code: enteredOTP })
                .then((verification_check) => {
                    if (verification_check.status === "approved") {
                        req.session.user = user;
                        console.log(user);
                        res.render("../views/user/changePassword",{user:false, Err:false,});
                    } else {
                        res.render("../views/user/verify-otp-forgotpassword", { loginErr: true, user: false, mobile: mobNumber });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    res.render("../views/user/verify-otp-forgotpassword", { loginErr: true, user: false, mobile: mobNumber });
                });
        } catch (err) {
            console.error(err);
        }
    },

    changePassword: async(req,res)=>{

        try{
            const user = req.session.user;
            await userHelper.updatePassword(user._id,req.body.changedPassword);
            req.session.loggedIn = true;
            res.redirect("/",)
        }catch(err){
            res.render("../views/user/changePassword",{Err: true, user: false})
            console.log(err);
        }
    },

    

    listProductCategory: async (req, res) => {
        try {
            let user = req.session.user;
            const { category: categoryId, sort } = req.query;
            const products = await userHelper.getAllProductsForList(categoryId, sort, user?._id);
            if (user) {
                res.render("../views/user/productList", { user, products });
            } else {
                res.render("../views/user/productList", { user: false, products });
            }
        } catch (err) {
            console.error(err);
        }
    },
    productView: async (req, res) => {
        const user = req.session?.user;
        const productQuantity = await userHelper.getProductQuantity();

        try {
            if (user) {
                user.count = await userHelper.getCartCount(user._id);

                user.wish = await userHelper.countWish(user._id);

                var products = await userHelper.getProductDetails(req.params.id);

                console.log("product list view success");

                res.render("user/product-view", { user, products, productQuantity });
            } else {
                var products = await userHelper.getProductDetails(req.params.id);

                console.log("product list view success");

                res.render("user/product-view", { user, products, productQuantity });
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
                res.render("../views/user/emptyCart", { user });
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

    getProductQuantityController: async (req, res) => {
        try {
            const { productId } = req.body;

            const currentQuantity = await userHelper.getProductQuantity(productId);
            res.json({ quantity: currentQuantity });
        } catch (err) {
            console.log(err);
        }
    },

    // changeProductQuantity: async (req, res) => {
    //     try {
    //         const { userId, prodId, count } = req.body;
    //         console.log("got here", userId, prodId, count);
    //         await Cart.updateOne(
    //             { user: userId, "products.productId": prodId },
    //             {
    //                 $inc: {
    //                     "products.$.quantity": count,
    //                 },
    //             }
    //         );

    //         res.status(200).json({ error: false, message: "Product quantity has been changed successfully" });

    //         //   if (!Array.isArray(product)) {
    //         //     throw new Error('Invalid product data');
    //         //   }

    //         //   if (product.length < 3) {
    //         //     throw new Error('Product data must have at least three elements');
    //         //   }

    //         //   const [userId, productId, count] = product;

    //         //   console.log(product);

    //         //   await userHelper.updateQuantity(userId, productId, count);

    //         //   res.json({ status: "success" });
    //     } catch (err) {
    //         console.error(err);
    //         res.json({ status: "error" });
    //     }
    // },
    changeProductQuantity: async (req, res) => {
        // let user = req.session.user;
        let user_id = req.body.user_id;
        const productId = req.body.productId;
        const count = req.body.quantityChange;
        console.log(user_id);
        console.log(productId);
        console.log(count);

        try {
            const response = await userHelper.updateQuantity(user_id, productId, count);
            if (response === false) {
                res.json({ error: "success" });
                return;
            }
            res.json({ status: "success" });
        } catch (err) {
            console.error(err);
            res.json({ status: "error" });
        }
    },
    removeProductFromCart: async (req, res) => {
        try {
            console.log(req.body);
            await userHelper.removeProductFromCart(req.body);
            res.json({ status: "success", message: "product added to cart" });
        } catch (err) {
            console.error(error);
            res.render("../views/user/catchError", { message: err.message, user: req.session.user });
        }
    },
    checkOut: async (req, res) => {
        try {
            let user = req.session.user;
            const items = await userHelper.getCartProducts(req.session.user._id);
            if (!items) {
                res.json({ items });
                return;
            }
            const address = await userHelper.getDefaultAddress(req.session.user._id);
            console.log("adress not get", address);
            const { cartItems: products, subtotal } = items;
            res.render("../views/user/checkout", { user, products, subtotal, address });
        } catch (err) {
            console.error(err);
        }
    },
    placeOrderPost: async (req, res) => {
        try {
            const { userId, paymentMethod, totalAmount, couponCode } = req.body;

            const response = await userHelper.placeOrder(userId, paymentMethod, totalAmount, couponCode, req.body);
            if (response.payment_method == "cash_on_delivery") {
                res.json({ codstatus: "success" });
            } else if (response.payment_method == "online_payment") {
                // const order = generatePaymenetGateway(response);
                const paymentOptions = {
                    amount: response.total_amount * 100,
                    currency: "INR",
                    receipt: "" + response._id,
                    payment_capture: 1,
                };

                const order = await instance.orders.create(paymentOptions);
                res.json(order);
            } else if (response.payment_method == "wallet") {
                res.json({ codstatus: "success" });
            }
        } catch (err) {
            console.error(err);
            res.json({ status: "error" });
        }
    },
    addAddress: async (req, res) => {
        try {
            res.render("../views/user/add-address", { user: req.session.user });
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
            const orderHistory = await userHelper.getOrderHistory(req.session.user._id);

            const orderDetails = orderHistory.reverse();
            console.log(orderDetails);
            res.render("../views/user/order", { user: req.session.user, orderDetails });
        } catch (err) {
            res.render("catchError"),
                {
                    message: err.message,
                    user: req.session.user,
                };
        }
    },
    orderSuccess: async (req, res) => {
        const user = req.session.user;

        res.render("../views/user/placeOrderSuccess", { user });
    },
    viewOrder: async (req, res) => {
        try {
            const currentOrder = await adminHelper.getSpecificOrder(req.params.id);
            const { productDetails, order } = currentOrder;
            res.render("../views/user/view-order", { user: req.session.user, productDetails, order });
        } catch (err) {
            console.error(err);
        }
    },
    orderFailed: async (req, res) => {
        try {
            res.render("../views/user/payment-failure", { user: req.session.user });
        } catch (err) {
            res.render("../views/user/catchError", { message: err.message, user: req.session.user });
        }
    },

    removeOrder: async (req, res) => {
        try {
            console.log(req.body.arguments);
            await userHelper.cancelOrder(req.body.arguments);

            console.log(req.body.arguments[0]);
            res.json({ status: "success" });
        } catch (err) {
            console.log("order cancel error");
            res.render("../views/user/catchError", {
                message: err.message,
                user: req.session.uesr,
            });
        }
    },
    returnOrder: async (req, res) => {
        try {
            await userHelper.returnOrder(req.body.orderId, req.body.reason);
            res.json({ status: "success" });
        } catch (err) {
            res.render("catchError", { message: err.message, user: req.session.user });
        }
    },

    verifyPayment: async (req, res) => {
        try {
            const order = req.body;
            const payment = req.body;

            console.log("payment gettttttttttttttttt", payment);

            const razorpayOrderId = req.body["payment[razorpay_order_id]"];
            const razorpayPaymentId = req.body["payment[razorpay_payment_id]"];
            const razorpaySecret = process.env.KEY_SECRET;
            const razorpaySignature = req.body["payment[razorpay_signature]"];

            // Concatenate order_id and payment_id
            const message = razorpayOrderId + "|" + razorpayPaymentId;

            // Generate a HMAC SHA256 hash of the message using the secret key
            const generatedSignature = CryptoJS.HmacSHA256(message, razorpaySecret).toString(CryptoJS.enc.Hex);

            // Compare the generated signature with the received signature
            if (razorpaySignature === generatedSignature) {
                await userHelper.changeOnlinePaymentStatus(req.body["order[receipt]"], req.session.user._id);
                res.json({ status: "success" });
            } else {
                res.json({ error: "error" });
            }
            console.log(payment);
            console.log(order);
        } catch (err) {
            console.error(err);
            res.render("../views/user/catchError", {
                message: err?.message,
                user: req.session.user,
            });
        }
    },

    getAllCoupons: async (req, res) => {
        try {
            const coupons = await userHelper.getCoupons(req.session.user._id);
            res.render("../views/user/all-coupons", { user: req.session.user, coupons });
        } catch (err) {
            res.render("../views/user/catchError", { message: err.message, user: req.session.user });
        }
    },

    applyCoupon: async (req, res) => {
        try {
            const { code, total } = req.body;
            const response = await userHelper.applyCoupon(code, total, req.session.user._id);
            res.json(response);
        } catch (err) {
            res.render("catchError", { message: err.message, user: req.session.user });
        }
    },
    search: async (req, res) => {
        try {
            const search = req.query.search;
            const products = await userHelper.searchQuery(search, req.session.user?.id);
            console.log(products, "nulllllllllllllllllll");
            if (products) {
                res.render("../views/user/productList", { user: req.session.user, products });
            } else {
                res.render("../views/user/productNotFound", { message: err?.message, user: req.session.user });
            }
        } catch (err) {
            res.render("../views/user/productNotFound", { message: err?.message, user: req.session.user });
        }
    },

    filterProducts: async (req, res) => {
        try {
            const { sort } = req.query;
            console.log(sort);
            const products = await userHelper.sortQuery(sort, req.session.user?._id);
            res.render("../views/user/productList", { user: req.session.user, products });
        } catch (err) {
            res.render("../views/user/catchError", {
                message: err?.message,
                user: req.session.user,
            });
        }
    },

    addToWishList: async (req, res) => {
        try {
            const response = await userHelper.addToWishListUpdate(req.session.user._id, req.body.product_id);
            if (!response) {
                res.json({ error: true });
                return;
            } else if (response === "removed") {
                res.json({ removeSuccess: true });
                return;
            }
            res.json({ success: true });
        } catch (err) {
            res.render("../views/user/catchError", {
                message: err?.message,
                user: req.session.uesr,
            });
        }
    },
    wishList: async (req, res) => {
        try {
            const showList = await userHelper.showWishList(req.session.user._id);
            res.render("../views/user/wishlist", { user: req.session.user, showList });
        } catch (err) {
            console.error(err);
            res.render("../views/user/catchError", { message: err?.message, user: req.session.user });
        }
    },

    getWishListCount: async (req, res) => {
        try {
            let user = req.session.user;
            // retrieve currently authenticated user
            let count = await userHelper.countWish(user._id);
            //count items in wishlist for user
            res.json({ count: count });
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal server error");
        }
    },
    getCartCount: async (req, res) => {
        try {
            let user = req.session.user; // retrieve currently authenticated user
            let count = await userHelper.getCartCount(user._id); // count items in cart for user
            res.json({ count: count });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error");
        }
    },

    removeProdctFromWishLIst: async (req, res) => {
        try {
            await userHelper.removeProdctFromWishLIst(req.session.user._id, req.body.product);
            res.json({
                status: "success",
                message: "product added to cart",
            });
        } catch (err) {
            res.render("catchError", {
                message: err.message,
                user: req.session.user,
            });
        }
    },
    addToCartFromWish: async (req, res) => {
        try {
            const response = await userHelper.addToCartFromWish(req.params.id, req.session.user._id);
            if (response) {
                res.json({
                    status: "success",
                    message: "product added to cart",
                });
            } else {
                res.json({
                    error: "error",
                    message: "product not added to cart",
                });
            }
        } catch (err) {
            console.error(err);
            res.render("catchError", {
                message: err.message,
                user: req.session.user,
            });
        }
    },
    downloadInvoice: async (req, res) => {
        try {
          const order_id = req.params.id;
          console.log(order_id);
          // Generate the PDF invoice
          const order = await adminHelper.getSpecificOrder(order_id);
    
          const { order: invoiceData, productDetails } = order;
          console.log(order,'order getttttttttttt');

          const invoicePath = await generateInvoice(invoiceData, productDetails);
          
    
          // Download the generated PDF
          res.download(invoicePath, (err) => {
            if (err) {
              console.error("Failed to download invoice:", err);
              res.render("../views/user/catchError", {
                message: err.message,
                user: req.session.user,
              });
            }
          });
        } catch (error) {
          console.error("Failed to download invoice:", error);
          res.render("catchError", {
            
            user: req.session.user,
          });
        }
      },
    getwallet: async (req, res) => {
        try {
            const wallet = await userHelper.getUserWalletAmount();
            res.render("../views/user/wallet", { user: req.session.user, wallet });
        } catch (err) {
            console.error(err);
        }
    },
};
