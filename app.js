const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const compression = require('compression');
require('dotenv').config();

require('./config/passport')(passport);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to database...'))
    .catch(err => console.log(err));

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const articleRouter = require('./routes/articles');
const uploadRouter = require('./routes/upload');
const userRouter = require('./routes/users');
const dashboardRouter = require('./routes/dashboard');
const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression()); // Compresses all responses
app.use(helmet());
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        status: 429,
        message: "Too many authentication attempts. Please try again later."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/articles', articleRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/users', userRouter);
app.use('/api/dashboard', dashboardRouter);
app.get('/api/test-route', (req, res) => res.json({ message: "TEST ROUTE IS WORKING" }));
app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({ message: err.message });
});

console.log("--- Registered Routers ---", app._router.stack.map(r => r.route ? r.route.path : r.name));
module.exports = app;