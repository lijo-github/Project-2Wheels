const express = require("express");
const router = express();
const session = require("express-session");
const adminController = require("../controllers/admin-controller");
const {isLoggedIn,isUser,isloggedInad} = require("../middleware/sessionHandling")
router.set("view engine", "ejs");

router.get("/",isLoggedIn, adminController.adminPage)
router.get("/login", adminController.adminlogin);
router.post("/adminLandingPage", adminController.adminPostLogin);
router.get("/logout",isloggedInad, adminController.adminLogout)


module.exports = router;
