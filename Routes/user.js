const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const WrapAsync = require('../utils/WrapAsync.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');

const userController = require('../controller/users.js');
const user = require('../models/user.js');
const { render } = require('ejs');

// Signup routes
router
    .route('/signup')
    .get( userController.renderSignup)
    .post( WrapAsync(userController.signup));


// Login routes
router
    .route('/login')
    .get( userController.renderLogin)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login" , 
            failureFlash: true,
        }),
        userController.login
    );


// Logout route
router.get("/logout", userController.logout);

module.exports = router;