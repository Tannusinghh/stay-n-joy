const express = require('express');
const router = express.Router();
const listing = require('../../models/staynenjoy_schema');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { validateSchema } = require('../../loginCheck');
const { verifyToken, requireAuth, isOwner } = require('../../middleware/apiAuth');
const { storage } = require('../../cloudconfig');
const multer = require('multer');
const upload = multer({ storage });

const CATEGORY_VALUES = ['trending', 'rooms', 'mountains', 'castles', 'pools', 'camping', 'arctic', 'boat'];

/** Build req.body.listing from flat multipart keys (listing[title], etc.) */
function parseListingBody(req, res, next) {
    if (req.body.listing) return next();
    const b = req.body;
    const category = b['listing[category]'];
    req.body.listing = {
        title: b['listing[title]'],
        description: b['listing[description]'],
        price: b['listing[price]'] !== undefined ? Number(b['listing[price]']) : undefined,
        location: b['listing[location]'],
        country: b['listing[country]'],
        category: category && CATEGORY_VALUES.includes(category) ? category : undefined,
        image: {
            url: b['listing[image][url]'] || '',
            filename: b['listing[image][filename]'] || '',
        },
    };
    next();
}

function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/** GET /api/listings - list with optional filters: category, minPrice, maxPrice, sort, q (search title) */
router.get('/', asyncWrap(async (req, res) => {
    const { category, minPrice, maxPrice, sort, q } = req.query;
    const filter = {};

    if (category && CATEGORY_VALUES.includes(category)) filter.category = category;
    if (q && String(q).trim()) filter.title = { $regex: String(q).trim(), $options: 'i' };
    if (minPrice != null && minPrice !== '') {
        const n = Number(minPrice);
        if (!Number.isNaN(n)) filter.price = { ...(filter.price || {}), $gte: n };
    }
    if (maxPrice != null && maxPrice !== '') {
        const n = Number(maxPrice);
        if (!Number.isNaN(n)) filter.price = { ...(filter.price || {}), ...(filter.price ? {} : { $gte: 0 }), $lte: n };
    }

    let query = listing.find(filter);
    if (sort === 'price_asc') query = query.sort({ price: 1 });
    else if (sort === 'price_desc') query = query.sort({ price: -1 });
    else if (sort === 'newest') query = query.sort({ _id: -1 });
    else query = query.sort({ _id: 1 });

    const data = await query.lean();
    res.json({ success: true, data });
}));

/** GET /api/listings/:id - one listing with populated reviews and owner */
router.get('/:id', asyncWrap(async (req, res) => {
    const listingFound = await listing.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } })
        .populate('owner');
    if (!listingFound) {
        return res.status(404).json({ success: false, message: 'Listing not found.' });
    }
    res.json({ success: true, data: listingFound });
}));

/** POST /api/listings - create (auth, multipart, validation) */
router.post('/',
    verifyToken,
    requireAuth,
    upload.single('listing[image][url]'),
    parseListingBody,
    validateSchema,
    asyncWrap(async (req, res) => {
        const query = req.body.listing.location;
        const response = await geocodingClient
            .forwardGeocode({ query, limit: 2 })
            .send();
        const newListing = new listing(req.body.listing);
        newListing.owner = req.user._id;
        const url = req.file ? req.file.path : (req.body.listing.image && req.body.listing.image.url) || '';
        const filename = req.file ? req.file.filename : (req.body.listing.image && req.body.listing.image.filename) || '';
        newListing.image = { url, filename };
        if (response.body.features && response.body.features[0]) {
            newListing.geometry = response.body.features[0].geometry;
        }
        const saved = await newListing.save();
        res.status(201).json({ success: true, data: saved });
    })
);

/** PUT /api/listings/:id - update (auth, owner, optional image) */
router.put('/:id',
    verifyToken,
    requireAuth,
    isOwner,
    upload.single('listing[image][url]'),
    parseListingBody,
    validateSchema,
    asyncWrap(async (req, res) => {
        const { id } = req.params;
        const query = req.body.listing.location;
        const response = await geocodingClient
            .forwardGeocode({ query, limit: 2 })
            .send();
        const existingListing = await listing.findById(id);
        if (!existingListing) {
            return res.status(404).json({ success: false, message: 'Listing not found.' });
        }
        let url = existingListing.image.url;
        let filename = existingListing.image.filename;
        const updatedListing = await listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
        if (req.file) {
            url = req.file.path;
            filename = req.file.filename;
            updatedListing.image = { url, filename };
        }
        if (response.body.features && response.body.features[0]) {
            updatedListing.geometry = response.body.features[0].geometry;
        }
        await updatedListing.save();
        res.json({ success: true, data: updatedListing });
    })
);

/** DELETE /api/listings/:id - owner only */
router.delete('/:id', verifyToken, requireAuth, isOwner, asyncWrap(async (req, res) => {
    const deleted = await listing.findByIdAndDelete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: 'Listing not found.' });
    }
    res.json({ success: true, message: 'Listing deleted successfully.' });
}));

module.exports = router;
