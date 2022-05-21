const Review = require('./../models/reviewModel');
const factory = require('./handleFactory');
const CustomError = require('./../utils/error');

exports.getAllReviews = async function (req, res, next) {
    console.log(req.params);
    const reviews = await Review.find({}); //.populate(['tour', 'user']);
    if (!reviews) {
        return next(new CustomError(404, 'cannot create review'));
    }
    res.status(200).json({
        result: 'success',
        length: reviews.length,
        data: {
            reviews: reviews,
        },
    });
};

exports.createReview = async function (req, res, next) {
    console.log('post req on reviews');
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id;
    const newReview = await Review.create({
        review: req.body.review,
        rating: req.body.rating,
        tour: req.body.tour,
        user: req.body.user,
    });

    if (!newReview) {
        return next(new CustomError(404, 'cannot create review'));
    }
    res.status(201).json({
        result: 'success',
        data: {
            newReview: newReview,
        },
    });
};
exports.getOne = factory.getOne(Review);
exports.patchReview = factory.update(Review);
exports.deleteOne = factory.delete(Review);
