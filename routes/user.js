var express = require("express");
var router = express.Router();
var userController = require("../controllers/user-controller");
const {isLoggedIn,isUser} = require("../middleware/sessionHandling")
// var userHelpers = require("../helpers/user-helpers");

//* GET home page. */
router.get("/", userController.homePage);

//* login page. */
router.get("/login", userController.login);
router.post("/login", userController.postLogin);

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

module.exports = router;
