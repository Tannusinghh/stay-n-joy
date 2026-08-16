/**
 * Temp seed script: adds sample listings to MongoDB with multiple images,
 * amenities, guests, bedrooms, bathrooms, superhost, rating.
 * Run: node scripts/seedListings.js
 * Or call GET /api/seed-listings (temp route in app.js) to seed from the server.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const listing = require('../models/staynenjoy_schema');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/your-db-name';

const seedListings = [
  {
    seedId: 'cozy-beachfront-cottage',
    title: 'Cozy Beachfront Cottage',
    description: 'Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach. Perfect for couples or small families.',
    image: { url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80', filename: 'listingimage' },
    images: [
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
      'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=1200&q=80',
    ],
    price: 150,
    location: 'Malibu',
    country: 'United States',
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'Beach access', 'Parking'],
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    superhost: true,
    rating: 4.9,
    category: 'pools',
  },
  {
    seedId: 'modern-loft-downtown',
    title: 'Modern Loft in Downtown',
    description: 'Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers! High ceilings, exposed brick, and rooftop access.',
    image: { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', filename: 'listingimage' },
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    ],
    price: 120,
    location: 'New York City',
    country: 'United States',
    amenities: ['WiFi', 'Smart TV', 'Kitchen', 'Washer', 'Elevator'],
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    superhost: false,
    rating: 4.7,
    category: 'rooms',
  },
  {
    seedId: 'mountain-retreat-cabin',
    title: 'Mountain Retreat Cabin',
    description: 'Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it\'s a perfect place to recharge. Hiking trails and starry nights.',
    image: { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', filename: 'listingimage' },
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
    ],
    price: 180,
    location: 'Aspen',
    country: 'United States',
    amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Free parking', 'Hot tub'],
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    superhost: true,
    rating: 4.95,
    category: 'mountains',
  },
  {
    seedId: 'historic-villa-tuscany',
    title: 'Historic Villa in Tuscany',
    description: 'Experience the charm of Tuscany in this beautifully restored villa. Explore the rolling hills and vineyards. Pool and garden included.',
    image: { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', filename: 'listingimage' },
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    ],
    price: 350,
    location: 'Florence',
    country: 'Italy',
    amenities: ['Pool', 'Kitchen', 'WiFi', 'Air conditioning', 'Garden'],
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
    superhost: true,
    rating: 5.0,
    category: 'castles',
  },
  {
    seedId: 'beachfront-paradise-bali',
    title: 'Beachfront Paradise Bali',
    description: 'Step out of your door onto the sandy beach. This beachfront villa offers the ultimate relaxation with private pool and ocean view.',
    image: { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80', filename: 'listingimage' },
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80',
      'https://images.unsplash.com/photo-1602391833977-358a52198938?w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
    ],
    price: 280,
    location: 'Bali',
    country: 'Indonesia',
    amenities: ['Pool', 'WiFi', 'Kitchen', 'Air conditioning', 'Beach access', 'WashingMachine'],
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    superhost: true,
    rating: 4.88,
    category: 'pools',
  },
  {
    seedId: 'ski-chalet-swiss-alps',
    title: 'Ski Chalet Swiss Alps',
    description: 'Hit the slopes right from your doorstep in this ski-in/ski-out chalet. Cozy fireplace, sauna, and stunning mountain views.',
    image: { url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800&q=80', filename: 'listingimage' },
    images: [
      'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1200&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=80',
    ],
    price: 420,
    location: 'Verbier',
    country: 'Switzerland',
    amenities: ['WiFi', 'Fireplace', 'Hot tub', 'Free parking', 'Kitchen'],
    guests: 10,
    bedrooms: 5,
    bathrooms: 4,
    superhost: true,
    rating: 4.92,
    category: 'arctic',
  },
];

/**
 * Check which seed entries already exist (by seedId).
 * Returns { existingSeedIds: Set, totalInDb: number }.
 */
async function getExistingSeedState() {
  const seedIds = seedListings.map((s) => s.seedId).filter(Boolean);
  if (seedIds.length === 0) return { existingSeedIds: new Set(), totalInDb: 0 };
  const existing = await listing.find({ seedId: { $in: seedIds } }).select('seedId').lean();
  const existingSeedIds = new Set(existing.map((d) => d.seedId));
  const totalInDb = await listing.countDocuments();
  return { existingSeedIds, totalInDb };
}

/**
 * Run seed: insert only seed listings that don't already exist (by seedId).
 * opts: { disconnect: false } when called from server.
 * Returns { inserted: Document[], skipped: number, total: number, alreadyExisted: number }.
 */
async function runSeed(opts = {}) {
  const shouldDisconnect = opts.disconnect !== false;
  const alreadyConnected = mongoose.connection.readyState === 1;
  try {
    if (!alreadyConnected) {
      await mongoose.connect(MONGO_URL);
      console.log('Connected to MongoDB');
    }

    const { existingSeedIds, totalInDb } = await getExistingSeedState();
    const toInsert = seedListings.filter((s) => !s.seedId || !existingSeedIds.has(s.seedId));
    const skipped = seedListings.length - toInsert.length;

    if (toInsert.length === 0) {
      console.log(`Seed skipped: all ${seedListings.length} seed listings already exist (${totalInDb} total in DB).`);
      return { inserted: [], skipped, total: seedListings.length, alreadyExisted: skipped };
    }

    const inserted = await listing.insertMany(toInsert);
    console.log(`Seeded ${inserted.length} new listings (${skipped} already existed). Total seed set: ${seedListings.length}.`);
    return { inserted, skipped, total: seedListings.length, alreadyExisted: skipped };
  } catch (err) {
    console.error('Seed failed:', err.message);
    throw err;
  } finally {
    if (shouldDisconnect && alreadyConnected === false) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

if (require.main === module) {
  runSeed({ disconnect: true })
    .then((result) => {
      console.log('Result:', { inserted: result.inserted.length, skipped: result.skipped, total: result.total });
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = { runSeed, seedListings, getExistingSeedState };
