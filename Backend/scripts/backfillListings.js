/**
 * Backfill missing listing data: images array, amenities, guests, bedrooms, bathrooms, rating.
 * Removes duplicate seed entries (same title+location as seed but no seedId).
 * Run: node scripts/backfillListings.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const listing = require('../models/staynenjoy_schema');
const { seedListings } = require('./seedListings');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/your-db-name';

async function backfill() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB\n');

  const CATEGORIES = ['trending', 'rooms', 'mountains', 'castles', 'pools', 'camping', 'arctic', 'boat'];
  function inferCategory(doc) {
    const t = ((doc.title || '') + ' ' + (doc.description || '')).toLowerCase();
    if (/\bmountain|retreat|cabin|banff|aspen|alps\b/.test(t)) return 'mountains';
    if (/\bpool|beach|ocean|villa|paradise\b/.test(t)) return 'pools';
    if (/\bcastle|historic|villa|tuscany|scotland\b/.test(t)) return 'castles';
    if (/\bcamping|cabin|treehouse|tent|lake\b/.test(t)) return 'camping';
    if (/\barctic|ski|snow|chalet|swiss\b/.test(t)) return 'arctic';
    if (/\bboat|ship|sail\b/.test(t)) return 'boat';
    if (/\bloft|apartment|room|downtown\b/.test(t)) return 'rooms';
    return 'trending';
  }

  let updatedImages = 0;
  let updatedAmenities = 0;
  let updatedCategory = 0;
  let removedDuplicates = 0;

  // 1) Ensure images array: if listing has image.url but no images (or empty), set images = [image.url]
  const withSingleImage = await listing.find({
    $or: [
      { images: { $exists: false } },
      { images: { $size: 0 } },
    ],
    'image.url': { $exists: true, $ne: '' },
  });

  for (const doc of withSingleImage) {
    await listing.updateOne(
      { _id: doc._id },
      { $set: { images: [doc.image.url] } }
    );
    updatedImages++;
  }
  if (updatedImages) console.log(`Backfilled images array for ${updatedImages} listings.`);

  // 2) Defaults for listings with no amenities
  const defaultAmenities = ['WiFi', 'Kitchen'];
  const noAmenities = await listing.find({
    $or: [
      { amenities: { $exists: false } },
      { amenities: { $size: 0 } },
    ],
  });

  for (const doc of noAmenities) {
    await listing.updateOne(
      { _id: doc._id },
      {
        $set: {
          amenities: defaultAmenities,
          guests: doc.guests ?? 4,
          bedrooms: doc.bedrooms ?? 2,
          bathrooms: doc.bathrooms ?? 1,
          rating: doc.rating ?? 4.5,
          superhost: doc.superhost ?? false,
        },
      }
    );
    updatedAmenities++;
  }
  if (updatedAmenities) console.log(`Backfilled amenities/guests/bedrooms/bathrooms/rating for ${updatedAmenities} listings.`);

  // 3) Set category for listings that don't have it
  const noCategory = await listing.find({
    $or: [
      { category: { $exists: false } },
      { category: null },
      { category: '' },
    ],
  });
  for (const doc of noCategory) {
    const category = inferCategory(doc);
    await listing.updateOne({ _id: doc._id }, { $set: { category } });
    updatedCategory++;
  }
  if (updatedCategory) console.log(`Backfilled category for ${updatedCategory} listings.`);

  // 4) Remove duplicate seed entries: same title+location as seed but no seedId (keep the one with seedId)
  const seedKeys = new Set(seedListings.map((s) => `${s.title}|${s.location}|${s.country}`));
  const duplicates = await listing.find({
    seedId: { $in: [null, ''] },
    $expr: {
      $in: [{ $concat: ['$title', '|', '$location', '|', '$country'] }, Array.from(seedKeys)],
    },
  });

  for (const doc of duplicates) {
    const hasSeedVersion = await listing.findOne({
      seedId: { $nin: [null, ''] },
      title: doc.title,
      location: doc.location,
      country: doc.country,
    });
    if (hasSeedVersion) {
      await listing.deleteOne({ _id: doc._id });
      removedDuplicates++;
    }
  }
  if (removedDuplicates) console.log(`Removed ${removedDuplicates} duplicate seed listings (kept the one with seedId).`);

  // 5) Remove duplicates by location+country: when a seed listing exists for (location, country), remove other listings in same place (no seedId)
  const seedLocations = await listing.find({ seedId: { $nin: [null, ''] } }).select('location country').lean();
  const locationKeys = new Set(seedLocations.map((d) => `${d.location}|${d.country}`));
  let removedByLocation = 0;
  for (const key of locationKeys) {
    const [location, country] = key.split('|');
    const toRemove = await listing.find({
      location,
      country,
      $or: [{ seedId: null }, { seedId: '' }],
    });
    for (const doc of toRemove) {
      await listing.deleteOne({ _id: doc._id });
      removedByLocation++;
    }
  }
  if (removedByLocation) console.log(`Removed ${removedByLocation} duplicate listings (same location as a seed listing, kept seed).`);

  console.log('\nBackfill done.');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

backfill().catch((err) => {
  console.error(err);
  process.exit(1);
});
