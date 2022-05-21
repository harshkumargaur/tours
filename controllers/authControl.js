///////// This whole file deals with the authentication

const mongoose = require('mongoose');
const crypto = require('crypto');
const CustomError = require('./../utils/error');
const mail = require('./../utils/sendEmail');

const User = require('./../models/user');
const jwt = require('jsonwebtoken');
const viewRoutes = require('./../routes/viewRoutes');

exports.createUser = async function (req, res, next) {
    ///////////// this is the part of authentication
    ////////   signup or creating a new user
    try {
        const user = await User.create({
            ///for security purpose
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirmed: req.body.passwordConfirmed,
            passwordChanged: req.body.passwordChanged,
            photo: req.body.photo,
            role: req.body.role,
        });
        user.password = undefined; ////hide the user password from response
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRET,
            {
                expiresIn: '60d',
            }
        );

        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),

            //secure: true, //this will only work in production env
            httpOnly: true,
        });

        res.status(200).json({
            status: 'success',
            data: {
                token: token,
                user: user,
            },
        });
    } catch (e) {
        // e.status = 404;
        next(e);
    } finally {
    }
};

exports.login = async function (req, res, next) {
    console.log(process.env.NODE_ENV);
    console.log(req.body);
    const { email, password } = req.body;

    try {
        ////////// check if email and password is provided in body
        if (!email || !password) {
            const err = new CustomError(
                400,
                'please provide email and password'
            );
            return next(err);
        }

        /////////////////////// check if a user is present with the provided email
        const user = await User.findOne({ email: email }).select('+password');

        if (!user || !(await user.checkPass(password, user.password))) {
            const err = new CustomError(400, 'email or password is incorrect');
            return next(err);
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRET,
            {
                expiresIn: '60d',
            }
        );

        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),

            //secure: true, //this will only work in production env
            httpOnly: true,
        });

        ////// the res.locals are present for all the templates

        // res.locals.user= user;
        if (process.env.NODE_ENV === 'api') {
            res.status(200).json({
                status: 'success',

                data: {
                    token: token,
                    user: user,
                },
            });
        } else if (process.env.NODE_ENV === 'template') {
            res.status(200).redirect('/');
        }
    } catch (e) {
        const err = new CustomError(400, e.message);
        next(err);
    }
};

exports.logout = function (req, res, next) {
    res.clearCookie('jwt', {
        expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),

        //secure: true, //this will only work in production env
        httpOnly: true,
    });
    res.redirect('/login');
};

///////////////////// implementation of authrization

exports.protect = async function (req, res, next) {
    ////////  this route is accessible only if the user is logged in
    ///////////////// check if token exists
    let token, user, decoded;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (req.cookies) {
        token = req.cookies.jwt;
    }
    if (!token) {
        const e = new CustomError(401, 'unAuthorized access');
        return next(e);
    }

    /////////////////verify the token
    try {
        decoded = await jwt.verify(token, process.env.SECRET);

        if (!decoded) {
            const err = new CustomError(401, 'jwt error');
            return next(err);
        }
        /////////////////// check if the user still exists
        user = await User.findById(decoded.id);
        if (!user) {
            const e = new CustomError(401, 'user not exists, bad request');
            return next(e);
        }
    } catch (e) {
        return next(e);
    }

    ///////////  check if the user recently changed the password
    if (user.changePassRecent(decoded.iat)) {
        const e = new CustomError(
            401,
            'the user recently changed the password'
        );
        return next(e);
    }

    req.user = user;

    next();
};
//
exports.isLogged = async function (req, res, next) {
    console.log('isLogged middleware');

    ////////  this route is accessible only if the user is logged in
    ///////////////// check if token exists

    let token, user, decoded;

    if (req.cookies.jwt) {
        token = req.cookies.jwt;

        /////////////////verify the token
        try {
            decoded = await jwt.verify(token, process.env.SECRET);

            /////////////////// check if the user still exists
            user = await User.findById(decoded.id);

            ///////////  check if the user recently changed the password
            if (!user) {
                res.locals.user = undefined;
                return next();
            }

            res.locals.user = user;
        } catch (e) {
            res.locals.user = undefined;
            next(e);
        }
        next();
    } else {
        res.locals.user = undefined;
        next();
    }
};

