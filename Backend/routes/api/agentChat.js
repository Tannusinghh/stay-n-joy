/**
 * Agent chat API: POST /chat — in-memory session (30 min TTL), calls mcpAgent.
 */

const express = require('express');
const router = express.Router();
const { runAgent } = require('../../services/mcpAgent');

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min
const sessions = new Map();

function getOrCreateSession(conversationId) {
  let s = sessions.get(conversationId);
  if (!s) {
    s = { history: [], expiresAt: Date.now() + SESSION_TTL_MS };
    sessions.set(conversationId, s);
  }
  s.expiresAt = Date.now() + SESSION_TTL_MS;
  return s;
}

function pruneSessions() {
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (s.expiresAt < now) sessions.delete(id);
  }
}
setInterval(pruneSessions, 60 * 1000);

router.post('/chat', async (req, res) => {
  try {
    const { message, conversationId, listingId } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Missing or invalid message' });
    }
    const id = conversationId || `conv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const session = getOrCreateSession(id);
    const history = Array.isArray(session.history) ? session.history : [];
    const context = {
      listingId: listingId || null,
      lastListings: Array.isArray(session.lastListings) ? session.lastListings : [],
    };
    const { reply, lastListings } = await runAgent(message.trim(), context, history);
    session.history = [
      ...history,
      { role: 'user', content: message.trim() },
      { role: 'assistant', content: reply },
    ];
    if (Array.isArray(lastListings) && lastListings.length > 0) {
      session.lastListings = lastListings;
    }
    return res.json({ success: true, reply, conversationId: id });
  } catch (err) {
    console.error('Agent chat error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Agent failed',
      reply: 'Sorry, I had a problem answering. Please try again.',
    });
  }
});

module.exports = router;
