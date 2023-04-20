const express = require("express");
const router = express();
const session = require("express-session");
const upload = require("../config/storage.js")
const adminController = require("../controllers/admin-controller");
const {isLoggedIn,isUser,isloggedInad} = require("../middleware/sessionHandling")
router.set("view engine", "ejs");

//* get admin page *//
// router.get("/",isLoggedIn, adminController.adminPage);

//* get admin dashboard *//
router.get("/dashbord", isloggedInad, adminController.dashboard)

//* get/post admin loginpage *//
router.get("/",isloggedInad, adminController.adminlogin);
router.post("/adminLandingPage", adminController.adminPostLogin);

//* get admin logoutpage *//
router.get("/logout",isloggedInad, adminController.adminLogout);

//* get view-user *//
router.get("/view-user",isloggedInad, adminController.viewUser);

//* get/post block/unblock user *//
router.get("/block-user/:id",isLoggedIn, adminController.blockUser);
router.get("/unblock-user/:id",isLoggedIn, adminController.unblockUser)

//* get addbanner *//
router.get("/add-banner",isloggedInad,adminController.addBanner)

//* get/post category *//
router.get("/category",isloggedInad,adminController.category);
router.post("/add-category",isloggedInad, adminController.addCategory)

//* get/post add-products *//
router.get("/add-products",isloggedInad, adminController.addProducts);
router.post("/add-products",upload.array("productImage",4), adminController.addProductsPost)
router.get("/products",isloggedInad, adminController.getAllProducts);

router.get("/edit-product/:id",isloggedInad, adminController.editProduct);

router.post("/edited-product/:id",upload.array("productImage",4), adminController.editProductPost)


router.get("/unlist-product/:id",isloggedInad,adminController.unlistPorduct);

module.exports = router;
