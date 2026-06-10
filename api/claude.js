// Vercel Serverless Function — proxies the app's AI calls to Anthropic.
// Path: /api/claude  (POST)
// Body: { prompt: string }  OR  { messages: [...Anthropic content blocks...] }
// Returns: { text: string }
//
// SECURITY:
//  - Requires env var ANTHROPIC_API_KEY (set in Vercel → Settings → Environment Variables).
//    The key lives ONLY here, server-side. It is never sent to the browser.
//  - Built-in abuse guards below cap usage so a public URL can't run up your bill:
//      * short-window rate limit per visitor IP
//      * per-IP daily cap
//      * global daily cap (hard ceiling across all visitors)
//
//  NOTE: these counters live in function memory, which resets on cold starts and
//  isn't shared across regions — so treat them as a reasonable guard, NOT a hard
//  guarantee. Your real safety net is a SPENDING LIMIT set in the Anthropic Console
//  (console.anthropic.com → Settings → Billing). Set one. For strict limits, wire
//  these counters to Vercel KV / Upstash Redis later.

// ── tunable limits ───────────────────────────────────────────────
const RATE_WINDOW_MS = 60 * 1000; // short-window
const RATE_MAX = 10;              // max requests per IP per window
const PER_IP_DAILY = 40;          // max AI calls per visitor per day
const GLOBAL_DAILY = 500;         // hard ceiling across everyone per day
// ─────────────────────────────────────────────────────────────────

const ipWindows = new Map(); // ip -> [timestamps] (short window)
const ipDaily = new Map();   // ip -> { day, count }
let globalDaily = { day: '', count: 0 };

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}
function getIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return req.socket && req.socket.remoteAddress || 'unknown';
}
function rateLimited(ip) {
  const now = Date.now();
  const day = today();

  // global daily ceiling
  if (globalDaily.day !== day) globalDaily = { day, count: 0 };
  if (globalDaily.count >= GLOBAL_DAILY) return 'The app has reached its daily AI limit. Please try again tomorrow.';

  // per-IP daily cap
  let d = ipDaily.get(ip);
  if (!d || d.day !== day) { d = { day, count: 0 }; ipDaily.set(ip, d); }
  if (d.count >= PER_IP_DAILY) return "You've reached today's AI limit. Please try again tomorrow.";

  // short-window rate limit
  const arr = (ipWindows.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) return 'Too many requests — please wait a moment and try again.';

  // record usage
  arr.push(now); ipWindows.set(ip, arr);
  d.count += 1; globalDaily.count += 1;
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY.' });
    return;
  }

  // abuse guards
  const ip = getIp(req);
  const limitMsg = rateLimited(ip);
  if (limitMsg) {
    res.status(429).json({ error: limitMsg });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let messages;
    if (Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (typeof body.prompt === 'string') {
      messages = [{ role: 'user', content: body.prompt }];
    } else {
      res.status(400).json({ error: 'Provide { prompt } or { messages }.' });
      return;
    }

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1024,
        messages,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      res.status(r.status).json({ error: 'Anthropic API error', detail: errText.slice(0, 500) });
      return;
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: 'Request failed', detail: String(e && e.message || e) });
  }
}
