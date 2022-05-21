const Tour = require('./../models/tour');
const CustomError = require('./../utils/error');
exports.overview = async function (req, res, next) {
    const tours = await Tour.find();
    res.status(200).render('base', { tours: tours });
};

exports.getOne = async function (req, res, next) {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        // select: 'review rating',
    });

    if (!tour) {
        return next(new CustomError(404, 'Tour not found'));
    } else {
        res.status(200).render('tour', { tour: tour });
        // console.log(tour.reviews);
    }
};

exports.login = function (req, res, next) {
    res.status(200).render('login');
};

exports.me = function (req, res, next) {
    const me = req.user;
    res.status(200).render('accountTemplate', { me: me });
};
