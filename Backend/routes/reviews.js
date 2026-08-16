const express = require('express');
const router = express.Router({ mergeParams: true });
const { getReview, createReview, deleteReview } = require('../controllers/review');
const { ReviewSchemaList } = require('../schema'); // Ensure this path is correct
const { isLoggedin, isReviewAuthor } = require("../loginCheck");
const ExpressError = require('../ExpressError/ExpressError');

// Middleware to validate Review Schema
const validateReview = (req, res, next) => {
    const { error } = ReviewSchemaList.validate(req.body);
    if (error) {
        return next(new ExpressError(400, error.details.map(e => e.message).join(",")));
    }
    next();
};

// Routes
router.route('/:reviewid')
    .get(isLoggedin, getReview)
    .delete(isLoggedin, isReviewAuthor, deleteReview);

router.route('/')
    .post(isLoggedin, validateReview, createReview);

module.exports = router;
