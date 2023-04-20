const user = require("../model/userModel");
const userHelper = require("../helpers/user-helper");
const bcrypt = require("bcrypt");
const twilioFunctions = require("../config/twilio.js");

module.exports = {

    //*get home Page  */

    homePage: async (req, res ,next) => {
        let name = req.session.userName;
        let user = req.session.user;
        try{
            const allProductWithCategory = await userHelper.getAllProducts();
      const products = allProductWithCategory.products;
      const categories = allProductWithCategory.categories;
      if(user){
        res.render("user/userLandingPage", { name, user, products, categories });

      }
      else{
        res.render("user/userLandingPage", { name, user, products, categories });
      }

        
        }catch(err){
            console.error(err);
        }
        
    },

    //*get login Page  */

    login: (req, res) => {
        if (req.session.user) {
            res.redirect("/");
        } else res.render("user/login", { message: false,user:false });
    },

    //*get signup Page  */

    getsignup: (req, res) => {
        res.render("user/signup");
    },

     //*post signup Page  */

    postsignup: (req, res) => {
        userHelper.doSignup(req.body).then((userData) => {
            if (userData) {
                res.render("../views/user/login", { message: false });
            } else {
                req.session.user = userData;
                req.session.userName = userData.name;
                req.session.loggedIn = true;
                res.redirect("/");
            }
        });
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
                        req.session.userName = user.name;
                        req.session.loggedIn = true;
                        // console.log(req.session.user);
                        res.redirect("/");
                    } else {
                        return res.render("user/login", { message: "Invalid password" ,user:false});
                    }
                });
            } else if(user && user.status==false){
                console.log("user blocked!");

                res.render("user/login", { message: "You were blocked..!!" });
            }

             else {
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

     //*post signup Page  */

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
        console.log("$$$$$$$$$$$$$", mobNumber);
        try {
            const validUser = await userHelper.getmobileNumber(mobNumber);
            const enteredOTP = req.body.code;
            twilioFunctions.client.verify.v2
                .services(twilioFunctions.verifySid)
                .verificationChecks.create({ to: `+91${mobNumber}`, code: enteredOTP })
                .then((verification_check) => {
                    if (verification_check.status === "approved") {
                        req.session.user = validUser;
                         req.session.userName=validUser.name
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
    listProductCategory: async (req,res)=>{
        try{
            let user = req.session.user;
            const categoryId = req.query.category;
            const products = await userHelper.getAllProductsForList(categoryId);
            if(user){
                res.render("productList",{user, products});

            }else{
                res.render("productList",{user:false, products})
            }

        }catch(err){
            console.error(err);
        }
        
    }


};
