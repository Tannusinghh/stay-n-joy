const express = require('express');
const router = express.Router({mergeParams: true});
const { isLoggedin, isOwner, validateSchema } = require("../loginCheck");
const listingController = require('../controllers/listings.js');
const multer  = require('multer');
const {storage} = require('../cloudconfig.js');
const upload = multer({ storage });


// Helper function to handle async errors
function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// Routes
router.route('/new')
    .get(isLoggedin, listingController.newForm)
    .post(isLoggedin,
        upload.single('listing[image][url]'),
        validateSchema,
        asyncWrap(listingController.newFormPublish));


router.route('/')
    .get(asyncWrap(listingController.index));

router.route('/search')
    .get(asyncWrap(listingController.search));

router.route('/edit/:id')
    .get(isLoggedin, asyncWrap(listingController.editForm))
    .put(isLoggedin,
         isOwner,
         upload.single('listing[image][url]'),
         validateSchema,
          asyncWrap(listingController.editFormUpload));

router.route('/:id')
    .get(asyncWrap(listingController.showListing))
    .delete(isLoggedin, asyncWrap(listingController.deleteListing));

// Export the router
module.exports = router;
