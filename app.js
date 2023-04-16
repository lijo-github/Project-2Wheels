const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/user");
const adminRouter = require("./routes/admin");

const app = express();
const session = require("express-session");
const { v4: uuid } = require("uuid");
const mongoose = require("mongoose");
require("dotenv").config();

//* view engine setup */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//*session handling */
app.use(
    session({
        secret: uuid(),
        resave: true,
        saveUninitialized: false,
    })
);

app.use("/", indexRouter);
app.use("/admin", adminRouter);

//*Database connection */
mongoose
    .connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((error) => {
        console.log("Conncection failed!!", error);
    });

//* catch 404 and forward to error handler */
app.use(function (req, res, next) {
    next(createError(404));
});

//* error handler*/
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;