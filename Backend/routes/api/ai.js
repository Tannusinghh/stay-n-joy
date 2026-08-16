const express = require('express');
const router = express.Router();
const listing = require('../../models/staynenjoy_schema');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { getItineraryWithToolCalling, smartSearchFilters } = require('../../services/aiService');

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

/**
 * Use Mapbox Geocoding API to fetch real places in the destination city.
 * Gives the AI verified place names so it suggests real locations in the right city.
 * @see https://docs.mapbox.com/api/search/geocoding/
 */
async function fetchRealPlacesInCity(destination, interests) {
    if (!geocodingClient || !destination || typeof destination !== 'string') return [];
    const dest = destination.trim();
    const interestsLower = (interests || '').toLowerCase();

    const baseQueries = ['attractions', 'landmarks', 'museum', 'park'];

    if (/food|eat|cuisine|restaurant|cafe|gastronom|fat/i.test(interestsLower)) {
        baseQueries.push('restaurant', 'cafe', 'food market', 'bakery', 'street food');
    }
    if (/night|party|club|bar|pub|drink/i.test(interestsLower)) {
        baseQueries.push('bar', 'nightclub', 'pub', 'lounge');
    }
    if (/nature|hik|garden|outdoor|trek/i.test(interestsLower)) {
        baseQueries.push('garden', 'nature reserve', 'hiking trail', 'viewpoint');
    }
    if (/shop|market|mall|boutique/i.test(interestsLower)) {
        baseQueries.push('shopping mall', 'market', 'boutique');
    }
    if (/art|culture|histor|museum|gallery/i.test(interestsLower)) {
        baseQueries.push('art gallery', 'cultural center', 'historical site');
    }
    if (/adventure|sport|water|surf|dive/i.test(interestsLower)) {
        baseQueries.push('adventure sports', 'water sports', 'beach');
    }

    const cityCenter = await geocodeCity(dest);

    const seen = new Set();
    const places = [];
    for (const category of baseQueries) {
        try {
            const opts = { query: `${category} in ${dest}`, limit: 5, types: ['poi'] };
            if (cityCenter) {
                opts.proximity = [cityCenter.lng, cityCenter.lat];
                if (cityCenter.bbox) opts.bbox = cityCenter.bbox;
            }
            const res = await geocodingClient.forwardGeocode(opts).send();
            const features = res.body?.features || [];
            for (const f of features) {
                const name = f.text || f.place_name || f.properties?.name;
                if (!name || seen.has(name.toLowerCase())) continue;
                if (cityCenter) {
                    const [lng, lat] = f.geometry?.coordinates || [];
                    if (lng != null && lat != null && haversineKm(cityCenter.lat, cityCenter.lng, lat, lng) > MAX_DISTANCE_KM) continue;
                }
                seen.add(name.toLowerCase());
                places.push(name.trim());
            }
        } catch (_) { /* ignore */ }
    }
    return places;
}

/**
 * Geocode the destination city to get its center and a rough bbox for constraining results.
 * @returns {{ lng, lat, bbox } | null} bbox: [minLng, minLat, maxLng, maxLat]
 */
async function geocodeCity(destination) {
    if (!geocodingClient || !destination) return null;
    try {
        const res = await geocodingClient.forwardGeocode({
            query: destination,
            limit: 1,
            types: ['place', 'locality', 'region']
        }).send();
        const feature = res.body?.features?.[0];
        if (feature && feature.geometry?.coordinates?.length >= 2) {
            const [lng, lat] = feature.geometry.coordinates;
            const pad = 0.35;
            const bbox = [lng - pad, lat - pad, lng + pad, lat + pad];
            return { lng, lat, bbox };
        }
    } catch (_) { /* ignore */ }
    return null;
}

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MAX_DISTANCE_KM = 50;

/**
 * Geocode one place name in the destination city. Tries multiple strategies for accuracy.
 */
async function geocodeOnePlace(name, cityCenter, destinationContext) {
    if (!geocodingClient || !name || typeof name !== 'string') return null;
    const trimmed = name.trim();
    const shortName = trimmed.includes(',') ? trimmed.split(',')[0].trim() : trimmed;

    const tryQuery = async (query, opts = {}) => {
        const options = { query, limit: 8, ...opts };
        if (cityCenter) {
            options.proximity = [cityCenter.lng, cityCenter.lat];
            if (cityCenter.bbox) options.bbox = cityCenter.bbox;
        }
        const res = await geocodingClient.forwardGeocode(options).send();
        return (res.body?.features || []).filter((f) => f.geometry?.coordinates?.length >= 2);
    };

    let features = [];
    if (destinationContext) {
        features = await tryQuery(`${shortName}, ${destinationContext}`, {
            types: ['poi', 'place', 'address', 'locality']
        });
    }
    if (features.length === 0) {
        features = await tryQuery(shortName, {
            types: ['poi', 'place', 'address'],
            ...(cityCenter?.bbox ? { bbox: cityCenter.bbox } : {})
        });
    }
    if (features.length === 0 && destinationContext) {
        features = await tryQuery(`${shortName}, ${destinationContext}`);
    }

    // Fallback: retry without bbox constraint if nothing matched so far
    if (features.length === 0 && cityCenter) {
        const noBboxQuery = async (query) => {
            const options = { query, limit: 5, proximity: [cityCenter.lng, cityCenter.lat] };
            const res = await geocodingClient.forwardGeocode(options).send();
            return (res.body?.features || []).filter((f) => f.geometry?.coordinates?.length >= 2);
        };
        features = destinationContext
            ? await noBboxQuery(`${shortName}, ${destinationContext}`)
            : await noBboxQuery(shortName);
    }

    let best = null;
    if (cityCenter) {
        for (const f of features) {
            const [lng, lat] = f.geometry.coordinates;
            const dist = haversineKm(cityCenter.lat, cityCenter.lng, lat, lng);
            if (dist <= MAX_DISTANCE_KM) {
                best = { lng, lat };
                break;
            }
        }
    }
    if (!best && features.length > 0) {
        const [lng, lat] = features[0].geometry.coordinates;
        if (!cityCenter || haversineKm(cityCenter.lat, cityCenter.lng, lat, lng) <= MAX_DISTANCE_KM) {
            best = { lng, lat };
        }
    }
    return best ? { name: trimmed, ...best } : null;
}

