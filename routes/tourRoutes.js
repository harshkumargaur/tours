const express = require('express');
const app = express();
const router = express.Router();
const tourControl = require('./../controllers/tours');
const userControl = require('./../controllers/users');
const authControl = require('./../controllers/authControl');
const reviewRouter = require('./reviewRoutes');

router.use('/:tourId/reviews', reviewRouter);

router
    .route('/')
    .get(
        //authControl.protect,
        //    authControl.authorization('admin'),
        tourControl.getAllTours
    )
    .post(tourControl.createNewTour);
router.route('/aggr').get(tourControl.aggregation);
router
    .route('/:id')
    .get(tourControl.findTour)
    .put(tourControl.putTour)
    .patch(tourControl.patchTour)
    .delete(tourControl.deleteOne);
///////// implementing nested routes
// router
//     .route('/:tourId/reviews')
//     .post(authControl.protect, reviewControl.createReview);

module.exports = router;
