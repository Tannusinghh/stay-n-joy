# StayNJoy — Project Overview & Extras

High-level overview of the stack and **all extras** added on top of the base app.

---

## Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 19, Vite 7, React Router 7, Tailwind CSS 4, shadcn/ui, TanStack Query |
| **Backend** | Node.js, Express, MongoDB (Mongoose), JWT auth |
| **AI** | Groq SDK (LLM), Mapbox Geocoding (itinerary places) |

---

## 1. UI & Design (stay-stylish–inspired)

- **Design tokens** in `client/src/index.css`: gradients (`--gradient-primary`, `--gradient-hero`), shadows (`--shadow-card`, `--shadow-elevated`), keyframes (fade-in, scale-in, slide-up), utilities (`.hover-lift`, `.font-display`).
- **Navbar** (`Navbar.jsx`): Sticky header, gradient logo pill “S” + “StayNJoy”, search bar, gradient primary buttons, dropdown with elevated shadow.
- **MobileNav** (`MobileNav.jsx`): Bottom nav on mobile (Stays, Plan trip, Account) with active state; `pb-20` on main so content isn’t hidden.
- **ListingCard** (`ListingCard.jsx`): Card with image gallery (dots if multiple images), heart icon, optional Superhost badge, title, location, rating, price; `shadow-card`, `hover-lift`, `rounded-2xl`.
- **ListingDetail** (`ListingDetail.jsx`): Image gallery + lightbox, host block with gradient avatar, “About this place” expand, amenities grid, map (ListingMap), edit/delete buttons; no listing-specific AI (removed).
- **ListingForm** (`ListingForm.jsx`): Sticky top bar, sectioned form (Basics, Location, Price, Photo, Category), category dropdown, modern “drag or click” image upload, gradient submit.
- **Layout** (`Layout.jsx`): Wraps routes; includes `MobileNav` and floating **AgentChat**; main has `pb-20 md:pb-0`.

---

## 2. Database & Listings

- **Schema** (`models/staynenjoy_schema.js`):
  - **category**: `trending | rooms | mountains | castles | pools | camping | arctic | boat`.
  - **images**: array of URLs (multi-image support).
  - **amenities**, **guests**, **bedrooms**, **bathrooms**, **superhost**, **rating**, **geometry** (GeoJSON Point).
  - **seedId**: optional, used to avoid duplicate seed entries.
- **Listings API** (`routes/api/listings.js`): `GET /api/listings` supports `category`, `q` (title search), `minPrice`, `maxPrice`, `sort` (price_asc, price_desc, newest). `parseListingBody` includes `category` on create/update.
- **Seeding** (`scripts/seedListings.js`): Sample listings with `seedId`, multiple `images`, amenities, category, etc. Skips existing by `seedId`. Can be run as `node scripts/seedListings.js` or `GET /api/seed-listings` (temp route in `app.js`).
- **Backfill** (`scripts/backfillListings.js`): Ensures `images` array, default amenities/guests/bedrooms/bathrooms/rating, infers `category` from title/description, removes duplicate listings (keeps seed version by `seedId` / title+location).

---

## 3. Search & Listings Page

- **No `?q` in URL**: Search is kept in React state (and optional `location.state` from navbar). URL is not updated on each keystroke; no full re-render from router for search.
- **Debounced search**: 350 ms after typing, `searchForFetch` updates and triggers a single request (no per-keystroke requests).
- **TanStack Query** (`@tanstack/react-query`):
  - Listings fetched with `useQuery`; key = `['listings', { category, q: searchForFetch, minPrice, maxPrice, sort }]`.
  - **placeholderData: keepPreviousData**: When filters/search change, previous results stay visible while new data loads (no full-page skeleton on every search).
  - Full-page skeleton only when `isLoading && listings.length === 0` (initial load). Small spinner next to “X results” when `isFetching`.
- **Navbar search**: Types in navbar; after debounce navigates to `/listings` with `state: { search }` (no `?q`). Listings page reads `location.state?.search` and applies it.

---

## 4. AI Trip Planner (Plan Trip)

- **Page**: `client/src/pages/PlanTrip.jsx` — destination, days, budget, interests; “Generate itinerary” calls backend.
- **Backend** (`routes/api/ai.js`): `POST /api/ai/itinerary` uses `getItineraryWithToolCalling` (Groq). Model can call **search_places_in_city** (Mapbox) then returns JSON: `summary`, `days[]` (dayNumber, title, activities with time, title, description, **location**), and optionally `locationNames[]`.
- **Geocoding** (`routes/api/ai.js`): `geocodeCity` returns center + bbox; `geocodeOnePlace` tries “PlaceName, Destination” with POI/place types and bbox so markers stay in the destination city. Every activity **location** is geocoded; results passed as `locations[]` with `name`, `lat`, `lng`, `order`, `dayNumber`.
- **Frontend**: Parses itinerary JSON; shows summary, day cards with activity **title**, **location** (full text under title with MapPin), description. **ItineraryMap** gets `locations` and draws route + markers.
- **ItineraryMap** (`client/src/components/ItineraryMap.jsx`): Mapbox map, route line, one marker per location; markers show **day** (D1, D2, …) with different **shapes** (circle, rounded square, triangle, diamond) and **colors** by day. Popup shows **place name** then “Day X · Stop Y”. **Legend** below map: “Legend: ● Day 1 ■ Day 2 …” and “Tap a marker to see place name · Stops 1 → N”. If some stops fail to geocode, a short message says “X stop(s) could not be placed on the map”.

