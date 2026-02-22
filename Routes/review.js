const express = require('express');
const router = express.Router({ mergeParams: true });
const WrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js');
const Review = require('../models/reviews.js');
const Listing = require('../models/listing.js');

const reviewController = require('../controller/reviews.js');

//Review Creation Route
router.post("/",
    isLoggedIn, 
    validateReview, 
    WrapAsync(reviewController.createReview));

//Review Deletion Route
router.delete("/:reviewId",
    isLoggedIn, 
    isReviewAuthor,
    WrapAsync(reviewController.deleteReview));

module.exports = router;