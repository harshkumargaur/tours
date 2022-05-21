/************
This file contains the routes dealing the reviews
************/
const express = require('express');
const Review = require('./../models/reviewModel');
const reviewControl = require('./../controllers/reviewControl');
const authControl = require('./../controllers/authControl');

const router = express.Router({ mergeParams: true });
///// protect the post route by authControl.protect and authControl.authorization middleware
router
    .route('/')
    .get(reviewControl.getAllReviews)
    .post(authControl.protect, reviewControl.createReview);

router.get('/calcRating', function () {
    Review.calcAvgRating('5c88fa8cf4afda39709c2955');
});

router
    .route('/:id')
    .get(reviewControl.getOne)
    .patch(reviewControl.patchReview)
    .delete(reviewControl.deleteOne);

/************
router.route('/userReviews').get(reviewControl.getAllReviews);
************/
module.exports = router;
