const mongoose = require('mongoose');
const slug = require('slug');
// const validator = require('validator');
mongoose.set('toJSON', { virtuals: true });
mongoose.set('toObject', { virtuals: true });
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A name is required for the tour'],
        unique: [true, 'must be unique'],
        // validator: {
        //     validate: validator.isAlpha,
        //     message: 'not supported',
        // },
    },
    duration: {
        type: Number,
        required: [true, 'a tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'a tour must have a gp size'],
    },
    difficulty: {
        type: String,
        required: [true, 'a tour must have a difficulty '],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'not supported {VALUE}',
        },
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A price is required'],
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        require: [true, ' tour must have a summary'],
    },
    description: {
        type: String,
        trim: true,
        require: [true, ' tour must have a description'],
    },
    coverImage: {
        type: String,
        require: [true, ' tour must have a coverImage'],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    startDates: [Date],
    startLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: [Number],
        address: String,
        description: String,
    },
    locations: [
        {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
    ],
    guides: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    slug: String,
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'tour',
});

tourSchema.index({ price: 1 });
// tourSchema.virtual('nameDif').get(function () {
//     return this.name + ' ' + this.difficulty;
// });

tourSchema.pre(/^find/, function (next) {
    this.populate({
      path:"guides",
      select:"name photo"
    });
    next();
});

module.exports = mongoose.model('Tour', tourSchema);
