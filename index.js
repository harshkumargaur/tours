require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
//////////// security packages
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
//////////////////////////
const morgan = require('morgan');
const CustomError = require('./utils/error');
const User = require('./models/user');
const viewRouter = require('./routes/viewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const authControl = require('./controllers/authControl');

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
    })
);
app.use(mongoSanitize());
app.use(xssClean());
app.use(
    hpp({
        whitelist: ['duration', 'difficulty'],
    })
);

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'please try again after 1 hour',
});

app.use('/api', limiter);

app.use(morgan('tiny'));

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.get('/', function (req, res) {
    res.status(200).render('base');
});

app.all('*', function (req, res, next) {
    const e = new CustomError(404, "This path don't exists");
    next(e);
});

console.log(
    'The application is running in ' + process.env.NODE_ENV + ' environment'
);

app.use(function (err, req, res, next) {
    err.status = err.status || 500;
    if (process.env.NODE_ENV === 'api') {
        res.status(err.status).json({
            status: err.status,
            message: err.message,
            type: err.isOperational,
            name: err.name,
            info: {
                stack: err.stack,
            },
        });
        next();
    } else if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'template') {
        res.status(err.status).render("error",{err:err});
        next();
    }
});
module.exports = app;
