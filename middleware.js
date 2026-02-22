const Listing = require('./models/listing');
const Review = require('./models/reviews');
const ExpressError = require('./utils/ExpressError');
const { listingSchema, reviewSchema } = require('./schema.js');

module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.path,".." ,req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in to access that page!');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};



module.exports.validatelisting = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    console.log(error);
    if(error){
        let errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errmsg);
    } else{
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errmsg);
    } else{
        next();
    }
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(req.user._id)){
        req.flash('error', "You are not authorized to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(req.user._id)){
        req.flash('error', "You are not authorized to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}