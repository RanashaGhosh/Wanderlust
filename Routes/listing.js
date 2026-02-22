const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const WrapAsync = require('../utils/WrapAsync');
const { isLoggedIn, isOwner, validatelisting } = require('../middleware');

const listingController = require('../controller/listing');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });


// Index and Create routes
router
  .route('/')
   .get(WrapAsync(listingController.index))
   .post(
    isLoggedIn, 
    
    upload.single('listing[image]'),
    validatelisting, 
    WrapAsync(listingController.create)
);
    


// New route
router.get('/new', isLoggedIn, listingController.new);


// Show, Update, and Delete routes
router
    .route('/:id')
    .get(WrapAsync( listingController.show))
    .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validatelisting, 
    WrapAsync(listingController.update))
    .delete(isLoggedIn, isOwner, WrapAsync(listingController.delete));


// Edit route
router.get('/:id/edit',
    isLoggedIn, 
    isOwner,
    WrapAsync(listingController.edit)
);


module.exports = router;

