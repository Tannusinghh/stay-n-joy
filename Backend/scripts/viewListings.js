/**
 * View all listing data in MongoDB (read-only).
 * Run: node scripts/viewListings.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const listing = require('../models/staynenjoy_schema');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/your-db-name';

function formatListing(doc, index) {
  const id = doc._id?.toString() || '—';
  const title = doc.title || '—';
  const location = [doc.location, doc.country].filter(Boolean).join(', ') || '—';
  const price = doc.price != null ? `$${doc.price}` : '—';
  const seedId = doc.seedId || '(none)';
  const imagesCount = Array.isArray(doc.images) ? doc.images.length : (doc.image?.url ? 1 : 0);
  const amenitiesCount = Array.isArray(doc.amenities) ? doc.amenities.length : 0;
  return {
    '#': index + 1,
    id: id.slice(-8),
    title,
    location,
    price,
    seedId,
    images: imagesCount,
    amenities: amenitiesCount,
  };
}

async function run() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB\n');

    const all = await listing.find({}).lean();
    const total = all.length;

    console.log('========== ALL LISTINGS (' + total + ') ==========\n');

    if (total === 0) {
      console.log('No listings in the database.\n');
    } else {
      all.forEach((doc, i) => {
        const row = formatListing(doc, i);
        console.log(`[${row['#']}] ${row.title}`);
        console.log(`    id: ...${row.id}  |  ${row.location}  |  ${row.price}/night`);
        console.log(`    seedId: ${row.seedId}  |  images: ${row.images}  |  amenities: ${row.amenities}`);
        console.log('');
      });
    }

    console.log('========== WHAT TO DO ==========\n');
    if (total === 0) {
      console.log('1. Seed sample listings (with images, amenities, etc.):');
      console.log('   • From browser: GET http://localhost:3000/api/seed-listings');
      console.log('   • Or from terminal: node scripts/seedListings.js\n');
      console.log('2. Start the app (npm run dev) and open the client to see listings.\n');
    } else {
      console.log('• Listings are in the DB. Open the app (npm run dev) and go to /listings.\n');
      console.log('• To add more seed data (only missing ones):');
      console.log('  GET http://localhost:3000/api/seed-listings  or  node scripts/seedListings.js\n');
      console.log('• To wipe and re-seed from scratch (legacy): GET http://localhost:3000/testing\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
