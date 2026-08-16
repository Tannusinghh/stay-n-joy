const listing = require('../models/staynenjoy_schema'); // Ensure this path is correct
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const tilesetsClient = require('@mapbox/mapbox-sdk/services/tilesets');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index = async (req, res, next) => {
    const allListings = await listing.find({});
    if (!allListings) {
        req.flash("error", "No listing Found");
    }
    res.render('main', { data: allListings, query: null });
};

module.exports.newForm = (req, res) => {
    // console.log(req.user); //CONSOLE LOG USERS
    res.render('new_listings');
};

module.exports.newFormPublish = async (req, res, next) => {
    let  query = req.body.listing.location

    // Forward geocoding request
    let response = await geocodingClient
        .forwardGeocode({
            query: query, // Use the dynamic query from the request
            limit: 2
        })
        .send();

    // Extract match from the response
    const match = response.body;

    if(!req.isAuthenticated()){
        req.flash("error", "You must be loggged in to StayNJoy")
        return res.redirect('/login');
    }
    let newListing = new listing(req.body.listing);

    newListing.owner = req.user._id
    let url = req.file.path; // Default to the existing URL
    let filename = req.file.filename; // Default to the existing filename
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    let saved = await newListing.save();
    console.log(saved);
    console.log(req.file);

    req.flash("Success", "New Listing Created Successfuly")
    res.redirect(`/listings`);
};

module.exports.editForm = async (req, res, next) => {
    const { id } = req.params;
    const listingFound = await listing.findById(id);
    if (!listingFound) {
        req.flash("error", "Listing Doesnt Found");
        res.redirect('/listings');
    };
    let orignalImage = listingFound.image.url;
    orignalImage.replace("/upload", "/upload/h_300,w_250");
    res.render('edit_hotels', { data: listingFound, image: orignalImage });
};

module.exports.search = async(req, res, next) => {
    let query = req.query.q;
    console.log(query);
    if (!query) {
            return res.redirect('/listings');
        }
    const listings = await listing.find({
            title: { $regex: new RegExp(query, 'i') } // 'i' for case-insensitive
        });
     res.render('main', { data: listings, query: query });

}

module.exports.editFormUpload = async (req, res, next) => {
    const { id } = req.params;
    let  query = req.body.listing.location
    let response = await geocodingClient
        .forwardGeocode({
            query: query, // Use the dynamic query from the request
            limit: 2
        })
        .send();

    // Extract match from the response
    const match = response.body;
    console.log(response.body.features[0].geometry);
    console.log(req.body.listing);
    
    // Fetch the existing listing to retain current image data if no new image is uploaded
    const existingListing = await listing.findById(id);
    console.log(existingListing);

    // Extract fields from the request body
    let url = existingListing.image.url; // Default to the existing URL
    let filename = existingListing.image.filename; // Default to the existing filename
    const updatedListing = await listing.findByIdAndUpdate(id, {...req.body.listing}, { new: true });
    // Update the listing with new data
    if (typeof req.file !== "undefined") {
        // If a new file is uploaded, use its details
        url = req.file.path;
        filename = req.file.filename;
        updatedListing.image = {url, filename};
        await updatedListing.save();
    }
    updatedListing.geometry = response.body.features[0].geometry;
    await updatedListing.save();
    if (!updatedListing) {
        req.flash("error", "Listing Doesn't Exist");
        return res.redirect('/listings');
    }

    req.flash("Success", "Listing Modified Successfully");
    res.redirect(`/listings/${id}`);
};


module.exports.showListing = async (req, res, next) => {
    const { id } = req.params;
    const listingFound = await listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if (!listingFound) {
        req.flash("error", "Listing Doesnt Found");
        res.redirect('/listings');
    };
    console.log(listingFound);
    res.render('hotels', { data: listingFound });
};

module.exports.deleteListing = async (req, res, next) => {
    const { id } = req.params;
    try {
        await listing.findByIdAndDelete(id);
        req.flash("Success", "Listing Deleted Successfuly");
        res.redirect('/listings');
    } catch (err) {
        next(err);
    }
};