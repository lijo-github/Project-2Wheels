var express = require("express");
var router = express.Router();
var userController = require("../controllers/user-controller");
const { isLoggedIn, isUser, isloggedInad } = require("../middleware/sessionHandling");
const route = require("color-convert/route");

//* GET home page. */
router.get("/", userController.homePage);

//* login page. */
router.get("/login", isLoggedIn, userController.login);
router.post("/login", isLoggedIn, userController.postLogin);

//* signup page. */
router.get("/signup", isLoggedIn, userController.getsignup);
router.post("/signup", isLoggedIn, userController.postsignup);

//* logout page. */
router.get("/logout", userController.userLogout);

//* otp-login page. */
router.get("/otp-login", isLoggedIn, userController.otpLogin);

router.post("/otp-login", isLoggedIn, userController.otpLoginPost);

router.get("/resendOTP", isLoggedIn, userController.resendOtp);

router.post("/verify-mobile", isLoggedIn, userController.verifyOtp);

//* forgotpassword *//

router.get("/forgotpassword",isLoggedIn, userController.forgotPassword);

router.post("/forgotpassword", userController.forgotPasswordPost);

router.post("/verfy-otp-forForgotpassword", userController.verifyOtpforpassword);

router.post("/change-password", isLoggedIn, userController.changePassword);



//* product list page. */
router.get("/productsList", userController.listProductCategory);

//* product view page. */
router.get("/product-view/:id", userController.productView);

//* add to Cart. */
router.get("/add-to-cart/:id", isUser, userController.addToCart);

//* cart Page */
router.get("/cart", isUser, userController.cartPage);

//* Remove Product */
router.post("/remove-product-from-cart", isUser, userController.removeProductFromCart);

router.post("/change-product-quantity", userController.changeProductQuantity);

router.get("/get-product-quantity", userController.getProductQuantityController);

router.get("/edit-profile", (req, res) => {
    let user = req.session.user;
    const name = req.session.user.name;

    res.render("../views/user/editProfile", { user, name });
});

//* checkout */

router.get("/checkout", isUser, userController.checkOut);

//* address add/delete/select */

router.get("/address", isUser, userController.selectAddress);

router.get("/add-address", isUser, userController.addAddress);

router.post("/add-address", isUser, userController.addAddressPost);

router.get("/select-address/:id", isUser, userController.select);

router.get("/delete-address/:id", isUser, userController.deleteAddress);

//* place order */

router.post("/place-order", isUser, userController.placeOrderPost);

router.get("/order-success", isUser, userController.orderSuccess);

router.get("/order-failed", isUser, userController.orderFailed);

router.get("/order", isUser, userController.getOrderDetails);

router.get("/view-order-products/:id", isUser, userController.viewOrder);

router.post("/cancelOrder", isUser, userController.removeOrder);

router.put("/returnOrder", isUser, userController.returnOrder);

//* verify payment */

router.post("/verify-payment", isUser, userController.verifyPayment);

//* coupon get/post */

router.get("/all-coupons", isUser, userController.getAllCoupons);

router.post("/apply-coupon", isUser, userController.applyCoupon);

//* search */

router.get("/product-search", userController.search);

//* filter */

router.get("/data", userController.filterProducts);

//* wishlist */

router.post("/wishlist/add/", isUser, userController.addToWishList);

router.get("/wishlist", isUser ,userController.wishList);

router.put("/add-to-cartFromWishL/:id", isUser, userController.addToCartFromWish);

router.delete("/remove-product-from-wishList", isUser, userController.removeProdctFromWishLIst);

//* get wishlist and cart count */

router.get("/wishlist/count",isUser, userController.getWishListCount);

router.get("/cart/count", isUser, userController.getCartCount);

//* getwallet */

router.get("/wallet", isUser, userController.getwallet);

//*download invoice *//

router.get("/download-invoice/:id", isUser, userController.downloadInvoice);


module.exports = router;
