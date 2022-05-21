const mongoose = require('mongoose');
const CustomError = require('./../utils/error');

exports.delete = (Model) =>
    async function (req, res, next) {
        const del = mongoose.Types.ObjectId(req.params.id);
        try {
            await Model.findByIdAndDelete(del);
            res.status(204).json({
                result: 'success',
            });
        } catch (e) {
            return next(new CustomError(404, 'cannot delete the data'));
        }
    };

exports.update = (Model) =>
    async function (req, res, next) {
        const patched = req.body;
        try {
            const patch = await Model.findByIdAndUpdate(
                mongoose.Types.ObjectId(req.params.id),
                patched,
                { new: true, runValidators: true }
            );
            res.status(200).json({
                status: 'success',
                data: {
                    patch,
                },
            });
        } catch (e) {
            next(new CustomError(400, e.message));
        }
    };

exports.getOne = (Model, filter) =>
    async function (req, res, next) {
        let query;

        query = Model.findById(req.params.id);

        if (filter) {
            query = Model.findById(req.params.id).populate(filter);
        }
        try {
            const data = await query;
            res.status(200).json({
                result: 'success',
                data,
            });
        } catch (e) {
            return next(
                new CustomError(
                    400,
                    'cannot get the requested data in the factory getone'
                )
            );
        }
    };
