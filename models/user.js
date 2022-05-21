const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'user must have name'],
    },
    email: {
        type: String,
        required: [true, 'user must have email'],
        validate: {
            ///////// will not work during findByIdAndUpdate
            validator: validator.isEmail,
            message: 'please provide a valid email address',
        },
        lowercase: true,
        unique: true,
    },
    photo: String,

    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user',
    },

    password: {
        type: String,
        required: [true, 'required password'],
        minLength: 8,
        select: false,
    },
    passwordConfirmed: {
        type: String,
        required: [true, 'required password'],
        minLength: 8,
        validate: {
            ///////// will not work during findByIdAndUpdate
            validator: function (el) {
                return this.password === el;
            },
            message: 'the password must be same',
        },
    },
    passwordChanged: Date,
    resetToken: String,
    expiresIn: Date,
    active: {
        //// on deleting the user the active property will be set to false
        type: Boolean,
        default: true,
        select: false,
    },
});

userSchema.method('checkPass', async function (reqBodyPass, passDatabase) {
    return await bcrypt.compare(reqBodyPass, passDatabase);
});

userSchema.method('changePassRecent', function (jwtTimeStamp) {
    if (this.passwordChanged) {
        const sec = this.passwordChanged.getTime() / 1000;
        return jwtTimeStamp < sec;
    }

    return false;
});
userSchema.pre('save', function (next) {
    ///////// will not work during findByIdAndUpdate
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChanged = Date.now() - 1000;
    next();
});

userSchema.pre('save', async function (next) {
    ///////// will not work during findByIdAndUpdate
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    this.passwordConfirmed = undefined;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.method('genRandResetToken', function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetToken = hashToken;
    this.expiresIn = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
});
module.exports = mongoose.model('User', userSchema);