async function geocodeLocations(locationNames, destinationContext) {
    if (!geocodingClient || !locationNames.length) return [];

    const cityCenter = destinationContext ? await geocodeCity(destinationContext) : null;

    const results = [];
    for (let i = 0; i < locationNames.length; i++) {
        const name = locationNames[i];
        if (!name || typeof name !== 'string') {
            results.push({ name: '', lat: null, lng: null, order: i + 1 });
            continue;
        }
        try {
            const one = await geocodeOnePlace(name, cityCenter, destinationContext);
            if (one) {
                results.push({ ...one, order: i + 1 });
            } else {
                results.push({ name: name.trim(), lat: null, lng: null, order: i + 1 });
            }
        } catch (_) {
            results.push({ name: name.trim(), lat: null, lng: null, order: i + 1 });
        }
    }
    return results;
}

function asyncWrap(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

function handleAIError(err, res) {
    console.error('AI service error:', err.message);
    return res.status(503).json({ success: false, message: 'AI service temporarily unavailable. Please try again later.' });
}

function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildFilterFromAI(filters) {
    const conditions = [];
    if (filters.keywords && filters.keywords.trim()) {
        const words = filters.keywords.trim().split(/\s+/).filter(Boolean).slice(0, 10);
        if (words.length) {
            const keywordOr = words.map((w) => {
                const escaped = escapeRegex(w);
                const re = new RegExp(escaped, 'i');
                return { $or: [{ title: re }, { description: re }] };
            });
            conditions.push({ $and: keywordOr });
        }
    }
    if (typeof filters.priceMin === 'number' && filters.priceMin >= 0) {
        conditions.push({ price: { $gte: filters.priceMin } });
    }
    if (typeof filters.priceMax === 'number' && filters.priceMax >= 0) {
        conditions.push({ price: { $lte: filters.priceMax } });
    }
    if (filters.location && filters.location.trim()) {
        const escaped = escapeRegex(filters.location.trim());
        conditions.push({ location: new RegExp(escaped, 'i') });
    }
    if (filters.country && filters.country.trim()) {
        const escaped = escapeRegex(filters.country.trim());
        conditions.push({ country: new RegExp(escaped, 'i') });
    }
    return conditions.length ? { $and: conditions } : {};
}

/** POST /api/ai/itinerary - Trip planner with Mapbox tool calling (model calls search_places_in_city first, then builds itinerary) */
router.post('/itinerary', asyncWrap(async (req, res) => {
    const { destination, days, budget, interests } = req.body;
    try {
        const dest = (destination && typeof destination === 'string') ? destination.trim() : '';
        const executeTool = async (toolName, args) => {
            if (toolName === 'search_places_in_city' && args && args.city) {
                return fetchRealPlacesInCity(args.city, args.interests || interests || '');
            }
            return null;
        };
        const result = await getItineraryWithToolCalling(
            {
                destination: dest || '',
                days: days || 3,
                budget: budget || 'Medium',
                interests: interests || ''
            },
            executeTool
        );
        if (result.itineraryText) {
            return res.json({ success: true, itineraryText: result.itineraryText });
        }
        // Build map locations from ALL activities in order (so the map shows every suggested place correctly)
        const allLocationNamesInOrder = [];
        const dayNumberByIndex = [];
        (result.days || []).forEach((day, dIdx) => {
            (day.activities || []).forEach((act) => {
                if (act.location && act.location.trim()) {
                    allLocationNamesInOrder.push(act.location.trim());
                    dayNumberByIndex.push(dIdx + 1);
                }
            });
        });
        const geocoded = await geocodeLocations(allLocationNamesInOrder, dest);
        const locations = geocoded.map((loc, i) => ({
            ...loc,
            dayNumber: dayNumberByIndex[i] || i + 1,
            order: i + 1
        }));

        // Suggest StayNJoy listings near the destination
        let suggestedListings = [];
        if (dest) {
            const escaped = escapeRegex(dest);
            suggestedListings = await listing.find({
                $or: [
                    { location: new RegExp(escaped, 'i') },
                    { country: new RegExp(escaped, 'i') },
                    { title: new RegExp(escaped, 'i') }
                ]
            }).limit(6).lean();
        }

        res.json({
            success: true,
            summary: result.summary,
            days: result.days,
            locations,
            suggestedListings
        });
    } catch (err) {
        return handleAIError(err, res);
    }
}));

/** POST /api/ai/smart-search - Natural-language search: AI returns filters, we run listing.find(filter) */
router.post('/smart-search', asyncWrap(async (req, res) => {
    const query = req.body && typeof req.body.query === 'string' ? req.body.query.trim() : '';
    if (!query) {
        const allListings = await listing.find({});
        return res.json({ success: true, data: allListings, filtersUsed: null });
    }
    try {
        const filters = await smartSearchFilters(query);
        const mongoFilter = buildFilterFromAI(filters);
        const listings = await listing.find(mongoFilter);
        res.json({ success: true, data: listings, filtersUsed: Object.keys(filters).length ? filters : null });
    } catch (err) {
        return handleAIError(err, res);
    }
}));

module.exports = router;
