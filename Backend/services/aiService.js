const { Groq } = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.3-70b-versatile';
const MODEL_ITINERARY = 'llama-3.3-70b-versatile';

/**
 * Travel assistant: answer user question about a specific listing.
 * @param {string} question - User question
 * @param {object} listing - Listing doc (title, description, price, location, country, reviews if populated)
 * @returns {Promise<string>} AI response
 */
async function askAI(question, listing) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
    }
    const reviewsText = listing.reviews && listing.reviews.length
        ? listing.reviews.map(r => `- ${r.rating}/5: ${r.comment || ''}`).join('\n')
        : 'No reviews yet.';
    const prompt = `You are an AI travel assistant for StayNJoy, a vacation rental platform.

Listing info:
- Title: ${listing.title}
- Location: ${listing.location}, ${listing.country}
- Price: $${listing.price} per night
- Description: ${listing.description}

Reviews:
${reviewsText}

User question: ${question}

Answer helpfully and concisely as a travel assistant. Use bullet points where useful. Do not make up amenities or features not mentioned.`;

    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.3
    });
    return response.choices[0]?.message?.content?.trim() || 'No response.';
}

/**
 * Generate a structured itinerary for a trip.
 * @param {object} params - { destination, days, budget, interests, mapboxPlaces?: string[] }
 * @returns {Promise<{ summary?: string, days?: Array, locationNames?: string[] } | { itineraryText: string }>}
 */
async function getItinerary({ destination, days, budget, interests, mapboxPlaces = [] }) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
    }
    const dest = destination?.trim() || 'the chosen city';
    const numDays = Math.min(Math.max(Number(days) || 3, 1), 14);
    const mapboxSection = mapboxPlaces.length > 0
        ? `\nREAL PLACES IN ${dest} (from Mapbox – use these when possible; they are verified to be in ${dest}):\n${mapboxPlaces.slice(0, 25).map((p) => `- ${p}`).join('\n')}\n`
        : '';

    const prompt = `You are an AI trip planner for StayNJoy. Create a travel itinerary.

DESTINATION (you MUST use only this city): ${dest}

Every place you suggest MUST be in ${dest}. Do NOT suggest any location in any other city (e.g. not Pune, not Mumbai, not Delhi, not any other city). Only ${dest}.
${mapboxSection}
Input:
- Destination: ${dest}
- Number of days: ${numDays}
- Budget: ${budget || 'Medium'}
- Interests: ${interests || 'General sightseeing'}

CRITICAL - No hallucination and correct city only:
- Every "location" and every entry in "locationNames" MUST be a real place IN ${dest} ONLY. If you do not know a place in ${dest}, use a generic area name in ${dest} (e.g. "city center of ${dest}", "a market in ${dest}").
- Use ONLY real, well-known places in ${dest}: landmarks, museums, attractions, neighbourhoods. Do NOT suggest places in any other city.
- Do NOT invent restaurant or business names. For food use: "a café in [area of ${dest}]", "lunch in [neighbourhood]", or a real landmark/market in ${dest}.
- "location" must be a real, mappable place in ${dest} only.${mapboxPlaces.length > 0 ? ' Prefer the real places listed above (from Mapbox) for "location" and "locationNames".' : ''}

Respond with ONLY valid JSON (no markdown, no code fence). Use this exact structure. Keep each "description" to ONE short sentence so the response is complete.
{
  "summary": "2-3 sentence intro to the trip.",
  "days": [
    {
      "dayNumber": 1,
      "title": "Day 1: [Theme]",
      "activities": [
        {
          "time": "Morning",
          "title": "Short activity title",
          "description": "One short sentence only.",
          "location": "Real landmark or area name"
        }
      ]
    }
  ],
  "locationNames": ["Real place 1", "Real place 2"]
}

Rules:
- Exactly ${numDays} days. Each day: 3 activities (Morning, Afternoon, Evening). No extra text outside the JSON.
- "location" and "locationNames": ONLY places in ${dest}. Same order in locationNames as visit order. Never use a different city.
- Keep every description to one short sentence. Output must be valid, complete JSON.`;

    const response = await groq.chat.completions.create({
        model: MODEL_ITINERARY,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.3
    });
    const raw = response.choices[0]?.message?.content?.trim() || '';
    let cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) cleaned = cleaned.slice(firstBrace);

    function tryParse(jsonStr) {
        try {
            return JSON.parse(jsonStr);
        } catch (_) {
            return null;
        }
    }

    let parsed = tryParse(cleaned);
    if (!parsed && cleaned.startsWith('{')) {
        const trimEnd = cleaned.trimEnd();
        const suffixes = ['"}]}]}', '"}]}', '"]}', ']}', '}'];
        for (const suf of suffixes) {
            parsed = tryParse(trimEnd + suf);
            if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) break;
        }
    }
    if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
        return {
            summary: typeof parsed.summary === 'string' ? parsed.summary : '',
            days: parsed.days,
            locationNames: Array.isArray(parsed.locationNames) ? parsed.locationNames : []
        };
    }
    return { itineraryText: raw };
}