exports.authorization = function (...roles) {
    ///// only the certain types of user can do the particular function
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new CustomError(
                    401,
                    "you don't have previllage to perform the action"
                )
            );
        }
        next();
    };
};

exports.me = function (req, res, next) {
    const me = req.user;

    res.status(200).json({
        status: 'success',
        data: {
            me,
        },
    });
};

exports.forgotPassword = async function (req, res, next) {
    /////take input of the user email to which the account is registered
    //// check if the user exists

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        next(new CustomError(400, 'No user exists for the given data'));
    }

    //////generate the password reset token using inbuilt crypto

    const resetToken = user.genRandResetToken();
    user.save({ validateBeforeSave: false });

    ///// send it to the user
    const m = await mail(user, resetToken);
    // console.log(m);
    if (!m) {
        return next(new CustomError(400, 'cannot send the mail'));
    }

    res.status(200).json({
        token: resetToken, //////this token is unencrypted
    });
};

exports.resetPassword = async function (req, res, next) {
    ///// this route handler function deals with the resetting of password of the user
    //step-1 : get the reset token generated from the email and obtain it from the req.params.token in this route, now find the user based on that token  and check for the token expiration

    const tokenEncryt = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const resetPassUser = await User.findOne({
        resetToken: tokenEncryt,
        expiresIn: { $gt: Date.now() },
    });

    if (!resetPassUser) {
        return next(new CustomError(404, 'cannot find the user'));
    }

    // step-2 : replace the password and passwordConfirmed to the new one obtained from req.body.password & req.body.passwordConfirmed and save the user
    // this time the validators must be run so do not use user.save({validateBeforeSave:false})

    resetPassUser.password = req.body.password;
    resetPassUser.passwordConfirmed = req.body.passwordConfirmed;
    resetPassUser.expiresIn = undefined;
    resetPassUser.resetToken = undefined;
    try {
        const patched = await resetPassUser.save();
        const token = jwt.sign(
            { id: patched._id, email: patched.email },
            process.env.SECRET,
            {
                expiresIn: '60d',
            }
        );

        res.status(200).json({
            status: 'success',

            data: {
                token: token,
                patched,
            },
        });
    } catch (e) {
        next(e);
    }
};

exports.updatePassword = async function (req, res, next) {
    /*******************
     This route handler deals with the update of the current password to the new password
     This needs the user to be logged in
     The route utilizing this handler will be a patch request for the logged in user
  ********************/
    //// STEP-1 : get the user from req.user and use select("+password") to show the password
    let userUpdated = await User.findById(req.user._id).select('+password');

    //// STEP-2 : obtain the new password and passwordConfirmed from req.body
    if (
        !req.body.newPassword ||
        !req.body.passwordConfirmed ||
        req.body.curentPasswrd
    ) {
        return next(new CustomError(400, 'please provide the required fields'));
    }

    if (
        !userUpdated.checkPass(req.body.currentPassword, userUpdated.password)
    ) {
        return next(new CustomError(400, 'please provide the correct data'));
    }

    userUpdated.password = req.body.newPassword;
    userUpdated.passwordConfirmed = req.body.passwordConfirmed;

    ///  STEP-3 : user.save()  ///////do not use findByIdAndUpdate or findByOneAndUpdate as they don't run pre and validators
    try {
        await userUpdated.save();

        if (process.env.NODE_ENV === 'api') {
            res.status(200).json({
                result: 'success',
                message: `password updated for ${userUpdated.name}`,
            });
        } else if (process.env.NODE_ENV === 'template') {
            res.status(200).redirect('/me');
        }
    } catch (e) {
        next(e);
    }
};
