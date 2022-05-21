const mongoose = require('mongoose');
const crypto = require('crypto');
const CustomError = require('./../utils/error');
const mail = require('./../utils/sendEmail');
const factory = require('./handleFactory');
const sharp = require('sharp');

const User = require('./../models/user');
const jwt = require('jsonwebtoken');

exports.getUsers = async function (req, res, next) {
    try {
        const users = await User.find();
        res.status(200).json({
            status: 'success',
            size: users.length,
            data: {
                users,
            },
        });
    } catch (e) {
        const err = new CustomError(404, e.message);
        next(err);
    } finally {
    }
};

exports.getOneUser = factory.getOne(User);

exports.updateUser = async function (req, res, next) {
    /*********
This handler function deals with the updation of the user data including the profile picture   otherthan
password
*********/
    /// STEP-1 : return immediately from the function if req.body contains password or passwordConfirmed
    if (req.body.password || req.body.passwordConfirmed) {
        return next(
            new CustomError(400, 'to change password go to /forgotPassword ')
        );
    }

    /// STEP-2 : filter the req.body for the required fields only in this case name and email only
    const accept = ['name', 'email'];
    const update = {};
    Object.keys(req.body).forEach((item) => {
        if (accept.includes(item)) {
            update[item] = req.body[item];
        }
    });

    /*********************  for updating the profile picture    *********************/
    if (req.file) {
        update['photo'] = req.file.filename;
    }
    /// STEP-3 : use findByIdAndUpdate with options {new:true, runValidators:true} to return the updated doc and run     validators

    const updatedUser = await User.findByIdAndUpdate(req.user._id, update, {
        new: true,
        runValidators: true,
    });

    if (process.env.NODE_ENV === 'api') {
        res.status(200).json({
            status: 'success',

            data: {
                token: token,
                user: user,
            },
        });
    } else if (
        process.env.NODE_ENV === 'template' ||
        process.env.NODE_ENV === 'production'
    ) {
        res.status(200).render('accountTemplate', { me: updatedUser });
    }
};

// exports.resize = async function (req, res, next) {
//   console.log(req.file);
//   console.log("???????????????");
//   return;
//     if (!req.file) {
//         next();
//     }
//     req.file = await sharp(req.file.path).resize(200, 300).toFile(`./public/img/users/${req.user.name}.jpg`);
//     next();
// };

exports.updateProfile = async function (req, res, next) {
    /***********************
This route is only implemented in api environment
***********************/
    const update = await User.findByIdAndUpdate(
        req.user._id,
        {
            photo: req.file.filename,
        },
        { new: true }
    );
    res.status(200).json({
        status: 'success',
        data: {
            update,
        },
    });
};

exports.deleteUser = async function (req, res, next) {
    /********
  This handler function will set the active property of the current logged in user to false
  ********/
    await User.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null,
    });
};
