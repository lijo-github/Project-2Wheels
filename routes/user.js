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

//* product list page. */
router.get("/productsList",userController.listProductCategory)

//* product view page. */
router.get("/product-view/:id",userController.productView);

//* add to Cart. */
router.get("/add-to-cart/:id",isUser, userController.addToCart);

//* cart Page */
router.get("/cart",isUser, userController.cartPage);

//* Remove Product */
router.post("/remove-product-from-cart",isUser,userController.removeProductFromCart);

router.post("/change-product-quantity",userController.changeProductQuantity);

router.get("/edit-profile", (req, res) => {
  let user = req.session.user;
  const name= req.session.user.name

  res.render("../views/user/editProfile", { user, name });
});

//* checkout */

router.get("/checkout", isUser, userController.checkOut);

router.get("/address", isUser, userController.selectAddress);

router.get("/add-address", isUser , userController.addAddress);

router.post("/add-address", isUser ,userController.addAddressPost);

router.get("/select-address/:id", isUser ,userController.select);

router.get("/delete-address/:id", isUser , userController.deleteAddress);


//* checkout */

router.post("/place-order", isUser, userController.placeOrderPost);

router.get("/order-success", isUser , userController.orderSuccess);







module.exports = router;
