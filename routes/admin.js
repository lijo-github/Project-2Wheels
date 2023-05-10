const express = require("express");
const router = express();
const upload = require("../config/storage.js");
const adminController = require("../controllers/admin-controller");
const { isLoggedIn, isUser, isloggedInad } = require("../middleware/sessionHandling");
router.set("view engine", "ejs");

//* get admin page *//
// router.get("/",isLoggedIn, adminController.adminPage);

//* get admin dashboard *//
router.get("/dashbord", isloggedInad, adminController.dashboard);

//* get/post admin loginpage *//
router.get("/", isloggedInad, adminController.adminlogin);
router.post("/adminLandingPage", adminController.adminPostLogin);

//* get admin logoutpage *//
router.get("/logout", isloggedInad, adminController.adminLogout);

//* get view-user *//
router.get("/view-user", isloggedInad, adminController.viewUser);

//* get/post block/unblock user *//
router.get("/block-user/:id", isloggedInad, adminController.blockUser);
router.get("/unblock-user/:id", isloggedInad, adminController.unblockUser);

//* get/post addbanner *//
router.get("/add-banner", isloggedInad, adminController.addBanner);
router.post("/add-banner", isloggedInad, upload.single("productImage"), adminController.addBannerpost);

//* view banner *//
router.get("/banner-list", isloggedInad, adminController.viewBanner);

//* remove banner *//
router.get("/remove-banner/:id", isloggedInad, adminController.removeBanner);

//* list banner *//
router.get("/list-banner/:id", isloggedInad, adminController.ListBanner);

//* get/post category *//
router.get("/category", isloggedInad, adminController.category);
router.post("/add-category", isloggedInad, adminController.addCategory);
router.get("/delete-category/:id", isloggedInad, adminController.deleteCategory);
router.post("/edit-category/:id", adminController.editCategory);
router.get("/list-category/:id", isloggedInad, adminController.listCategory);

//* get/post add-products *//
router.get("/add-products", isloggedInad, adminController.addProducts);
router.post("/add-products", upload.array("productImage", 4), adminController.addProductsPost);

//* getall products *//
router.get("/products", isloggedInad, adminController.getAllProducts);

//* edit product *//
router.get("/edit-product/:id", isloggedInad, adminController.editProduct);

router.post("/edited-product/:id", upload.array("productImage", 4), adminController.editProductPost);

router.get("/unlist-product/:id", isloggedInad, adminController.unlistPorduct);

//* order-Management *//
router.get("/order-Management", isloggedInad, adminController.orderDetails);

router.get("/view-order/:id", isloggedInad, adminController.viewOrder);

router.post("/update-order-status", isloggedInad, adminController.updateOrderStatus);

//* coupon-Management *//
router.get("/add-coupon", isloggedInad, adminController.addCoupon);

router.post("/add-coupon", isloggedInad, adminController.addCouponPost);

router.post("/remove-coupon", isloggedInad, adminController.removeCoupon);

router.get("/view-coupon", isloggedInad, adminController.viewCoupon);

module.exports = router;
