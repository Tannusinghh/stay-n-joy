const ExpressError = require('../ExpressError/ExpressError');
const listing = require('../models/staynenjoy_schema'); // Ensure this path is correct
const reviewSchema = require('../models/reviewSchema'); // Ensure this path is correct

// Helper function to handle async errors
function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports.getReview = asyncWrap(async (req, res, next) => {
    const { id, reviewid } = req.params;
    req.flash("error", "Error Occurred");
    res.redirect(`/listings/${id}`);
});

module.exports.createReview = asyncWrap(async (req, res, next) => {
    const { rating, comment } = req.body;
    const { id } = req.params;

    const review = new reviewSchema({ comment, rating });
    review.author = req.user._id;

    const result = await review.save();
    if (!result) { 
        throw new ExpressError(401, "Error occurred");
    }

    const listingFind = await listing.findById(id);
    if (!listingFind) {
        req.flash("error", "Listing wasn't found");
        res.redirect("/listings");
        throw new ExpressError(404, "Listing doesn't exist");
    }

    listingFind.reviews.push(result._id);
    await listingFind.save();
    req.flash("Success", "Review Created Successfully");
    res.redirect(`/listings/${id}`);
});

module.exports.deleteReview = asyncWrap(async (req, res, next) => {
    const { id, reviewid } = req.params;
    await reviewSchema.findByIdAndDelete(reviewid);
    await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    req.flash("Success", "Review Deleted Successfully");
    res.redirect(`/listings/${id}`);
});