const MAPBOX_SEARCH_TOOL = {
    type: 'function',
    function: {
        name: 'search_places_in_city',
        description: 'Search for real places in a city using Mapbox. Returns verified place names tailored to the traveller\'s interests. Call this FIRST before building the itinerary.',
        parameters: {
            type: 'object',
            properties: {
                city: {
                    type: 'string',
                    description: 'The destination city name, e.g. Bangalore, Tokyo, London'
                },
                interests: {
                    type: 'string',
                    description: 'Comma-separated traveller interests, e.g. "food, nightlife, culture". Helps return relevant POIs.'
                }
            },
            required: ['city']
        }
    }
};

/**
 * Generate itinerary using tool calling: model calls search_places_in_city first, then builds itinerary from real Mapbox data.
 * @param {object} params - { destination, days, budget, interests }
 * @param {function} executeTool - async (toolName, args) => result. Called when model returns tool_calls.
 * @returns {Promise<{ summary?, days?, locationNames? } | { itineraryText: string }>}
 */
async function getItineraryWithToolCalling(params, executeTool) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');
    const dest = (params.destination && params.destination.trim()) || 'the chosen city';
    const numDays = Math.min(Math.max(Number(params.days) || 3, 1), 14);

    const interests = (params.interests && String(params.interests).trim()) || 'General sightseeing';
    const userMessage = `Create a ${numDays}-day travel itinerary for this destination and preferences.

DESTINATION (you MUST use only this city): ${dest}
Number of days: ${numDays}
Budget: ${params.budget || 'Medium'}
USER INTERESTS (tailor the itinerary strongly to these): ${interests}

CRITICAL – Match the itinerary to their interests:
- If they mention FOOD, EATING, or being "fat" and liking food: include specific dining suggestions every day (breakfast spot, lunch venue, dinner restaurant or area). Name real or well-known places. Make food a central theme (e.g. "Day 1: Food and Culture", suggest a café, a market, a restaurant).
- If they mention PARTIES, NIGHTLIFE, or going out: include evening activities like bars, clubs, cabarets, or lively areas. Name specific venues or neighbourhoods where relevant.
- Weave their interests into every day: don't give a generic sightseeing plan. Prioritise what they asked for (food, parties, etc.) while still including key landmarks if appropriate.

IMPORTANT: First call the search_places_in_city tool with city="${dest}" and interests="${interests}" to get real places matching the traveller's interests. Then build your itinerary using those or similar real places in ${dest} only. Every "location" in each activity MUST be a real place name (landmark, restaurant, market, neighbourhood) in ${dest}. The "locationNames" array must list EVERY location you use, in the exact order they are visited (all mornings, then afternoons, then evenings day by day), so the map can show the full route. Use the same spelling for the same place in both "location" and "locationNames".

Respond with ONLY valid JSON (no markdown):
{
  "summary": "2-3 sentence intro that mentions their interests (e.g. food, parties).",
  "days": [ { "dayNumber": 1, "title": "Day 1: [Theme reflecting their interests]", "activities": [ { "time": "Morning", "title": "...", "description": "One sentence.", "location": "Exact place name in ${dest}" } ] } ],
  "locationNames": ["Place1", "Place2", "..." ]
}
Exactly ${numDays} days, 3 activities per day (Morning, Afternoon, Evening). Keep descriptions to one short sentence. locationNames must include every location from every activity, in visit order.`;

    const messages = [{ role: 'user', content: userMessage }];
    const tools = [MAPBOX_SEARCH_TOOL];
    const maxIterations = 5;

    for (let i = 0; i < maxIterations; i++) {
        const options = {
            model: MODEL_ITINERARY,
            messages,
            max_tokens: 4096,
            temperature: 0.3
        };
        if (i === 0) {
            options.tools = tools;
            options.tool_choice = 'required';
        } else {
            options.tools = tools;
            options.tool_choice = 'none';
        }

        const response = await groq.chat.completions.create(options);
        const choice = response.choices && response.choices[0];
        if (!choice) return { itineraryText: 'No response.' };

        const msg = choice.message;
        messages.push({
            role: 'assistant',
            content: msg.content || null,
            tool_calls: msg.tool_calls || undefined
        });

        if (!msg.tool_calls || msg.tool_calls.length === 0) {
            const raw = (msg.content || '').trim();
            let cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
            const firstBrace = cleaned.indexOf('{');
            if (firstBrace > 0) cleaned = cleaned.slice(firstBrace);
            try {
                const parsed = JSON.parse(cleaned);
                if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
                    return {
                        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
                        days: parsed.days,
                        locationNames: Array.isArray(parsed.locationNames) ? parsed.locationNames : []
                    };
                }
            } catch (_) {}
            return { itineraryText: raw };
        }

        for (const tc of msg.tool_calls) {
            const name = tc.function?.name;
            let args = {};
            try {
                args = typeof tc.function?.arguments === 'string' ? JSON.parse(tc.function.arguments) : {};
            } catch (_) {}
            let content = '';
            if (executeTool && name === 'search_places_in_city') {
                const result = await executeTool(name, args);
                content = Array.isArray(result) ? result.join(', ') : (result != null ? String(result) : '');
            }
            messages.push({
                role: 'tool',
                tool_call_id: tc.id,
                content: content || 'No places found. Use generic areas in the city.'
            });
        }
    }
    return { itineraryText: 'Tool loop did not complete.' };
}

