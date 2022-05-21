const mongoose = require('mongoose');
const Tour = require('./../models/tour');
const factory = require('./../controllers/handleFactory');

const ApiFeatures = require('../utils/features');
const CustomError = require('../utils/error');
exports.getAllTours = async function (req, res) {
    try {
        const api = new ApiFeatures(Tour.find().populate('reviews'), req.query)
            .filter()
            .sort()
            .fields()
            .pagination();
        const tours = await api.query;

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours: tours,
            },
        });
    } catch (e) {
        res.status(400).json({
            status: 'failed',
            err: e.message,
        });
    }
};

exports.createNewTour = async function (req, res, next) {
    try {
        const tour = await Tour.create(req.body);
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (e) {
        const err = new CustomError(431, e.message);
        next(err);
    } finally {
    }
};

exports.findTour = factory.getOne(Tour, {
    path: 'reviews',
    ref: 'Review',
});
exports.patchTour = factory.update(Tour);
exports.deleteOne = factory.delete(Tour);

exports.putTour = async function (req, res) {
    const update = req.body;
    try {
        const upTour = await Tour.findByIdAndUpdate(
            mongoose.Types.ObjectId(req.params.id),
            update,
            { new: true, runValidators: true }
        );
        if (!upTour) {
            const err = new CustomError(500, 'cannot find the data');
            next(err);
            return;
        }
        res.status(200).json({
            status: 'success',
            data: {
                upTour,
            },
        });
    } catch (e) {
        res.status(400).json({
            status: 'failed',
            err: e.message,
        });
    } finally {
    }
};

exports.aggregation = async function (req, res) {
    try {
        const aggr = await Tour.aggregate([
            {
                $match: {
                    price: { $gt: 400 },
                },
            },
            {
                $group: {
                    _id: null, //////all the matched docs
                    count: { $count: {} },
                    avgPrice: { $avg: '$price' },
                    sumAllRating: { $sum: '$ratingsQuantity' },
                    maxPrice: { $max: '$price' },
                    minPrice: { $min: '$price' },
                },
            },
        ]);

        res.status(200).json({
            status: 'success',
            length: aggr.length,
            aggr,
        });
    } catch (e) {
        res.status(400).json({
            status: 'failed',
            err: e.message,
        });
    } finally {
    }
};
