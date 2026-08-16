const listing = require('./models/staynenjoy_schema');
const ExpressError = require('./ExpressError/ExpressError');
const reviewSchema = require('./models/reviewSchema'); // Ensure this path is correct
const { SchemaList } = require('./schema');


module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;  // Fix the typo here
        req.flash("error", "You must be logged in to StayNJoy");
        return res.redirect('/login');
    }
    next();
};



module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        console.log("Redirect URL found and saved to res.locals:", res.locals.redirectUrl);
        delete req.session.redirectUrl;  // Clear the session variable after saving it to res.locals
    }
    next();
};


module.exports.isOwner = async(req, res, next) => {
    const { id } = req.params;
    let listing_check = await listing.findById(id);
    if(!listing_check.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You Dont have permission to edit as you are not the owner of the listing");
        res.redirect(`/listings/${id}`);
    };
    next();
}

module.exports.validateSchema = (req, res, next) => {
    const { error } = SchemaList.validate(req.body);
    if (error) {
        console.log(`Error message => ${error}`);
        let errmessage = error.details.map((e) => e.message).join(",");
        return next(new ExpressError(400, errmessage));
    }
    next();
};

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id,  reviewid } = req.params;
    let result = await reviewSchema.findById(reviewid);
    if(!result.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`)
    };
    next();
}