# StayNJoy (Airbnb-style MERN)

This repository is organized into two top-level workspaces:

- `Backend/` - Node.js + Express + MongoDB API server, authentication, listing/review services, AI services, and data scripts.
- `Frontend/` - React + Vite client application (`Frontend/client`) with modern UI, routing, auth context, map integrations, and AI UI flows.

## Project Overview

**StayNJoy** is an Airbnb-inspired full-stack web application where users can discover places to stay, view detailed property information, leave reviews, and plan trips with AI assistance.

The project combines a modern MERN architecture with travel-focused AI features. It is designed as both:
- a practical booking/listing platform prototype, and
- a capstone-style showcase of full-stack engineering (auth, CRUD, maps, AI, and responsive UI).

## What This Project Includes

- **User accounts and authentication**
  - Signup/login, JWT-based API auth, protected routes, and authenticated actions.
- **Listing management**
  - Create, view, edit, and delete listings with ownership checks.
  - Rich listing details such as price, location, amenities, host info, and image galleries.
- **Reviews system**
  - Users can post and delete their own reviews with author-level permissions.
- **Search and discovery**
  - Category filters, price/sort controls, and natural-language smart search.
- **Maps and location features**
  - Mapbox-powered listing maps and route visualization for trip plans.
- **AI-powered travel tools**
  - AI assistant chat for listing-related questions using data-grounded responses.
  - AI trip planner with day-by-day itinerary generation and mapped stops.
- **Modern frontend experience**
  - React + Vite app with responsive layout, improved UI consistency, and reusable component-driven design.

## What Happened In This Project

This project evolved in multiple phases instead of being built in one shot:

1. **Original stack (EJS + Express + MongoDB)**  
   The app started as a server-rendered Airbnb-style project with EJS views, listing CRUD, reviews, image uploads, and MongoDB models.

2. **MERN migration**  
   The UI was ported to React + Vite (`Frontend/client`) while the backend was kept and modernized into JSON-first API routes under `Backend/routes/api`.

3. **UX/UI modernization**  
   The frontend was redesigned with Tailwind + shadcn-style components, larger layout widths, better hierarchy, responsive navigation, improved forms, and smoother interactions.

4. **AI feature rollout**  
   The project added three major AI capabilities:
   - Natural-language listing smart search
   - AI trip planner with day-wise itinerary + Mapbox route/stops
   - Data-grounded assistant chat for listing questions

5. **Reliability and correctness hardening**  
   Several production-grade fixes were applied:
   - Better agent context handling across chat turns
   - Tool-call fallback behavior for provider errors
   - Stricter geocoding/validation to reduce wrong-city map pins
   - Route protection and ownership checks on sensitive operations

6. **Security and architecture cleanup**  
   JWT-based auth was enforced for protected APIs, CORS/auth flow was aligned, ownership middleware was tightened, and secrets were moved to environment-based handling.

7. **Repository reorganization**  
   The codebase was restructured into top-level `Backend/` and `Frontend/` folders with this root architecture overview for easier onboarding and maintenance.

## Architecture Overview

### 1) High-level flow

1. User interacts with React client in `Frontend/client`.
2. Client calls backend APIs under `/api/*`.
3. Express routes in `Backend/routes/api` process requests.
4. MongoDB models in `Backend/models` provide data persistence.
5. AI routes/services in `Backend/routes/api/ai.js` and `Backend/services/*` enrich search/planning/chat features.

### 2) Backend architecture (`Backend/`)

- **Entry point:** `Backend/app.js`
  - Express bootstrap, MongoDB connection, CORS, JSON parsing.
  - Mounts auth/listings/reviews/AI/agent routes.
  - Serves SPA build (`client/dist`) when present.
- **Auth & authorization:**
  - JWT auth middleware in `Backend/middleware/apiAuth.js`.
  - Ownership checks for listing/review write operations.
- **Core API routes:**
  - `routes/api/auth.js` - register/login/me.
  - `routes/api/listings.js` - listing CRUD + filtering.
  - `routes/api/reviews.js` - nested review operations.
  - `routes/api/ai.js` - itinerary planning + smart search.
  - `routes/api/agentChat.js` - session-aware assistant chat endpoint.
- **Models:**
  - `staynenjoy_schema.js`, `reviewSchema.js`, `userSchema.js`.
- **Services:**
  - `services/aiService.js` (Groq itinerary/search logic).
  - `services/mcpAgent.js` (tool-driven data-grounded assistant).
- **Scripts:**
  - `scripts/seedListings.js`, `backfillListings.js`, `viewListings.js` for data setup and maintenance.

### 3) Frontend architecture (`Frontend/client`)

- **Entry & shell:**
  - `src/main.jsx` -> Router + auth provider.
  - `src/App.jsx` -> routes + protected routes.
  - `src/components/Layout.jsx` -> navbar/mobile nav/global chat mount.
- **Pages:**
  - Listings browse/detail/form, login/signup, trip planner.
- **State/auth:**
  - `src/context/AuthContext.jsx` stores user/token and auth lifecycle.
- **API layer:**
  - `src/api.js` wraps fetch, injects JWT Authorization headers, handles 401 logout.
- **UI system:**
  - Tailwind CSS + shadcn UI primitives + custom theme tokens.
  - Mapbox components for listing and itinerary maps.

### 4) AI capabilities currently included

- **Smart search** (`/api/ai/smart-search`): natural language query -> structured filters -> listing results.
- **Trip planner** (`/api/ai/itinerary`): tool-assisted place retrieval + validated map stops.
- **Assistant chat** (`/api/agent/chat`): data-grounded listing assistant with session memory.

### 5) Security notes

- API auth uses JWT (`Authorization: Bearer <token>`).
- AI endpoints are protected behind auth middleware.
- Keep secrets in `.env` only; never commit real API keys.

## Local Development

### Backend

```bash
cd Backend
npm install
npm run dev
```

### Frontend

```bash
cd Frontend/client
npm install
npm run dev
```

> Frontend dev server proxies `/api` to backend. Configure backend `FRONTEND_URL` and environment variables as needed.

## Repository layout

```text
AirBnb-Project/
  Backend/
  Frontend/
```