/**
 * Parse natural-language search into structured filters for MongoDB.
 * Returns only validated keys: keywords, priceMin, priceMax, location, country.
 * @param {string} query - User's natural-language search (e.g. "cheap place near beach in Goa")
 * @returns {Promise<{ keywords?: string, priceMin?: number, priceMax?: number, location?: string, country?: string }>}
 */
async function smartSearchFilters(query) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
    }
    const q = (query && typeof query === 'string') ? query.trim() : '';
    if (!q) return {};

    const prompt = `You are a search filter assistant for StayNJoy, a vacation rental site. Convert the user's search into structured filters.

User search: "${q}"

Respond with ONLY valid JSON (no markdown, no code fence). Use exactly these keys only:
- "keywords": string, space-separated words to match in title or description (e.g. "beach luxury", "pool view"). Empty string if none.
- "priceMin": number or null (minimum price per night, e.g. 50 for "cheap" or "under 100").
- "priceMax": number or null (maximum price per night, e.g. 150 for "under 150" or "budget").
- "location": string or null (city/area name mentioned, e.g. "Goa", "Mumbai"). Null if not specified.
- "country": string or null (country name if clear). Null if not specified.

Rules: Use only these five keys. No other keys. No MongoDB operators. Numbers must be integers. Empty or irrelevant search → return {"keywords":"","priceMin":null,"priceMax":null,"location":null,"country":null}.`;

    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256,
        temperature: 0.2
    });
    const raw = response.choices[0]?.message?.content?.trim() || '';
    let cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) cleaned = cleaned.slice(firstBrace);
    try {
        const parsed = JSON.parse(cleaned);
        const out = {};
        if (parsed && typeof parsed === 'object') {
            if (typeof parsed.keywords === 'string') out.keywords = parsed.keywords.trim();
            if (typeof parsed.priceMin === 'number' && !Number.isNaN(parsed.priceMin)) out.priceMin = Math.max(0, Math.floor(parsed.priceMin));
            else if (parsed.priceMin === null) out.priceMin = null;
            if (typeof parsed.priceMax === 'number' && !Number.isNaN(parsed.priceMax)) out.priceMax = Math.max(0, Math.floor(parsed.priceMax));
            else if (parsed.priceMax === null) out.priceMax = null;
            if (typeof parsed.location === 'string' && parsed.location.trim()) out.location = parsed.location.trim();
            if (typeof parsed.country === 'string' && parsed.country.trim()) out.country = parsed.country.trim();
        }
        return out;
    } catch (_) {
        return {};
    }
}

/**
 * Summarize reviews for a listing into "Guest highlights" and "Things to note".
 * @param {object} listing - Listing with populated reviews (comment, rating)
 * @returns {Promise<{ highlights: string[], notes: string[] }>}
 */
async function getReviewSummary(listing) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
    }
    const reviews = listing.reviews || [];
    if (reviews.length === 0) {
        return { highlights: [], notes: [] };
    }
    const reviewsText = reviews.map(r => `Rating ${r.rating}/5: ${r.comment || 'No comment'}`).join('\n');

    const prompt = `You are an AI assistant summarizing guest reviews for a vacation rental listing.

Listing: ${listing.title}, ${listing.location}

Reviews:
${reviewsText}

Respond with exactly two sections in this format (use bullet points, one per line):

Guest highlights:
- [positive point 1]
- [positive point 2]

Things to note:
- [neutral or caution 1]
- [neutral or caution 2]

If there are no notable negatives, write "Nothing major mentioned" under Things to note. Keep each bullet short (one line).`;

    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
        temperature: 0.2
    });
    const text = response.choices[0]?.message?.content?.trim() || '';
    const highlights = [];
    const notes = [];
    let section = null;
    for (const line of text.split('\n')) {
        const t = line.trim();
        if (/^guest highlights?:/i.test(t)) { section = 'highlights'; continue; }
        if (/^things to note?:/i.test(t)) { section = 'notes'; continue; }
        if (t.startsWith('- ') && section) {
            const content = t.slice(2).trim();
            if (section === 'highlights') highlights.push(content);
            else notes.push(content);
        }
    }
    return { highlights: highlights.length ? highlights : ['No summary available.'], notes: notes.length ? notes : ['Nothing major mentioned.'] };
}

module.exports = {
    askAI,
    getItinerary,
    getItineraryWithToolCalling,
    getReviewSummary,
    smartSearchFilters
};
