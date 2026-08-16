const jwt = require('jsonwebtoken');
const userSchema = require('../models/userSchema');
const listing = require('../models/staynenjoy_schema');
const reviewSchema = require('../models/reviewSchema');

const JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';

function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/** Verify JWT from Authorization: Bearer <token>, attach req.user */
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userSchema.findById(decoded.userId)
            .then((user) => {
                if (!user) {
                    return res.status(401).json({ success: false, message: 'User not found.' });
                }
                req.user = user;
                res.locals.currUser = user;
                next();
            })
            .catch((err) => next(err));
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
}

/** Require auth for API; returns 401 JSON if not authenticated */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'You must be logged in.' });
    }
    next();
}

/** Check listing ownership; use after verifyToken. Returns 403 JSON if not owner */
const isOwner = asyncWrap(async (req, res, next) => {
    const { id } = req.params;
    const listingCheck = await listing.findById(id);
    if (!listingCheck) {
        return res.status(404).json({ success: false, message: 'Listing not found.' });
    }
    const ownerId = listingCheck.owner._id || listingCheck.owner;
    if (!ownerId.equals(req.user._id)) {
        return res.status(403).json({ success: false, message: 'You do not have permission to edit this listing.' });
    }
    next();
});

/** Check review authorship; use after verifyToken. Returns 403 JSON if not author */
const isReviewAuthor = asyncWrap(async (req, res, next) => {
    const { reviewId } = req.params;
    const rev = await reviewSchema.findById(reviewId).populate('author');
    if (!rev) {
        return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    const authorId = rev.author._id || rev.author;
    if (!authorId.equals(req.user._id)) {
        return res.status(403).json({ success: false, message: 'You are not the author of this review.' });
    }
    next();
});

function signToken(user) {
    return jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

module.exports = {
    verifyToken,
    requireAuth,
    isOwner,
    isReviewAuthor,
    signToken,
    JWT_SECRET,
};
