const express = require('express');
const app = express();
const router = express.Router();
const userControl = require('./../controllers/users');
const authControl = require('./../controllers/authControl');
const reviewRoutes = require('./reviewRoutes');
const multer = require('multer');
const CustomError = require('./../utils/error');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img/users');
    },
    filename: function (req, file, cb) {
        cb(
            null,
            `image-${req.user.name}-${req.user._id}-${Date.now()}.${
                file.mimetype.split('/')[1]
            }`
        );
    },
});

const fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(null, false);
        cb(new CustomError(404, 'only images are accepted'));
    }
};

const upload = multer({ fileFilter: fileFilter, storage: storage });
/******************
review router will be mounted on user router

router.use('/:userId/reviews/userReviews', reviewRoutes);
******************/

/********************
 authentication routes
 auth routes don't follow the rest pattern
*********************/
router.post('/signup', authControl.createUser);
router.post('/login', authControl.login);
router.post('/forgotPassword', authControl.forgotPassword);
router.patch('/resetPassword/:token', authControl.resetPassword);
router.patch(
    '/updatePassword',
    authControl.protect,
    authControl.updatePassword
);

router.get('/me', authControl.protect, authControl.me);
//////////////////////////////////////////

/********************
updating route
these routes update the data other than password
********************/
router.patch(
    '/updateUser',
    authControl.protect,
    upload.single('photo'),
    userControl.updateUser
);
router.post(
    '/profile',
    authControl.protect,
    upload.single('photo'),
    userControl.updateProfile
);
///////////////////
router.route('/').get(userControl.getUsers).post(authControl.createUser);
router
    .route('/:id')
    .get(userControl.getOneUser)
    .delete(authControl.protect, userControl.deleteUser);

module.exports = router;
