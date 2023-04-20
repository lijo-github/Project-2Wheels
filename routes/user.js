var express = require("express");
var router = express.Router();
var userController = require("../controllers/user-controller");
const {isLoggedIn,isUser, isloggedInad} = require("../middleware/sessionHandling")
// var userHelpers = require("../helpers/user-helpers");

//* GET home page. */
router.get("/", userController.homePage);

//* login page. */
router.get("/login",isLoggedIn, userController.login);
router.post("/login",isLoggedIn, userController.postLogin);

//* signup page. */
router.get("/signup",isLoggedIn, userController.getsignup);
router.post("/signup",isLoggedIn, userController.postsignup);

//* logout page. */
router.get("/logout", userController.userLogout)

//* otp-login page. */
router.get("/otp-login",isLoggedIn, userController.otpLogin)

router.post("/otp-login",isLoggedIn, userController.otpLoginPost)

router.get("/resendOTP",isLoggedIn, userController.resendOtp)

router.post("/verify-mobile",isLoggedIn, userController.verifyOtp)

router.get("/productsList",userController.listProductCategory)

module.exports = router;