---

## 5. AI Chat Assistant (Data-Scoped)

- **Concept**: One site-wide floating chat that answers **only from real DB data** (listings, reviews, stats). No made-up prices or listings.
- **Backend**:
  - **services/mcpAgent.js**: Defines 6 tools (search_listings, get_listing_details, get_price_stats, get_available_locations, get_top_rated, get_listing_count). `executeTool` runs the corresponding MongoDB queries. `runAgent` runs a Groq agent loop (tool_choice: auto); on **tool_use_failed** it parses `failed_generation`, runs the tool locally, then calls Groq again without tools to get a text reply.
  - **routes/api/agentChat.js**: `POST /api/agent/chat` — body: `message`, optional `conversationId`, optional `listingId`. In-memory sessions (30 min TTL); calls `runAgent(message, { listingId })`; returns `{ reply, conversationId }`.
- **Frontend** (`client/src/components/AgentChat.jsx`): Floating button (gradient primary); opens a chat panel. Sends `message`, `conversationId`, and `listingId` (from URL when on `/listings/:id`). Shows conversation history and assistant reply. Mounted in **Layout** so it’s available on all pages.
- **Auth**: `/api/agent` and `/api/ai` are behind `verifyToken` and `requireAuth` (JWT).
- **Docs**: `docs/AGENT_CHAT_IMPLEMENTATION_PLAN.md` describes architecture, tools, and extension ideas.

---

## 6. Other AI Routes (Existing)

- **POST /api/ai/itinerary** — Trip planner (see above).
- **POST /api/ai/smart-search** — Natural-language search: AI returns filters, backend runs `listing.find(filter)`. Not wired in the current React UI; backend ready for a future “AI search” input.

---

## 7. Removed (Previously Listing-Specific)

- Listing-only “Ask AI” button and **AIChatPanel** (and its component file).
- **GET /api/ai/listings/:id/review-summary** and the “AI Review Summary” block on the listing detail page.
- **POST /api/ai/chat** (old listing Q&A with `question` + `listingId`).  
All listing-related AI is now handled by the **global AgentChat** and `/api/agent/chat` with optional `listingId` in context.

---

## 8. File Summary (Extras)

| Area | Files |
|------|--------|
| **UI / client** | `index.css` (tokens, animations), `Navbar.jsx`, `MobileNav.jsx`, `ListingCard.jsx`, `Layout.jsx`, `ListingDetail.jsx`, `ListingForm.jsx`, `lib/utils.js` |
| **Listings + search** | `ListingsList.jsx` (TanStack Query, debounced search, no `?q`), `routes/api/listings.js` (filters, sort) |
| **Trip planner** | `PlanTrip.jsx`, `ItineraryMap.jsx`, `routes/api/ai.js` (itinerary + geocoding) |
| **AI agent** | `services/mcpAgent.js`, `routes/api/agentChat.js`, `client/src/components/AgentChat.jsx` |
| **Data** | `models/staynenjoy_schema.js` (new fields), `scripts/seedListings.js`, `scripts/backfillListings.js` |
| **App** | `App.jsx` (QueryClientProvider), `app.js` (seed route, agent router, CORS, JWT on `/api/ai`, `/api/agent`) |
| **Docs** | `docs/AGENT_CHAT_IMPLEMENTATION_PLAN.md`, this `docs/PROJECT_OVERVIEW_AND_EXTRAS.md` |

---

## 9. Env / Config (for extras)

- **GROQ_API_KEY** — Agent + itinerary (Groq).
- **MAP_TOKEN** or **VITE_MAP_TOKEN** — Mapbox (geocoding + ItineraryMap). Backend uses `MAP_TOKEN`, client uses `VITE_MAP_TOKEN` for the map.
- **MONGO_URL**, **FRONTEND_URL** (CORS), JWT secret for auth.

---

## 10. Quick Checklist

- [x] stay-stylish–style UI (tokens, Navbar, MobileNav, cards, detail, form)
- [x] Listings: categories, filters, sort, multi-image, amenities, superhost, rating
- [x] Seed + backfill scripts; de-duplication
- [x] Realtime search without `?q`; TanStack Query + keepPreviousData
- [x] AI trip planner with Mapbox geocoding and day-shaped markers + legend
- [x] Global AI chat assistant (mcpAgent + agentChat route + AgentChat widget)
- [x] Listing-specific AI removed; single assistant with optional `listingId` context
