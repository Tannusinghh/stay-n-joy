const express = require('express');
const router = express.Router({ mergeParams: true });
const listing = require('../../models/staynenjoy_schema');
const reviewSchema = require('../../models/reviewSchema');
const { ReviewSchemaList } = require('../../schema');
const ExpressError = require('../../ExpressError/ExpressError');
const { verifyToken, requireAuth, isReviewAuthor } = require('../../middleware/apiAuth');

function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

function validateReview(req, res, next) {
    const { error } = ReviewSchemaList.validate(req.body);
    if (error) {
        return next(new ExpressError(400, error.details.map((e) => e.message).join(', ')));
    }
    next();
}

/** POST /api/listings/:id/reviews - create review */
router.post('/',
    verifyToken,
    requireAuth,
    validateReview,
    asyncWrap(async (req, res) => {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const review = new reviewSchema({ comment, rating });
        review.author = req.user._id;
        const result = await review.save();
        const listingFind = await listing.findById(id);
        if (!listingFind) {
            return res.status(404).json({ success: false, message: 'Listing not found.' });
        }
        listingFind.reviews.push(result._id);
        await listingFind.save();
        const populated = await result.populate('author');
        res.status(201).json({ success: true, data: populated });
    })
);

/** DELETE /api/listings/:id/reviews/:reviewId */
router.delete('/:reviewId',
    verifyToken,
    requireAuth,
    isReviewAuthor,
    asyncWrap(async (req, res) => {
        const { id, reviewId } = req.params;
        await reviewSchema.findByIdAndDelete(reviewId);
        await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        res.json({ success: true, message: 'Review deleted successfully.' });
    })
);

module.exports = router;
