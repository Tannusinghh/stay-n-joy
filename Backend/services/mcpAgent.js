/**
 * Data-scoped chat agent: Groq + 6 read-only MongoDB tools.
 * Answers only from real listing/review data.
 */

const Groq = require('groq-sdk');
const listing = require('../models/staynenjoy_schema');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_listings',
      description: 'Search listings by keyword (title/location), optional price range (minPrice, maxPrice) and category. Use for questions like "listings in Aspen under $200" or "beach places in Bali".',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keyword for title or location' },
          minPrice: { type: 'number', description: 'Minimum price per night' },
          maxPrice: { type: 'number', description: 'Maximum price per night' },
          category: { type: 'string', description: 'Category: trending, rooms, mountains, castles, pools, camping, arctic, boat' },
          limit: { type: 'number', description: 'Max results, use 10 if not specified' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_listing_details',
      description: 'Get full details for one listing by its MongoDB _id. Use when user asks about a specific listing. You MUST pass the exact 24-character hex _id from a search_listings or get_listing_count result (e.g. "507f1f77bcf86cd799439011"). Never pass placeholder text like "provided listingId" or "the listing id". If the user said "more details about it" after you showed search results, use the _id from that result.',
      parameters: {
        type: 'object',
        properties: {
          listingId: { type: 'string', description: 'The exact 24-character hex MongoDB _id of the listing (from search_listings or similar)' },
        },
        required: ['listingId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_price_stats',
      description: 'Get min, max, and average price across listings. Optionally filter by category or location.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Filter by category' },
          location: { type: 'string', description: 'Filter by location (city/area)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_available_locations',
      description: 'List distinct locations or countries where we have listings. Use for "where do you have listings?" or "which countries?".',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['location', 'country'], description: 'Return cities (location) or countries (country)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_top_rated',
      description: 'Get top-rated listings by average review rating. Use for "top 5 highest rated" or "best reviewed".',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of listings to return, use 5 if not specified' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_listing_count',
      description: 'Count total listings, optionally filtered by category, location, or price range.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Filter by category' },
          location: { type: 'string', description: 'Filter by location' },
          maxPrice: { type: 'number', description: 'Max price' },
        },
      },
    },
  },
];

/** Check if a string is a valid MongoDB ObjectId (24 hex chars). */
function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id.trim());
}

