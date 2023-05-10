module.exports = {
    isLoggedIn(req, res, next) {
        if (req.session.loggedIn) {
            res.redirect("/");
        } else {
            next();
        }
    },
    isUser(req, res, next) {
        if (req.session.loggedIn) {
            console.log;
            next();
        } else {
            res.redirect("/");
        }
    },
    isloggedInad(req, res, next) {
        if (req.session.isloggedInad) {
            res.admin = req.session.admin;
            next();
        } else {
            res.render("../views/admin/adminLogin");
        }
    },
};
