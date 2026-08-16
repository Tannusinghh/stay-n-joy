const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const reviewSchema = require('./reviewSchema');
const { required } = require('joi');

const StayNJoySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['trending', 'rooms', 'mountains', 'castles', 'pools', 'camping', 'arctic', 'boat'],
        default: 'trending'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "review"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: false
        },
        coordinates: {
            type: [Number],
            required: false,
        }
    },
    // Optional: set by seed script to detect / skip duplicate seed entries
    seedId: { type: String, default: null },
    // Optional stay-stylish / detail page fields
    images: [{ type: String }],
    amenities: [{ type: String }],
    guests: { type: Number, default: null },
    bedrooms: { type: Number, default: null },
    bathrooms: { type: Number, default: null },
    superhost: { type: Boolean, default: false },
    rating: { type: Number, default: null },
});

StayNJoySchema.pre('findOneAndDelete', function (next) {
    console.log("Starting Deletion Process");
    next();
});

// Post-hook for findOneAndDelete
StayNJoySchema.post('findOneAndDelete', async function (doc) {
    if (doc && doc.reviews && doc.reviews.length) {
        try {
            await reviewSchema.deleteMany({
                _id: { $in: doc.reviews }
            });
            console.log("Deleted reviews:", doc.reviews);
        } catch (err) {
            console.error("Error deleting reviews:", err);
        }
    }
});

// Create the model from the schema
const StayNJoy = model('StayNJoy', StayNJoySchema);

// Export the model
module.exports = StayNJoy;