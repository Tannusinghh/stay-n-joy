# StayNJoy — General Chat Assistant (Data-Scoped)  
## Implementation Plan (no code)

---

## What You're Building

A **floating AI chat widget** (e.g. on `/listings` or site-wide) that:

- Answers **only from your real data** (listings, reviews, locations, etc.).
- Lets users ask in natural language; the backend decides which DB queries to run, runs them, and uses the results to answer.
- No hallucinated prices or listings — answers are grounded in MongoDB.

Think of it as a **read-only MCP-style agent**: tools = MongoDB read operations, LLM = Groq that chooses tools and turns results into replies.

---

## Architecture (3 Layers)

```
User types question in widget
         ↓
Frontend: floating chat UI  →  POST /api/agent/chat  (message + optional context)
         ↓
Backend: Express route      →  mcpAgent / agent service (Groq + tool executor)
         ↓
Groq chooses tool(s)        →  executeTool(id, args)  →  MongoDB query
         ↓
Real data returned         →  Groq writes answer from tool results
         ↓
JSON response              →  Widget displays reply
```

- **Layer 1 — Frontend:** Floating chat component; sends user message (and optionally `listingId` or page context); displays assistant reply and optionally “thinking” or tool steps.
- **Layer 2 — API + agent:** One route (e.g. `POST /api/agent/chat`) that receives the message, keeps optional session/conversation state (e.g. in-memory with 30 min TTL), calls the agent service, returns the assistant message (and optionally tool calls for transparency).
- **Layer 3 — Agent service:** Groq (or other LLM) with a **fixed set of tools**. Each tool maps to one or more read-only MongoDB operations. The agent loop: user message → LLM decides which tool to call and with what args → run tool → pass result back to LLM → LLM produces final answer.

---

## Files to Create (3)

| File | Purpose |
|------|--------|
| **services/mcpAgent.js** (or `agentService.js`) | Tool definitions (name, description, parameters for Groq), `executeTool(toolId, args)` that runs the corresponding MongoDB queries (listings, reviews, stats, etc.), and the agentic loop: call Groq → if tool_use then execute tool → append result → call Groq again until final message. |
| **routes/api/agentChat.js** | Express router: `POST /chat` (or `/`) that reads body (e.g. `{ message, conversationId? }`), loads or creates session (in-memory map keyed by conversationId, 30 min TTL), calls the agent service with message + history, returns `{ reply }` (and optionally tool calls). No auth required for read-only chat, or optional JWT for “logged-in only”. |
| **Frontend chat widget** | Either a React component under `client/src` (e.g. `AgentChat.jsx`) used on the listings page (and optionally elsewhere), or a self-contained script in `public/scripts/agentChat.js` that injects a floating button + panel and talks to `POST /api/agent/chat`. Sends `message` and optionally `listingId` or `page` so the agent can scope answers (e.g. “this listing” vs “all listings”). |

---

## The 6 Tools (Groq Can Call These)

| Tool | MongoDB operation | Purpose |
|------|-------------------|--------|
| **search_listings** | `Listing.find()` with optional regex on title/location, price range (`$gte`/`$lte`), category | “Listings in Aspen under $200”, “beach places in Bali”. |
| **get_listing_details** | `Listing.findById(id).populate('reviews').populate('owner')` | “Tell me about this listing”, “reviews for this place”. |
| **get_price_stats** | Aggregation: `$group` to get min, max, avg price (optionally by category or location) | “What’s the average price?”, “price range for mountains”. |
| **get_available_locations** | `Listing.distinct('location')` or `distinct('country')` with optional filter | “Where do you have listings?”, “which countries?”. |
| **get_top_rated** | Aggregation: `$lookup` reviews, `$avg` rating, `$sort` by rating, limit | “Top 5 highest-rated listings”. |
| **get_listing_count** | `Listing.countDocuments(filter)` with optional category/location/price filter | “How many listings?”, “how many in mountains?”. |

All tools are **read-only**; no write/update/delete. Schema: your existing `StayNJoy` (listings) + review model.

---

## Integration Checklist (~10 min)

1. **Dependencies**  
   - `npm install groq-sdk` (or equivalent Groq client).

2. **Env**  
   - Add `GROQ_API_KEY=...` to `.env`.

3. **Drop in the 3 pieces**  
   - `services/mcpAgent.js` (tool defs + executor + Groq loop).  
   - `routes/api/agentChat.js` (Express route + session).  
   - Frontend: either React component or `public/scripts/agentChat.js`.

4. **Wire backend**  
   - In `app.js`:  
     - `const agentRouter = require('./routes/api/agentChat');`  
     - `app.use('/api/agent', agentRouter);`  
   - So that `POST /api/agent/chat` (or `/api/agent`) is the single endpoint.

5. **Wire frontend**  
   - **If React:** Render the chat widget on `/listings` (and optionally on listing detail page). Pass `listingId` when on a listing page so the agent can scope to “this listing” when relevant.  
   - **If vanilla script:** Include `<script src="/scripts/agentChat.js"></script>` before `</body>` in the HTML that serves your app (e.g. main template or index.html). Optionally set `data-listing-id="<listing._id>"` on the listing detail page so the script can send it.

6. **CORS**  
   - If the widget is on a different origin (e.g. React dev server), ensure your Express app allows that origin for `POST /api/agent/chat`.

---

## Do You Need a Vector DB?

**Not for v1.** Keyword/regex + structured filters (price, category, location) are enough for “listings in X”, “under $Y”, “top rated”, etc.

**Consider adding later when:**

- You have hundreds of listings and users ask vague things like “cozy romantic hideaway” that don’t match keywords well.
- You want semantic search (e.g. “places good for families” matching description text).
- MongoDB Atlas already supports Vector Search on the same cluster; you can add an index and a “semantic_search_listings” tool later without a new service.

---

## How to Extend Later

- **New capability:**  
  1. Add a **tool definition** (name, description, parameters) to the tools array the agent knows.  
  2. In `executeTool()`, add a **case** that runs the new MongoDB (read) query and returns a structured result.

- **Examples:**  
  - “Is this listing available on these dates?” → tool `check_availability` (read from a future bookings collection).  
  - “Similar listings” → tool `get_similar_listings` (same category/location, or vector similarity if you add it).  
  - “Who is the host?” → already covered by `get_listing_details` with `owner` populated.

---

## Summary

| Item | Detail |
|------|--------|
| **Scope** | General chat assistance **limited to your data** (listings, reviews, locations, stats). |
| **Style** | MCP-like: fixed tools = read-only MongoDB ops; Groq chooses tools and formats answers. |
| **Backend** | One route + one agent service (Groq + tool executor); optional in-memory session (30 min TTL). |
| **Frontend** | One floating chat widget (React or vanilla), calling `POST /api/agent/chat`. |
| **Safety** | No writes; tool layer only runs read queries. No PII in prompts unless you explicitly pass it. |

This plan is implementation-ready: you can create the three pieces (agent service, route, widget) and plug them in using this structure without writing code in this doc.
