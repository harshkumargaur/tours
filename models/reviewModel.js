/******************
This file contains the schema design for the reviews have
review : String
createdAt : Date
rating : Number
tourRef : parent referencing
userRef : parent referencing
******************/

const mongoose = require('mongoose');
const Tour = require('./tour');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review must not be empty'],
    },
    rating: {
        type: Number,
        required: [true, 'Please provide your rating'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
    },
});

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

reviewSchema.statics.calcAvgRating = async function (tourId) {
    const aggr = await this.aggregate([
        {
            $match: {
                tour: mongoose.Types.ObjectId(tourId),
            },
        },
        {
            $group: {
                _id: null,
                count: { $count: {} },
                sumRating: { $sum: '$rating' },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    const [aggregated] = aggr;
    let { avgRating } = aggregated;
    avgRating = avgRating.toFixed(2);
    console.log(avgRating);
    const up = await Tour.findByIdAndUpdate(
        tourId,
        { ratingsAverage: avgRating },
        { new: true }
    );
    console.log(up.ratingsAverage);
};

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name',
    }).populate({
        path: 'user',
        select: 'name photo',
    });
    // this.populate(['tour', 'reviewOwn']);
    next();
});

module.exports = mongoose.model('Review', reviewSchema);
