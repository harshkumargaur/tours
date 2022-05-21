const express = require('express');
const router = express.Router();
const Tour = require('./../models/tour');
const viewControl = require('./../controllers/viewControl');
const authControl = require('./../controllers/authControl');

router.use(authControl.isLogged);

router.get('/',viewControl.overview);
router.get('/tour/:slug',viewControl.getOne);
router.get("/me",authControl.protect,viewControl.me)
router.get('/login',viewControl.login);
router.get('/logout', authControl.logout);
module.exports = router;
