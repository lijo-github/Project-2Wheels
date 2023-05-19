const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
const debug = require("debug");
const indexRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const app = express();
const session = require("express-session");
const { v4: uuid } = require("uuid");
const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./config/connectDB.js");

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
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 600000 },
    })
);

app.use("/", indexRouter);
app.use("/admin", adminRouter);

//*Database connection */
connectDB();

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

// Create HTTP server
const server = http.createServer(app);

// Set port
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

// Listen on provided port, on all network interfaces
mongoose.connection.once("open", () => {
    console.log("Database connected successfully");

    server.listen(port, () => {
        console.log(`Server running on port http://localhost:${port}`);
    });
});

// Event listener for HTTP server "error" event
const onError = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof PORT === "string" ? `Pipe ${PORT}` : `Port ${PORT}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
};

server.on("error", onError);

// Event listener for HTTP server "listening" event
const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
};
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

module.exports = app;