async function executeTool(name, args) {
  const a = args || {};
  switch (name) {
    case 'get_listing_details': {
      const id = a.listingId != null ? String(a.listingId).trim() : '';
      if (!id || !isValidObjectId(id)) {
        return {
          error: 'Invalid or missing listing ID. Use the exact _id from a search_listings result (24-character hex). When the user asks "more details about it" after search results, use the _id of that listing.',
        };
      }
      const doc = await listing.findById(id).populate('reviews').populate('owner', 'username').lean();
      if (!doc) return { error: 'Listing not found' };
      return { listing: doc };
    }
    case 'search_listings': {
      const filter = {};
      if (a.query) {
        const q = String(a.query).trim();
        filter.$or = [
          { title: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          { country: { $regex: q, $options: 'i' } },
        ];
      }
      if (a.minPrice != null) filter.price = { ...(filter.price || {}), $gte: Number(a.minPrice) };
      if (a.maxPrice != null) filter.price = { ...(filter.price || {}), $lte: Number(a.maxPrice) };
      if (a.category) filter.category = a.category;
      const limit = Math.min(Number(a.limit) || 10, 20);
      const docs = await listing.find(filter).limit(limit).lean().select('_id title location country price category rating');
      return { listings: docs, count: docs.length };
    }
    case 'get_price_stats': {
      const match = {};
      if (a.category) match.category = a.category;
      if (a.location) match.location = { $regex: a.location, $options: 'i' };
      const [stats] = await listing.aggregate([
        ...(Object.keys(match).length ? [{ $match: match }] : []),
        { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' }, avgPrice: { $avg: '$price' }, count: { $sum: 1 } } },
      ]);
      return stats || { minPrice: null, maxPrice: null, avgPrice: null, count: 0 };
    }
    case 'get_available_locations': {
      const field = a.type === 'country' ? 'country' : 'location';
      const values = await listing.distinct(field);
      return { [field]: values.filter(Boolean).sort() };
    }
    case 'get_top_rated': {
      const limit = Math.min(Number(a.limit) || 5, 10);
      const docs = await listing.aggregate([
        { $lookup: { from: 'reviews', localField: 'reviews', foreignField: '_id', as: 'reviewsData' } },
        { $addFields: { avgRating: { $avg: '$reviewsData.rating' } } },
        { $match: { avgRating: { $ne: null } } },
        { $sort: { avgRating: -1 } },
        { $limit: limit },
        { $project: { title: 1, location: 1, country: 1, price: 1, avgRating: 1 } },
      ]);
      return { listings: docs };
    }
    case 'get_listing_count': {
      const filter = {};
      if (a.category) filter.category = a.category;
      if (a.location) filter.location = { $regex: a.location, $options: 'i' };
      if (a.maxPrice != null) filter.price = { $lte: Number(a.maxPrice) };
      const count = await listing.countDocuments(filter);
      return { count };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

const SYSTEM_PROMPT = `You are a helpful assistant for StayNJoy, a vacation rental site. You answer ONLY using data from the database. Use the tools to look up listings, prices, locations, and reviews. Never make up prices or listing names. If you don't have data, say so. Keep answers concise and friendly.
When the user asks for "more details", "tell me more about it", "more info about the first one", "details about the second", or similar, call get_listing_details with the exact _id of that listing. Use the listing _ids from the context below or from your last tool result.
When the user is viewing a specific listing (listingId provided in context), use get_listing_details with that id for "this listing" questions.`;

const MAX_TURNS = 5;

/** Build system-prompt snippet for "last shown listings" so the model can resolve "first one", "the Portland one", etc. */
function buildLastListingsContext(lastListings) {
  if (!Array.isArray(lastListings) || lastListings.length === 0) return '';
  const list = lastListings
    .filter((l) => l && (l._id || l.id))
    .slice(0, 20)
    .map((l, i) => {
      const id = l._id || l.id;
      const title = l.title || 'Listing';
      const loc = l.location || l.country || '';
      return `${i + 1}. "${title}"${loc ? ` (${loc})` : ''} — _id: ${id}`;
    })
    .join('\n');
  return `\n\nThe user was recently shown these listings. When they ask for "more info about the first one", "details about the second", "tell me about the Portland one", etc., call get_listing_details with the corresponding _id:\n${list}`;
}

/** Parse Groq failed_generation e.g. <function=search_listings {"query": "beach", "limit": 10}</function> */
function parseFailedToolCall(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.match(/<function\s*=\s*(\w+)\s*(\{.*\})?\s*<\/function>/is) || str.match(/<function\s*=\s*(\w+)\s*(\{.*\})?\s*\/?>/is);
  if (!m) return null;
  let args = {};
  if (m[2]) {
    try {
      args = JSON.parse(m[2].trim());
    } catch (_) {}
  }
  return { name: m[1], args };
}

/** Extract failed_generation from Groq error (tool_use_failed / invalid_request_error). */
function getFailedGeneration(err) {
  const s =
    err?.error?.failed_generation ??
    err?.failed_generation ??
    err?.body?.error?.failed_generation ??
    err?.response?.data?.error?.failed_generation ??
    null;
  if (s && typeof s === 'string') return s;
  const msg = err?.error?.message ?? err?.message ?? '';
  if (typeof msg === 'string' && /<function\s*=/.test(msg)) {
    const tag = msg.match(/<function\s*=[^>]+>\s*<\/function>/i)?.[0] ?? msg.match(/<function\s*=[^>]+\/?>/i)?.[0];
    if (tag) return tag;
  }
  return null;
}

async function runAgent(userMessage, context = {}, conversationHistory = []) {
  const { listingId, lastListings: contextLastListings } = context;
  const historyMessages = conversationHistory
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map((m) => ({ role: m.role, content: typeof m.content === 'string' ? m.content : String(m.content) }));
  let systemExtra = listingId ? ` The user may be viewing listing ID: ${listingId}. Use get_listing_details with this id when they ask about "this listing" or the current listing.` : '';
  systemExtra += buildLastListingsContext(contextLastListings || []);
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + systemExtra },
    ...historyMessages,
    { role: 'user', content: userMessage },
  ];

  let lastListingsFromTurn = [];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    let response;
    try {
      response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
        max_tokens: 1024,
      });
    } catch (err) {
      const failedGen = getFailedGeneration(err);
      const parsed = parseFailedToolCall(failedGen);
      if (parsed && ['search_listings', 'get_listing_details', 'get_price_stats', 'get_available_locations', 'get_top_rated', 'get_listing_count'].includes(parsed.name)) {
        const args = parsed.args || {};
        if (parsed.name === 'get_listing_details' && listingId && !args.listingId) args.listingId = listingId;
        const result = await executeTool(parsed.name, args);
        if (result && Array.isArray(result.listings)) lastListingsFromTurn = result.listings;
        messages.push({
          role: 'user',
          content: `[Tool ${parsed.name} result]: ${JSON.stringify(result)}. Summarize this for the user in a short, friendly reply.`,
        });
        const fallbackRes = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages,
          max_tokens: 512,
        });
        const reply = fallbackRes.choices?.[0]?.message?.content?.trim();
        if (reply) return { reply, lastListings: lastListingsFromTurn };
      }
      throw err;
    }

    const choice = response.choices?.[0];
    if (!choice) return { reply: 'Sorry, I could not get a response.', lastListings: lastListingsFromTurn };

    const msg = choice.message;
    if (msg.content && !msg.tool_calls?.length) {
      return { reply: msg.content.trim(), lastListings: lastListingsFromTurn };
    }

    messages.push({
      role: 'assistant',
      content: msg.content || null,
      tool_calls: msg.tool_calls,
    });

    for (const tc of msg.tool_calls || []) {
      const name = tc.function?.name;
      let args = {};
      try {
        if (tc.function?.arguments) args = JSON.parse(tc.function.arguments);
      } catch (_) {}
      if (name === 'get_listing_details' && listingId && !args.listingId) args.listingId = listingId;
      const result = await executeTool(name, args);
      if (result && Array.isArray(result.listings)) lastListingsFromTurn = result.listings;
      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        name: name,
        content: JSON.stringify(result),
      });
    }
  }

  return { reply: 'I hit my step limit. Try a simpler question.', lastListings: lastListingsFromTurn };
}

module.exports = { runAgent, executeTool, TOOLS };
