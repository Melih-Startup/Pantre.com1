/* Pantry Pal — core: design tokens, persistence, secure on-device auth,
   AI vision + recipe generation, and shared UI atoms. Exports to window. */

const { useState, useEffect, useRef, useCallback } = React;

const PP = {
  gold: '#c9a96e', goldLight: '#e8d5a8', charcoal: '#161616',
  surface: '#1f1e1d', surface2: '#262422', offWhite: '#faf8f5', warm: '#8a8275',
  line: 'rgba(255,255,255,0.07)',
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Inter', -apple-system, system-ui, sans-serif",
};

/* ── persistence ── */
const store = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

/* ── secure on-device auth (PBKDF2 / Web Crypto) ─────────────────────────
   Passwords are NEVER stored. We store a random per-user salt + a PBKDF2-
   SHA-256 derived hash (100k iterations). Verification re-derives and
   compares. Accounts live in localStorage under 'pp_users'. A lightweight
   fallback hash is used only if Web Crypto is unavailable (e.g. insecure
   context) so the demo still works. */
const _enc = new TextEncoder();
function _hex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''); }
function _hexToBuf(h) { const a = new Uint8Array(h.length / 2); for (let i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; }
function _randSaltHex() {
  if (window.crypto && crypto.getRandomValues) { const a = new Uint8Array(16); crypto.getRandomValues(a); return _hex(a.buffer); }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}
async function _derive(password, saltHex) {
  if (window.crypto && crypto.subtle && crypto.subtle.importKey) {
    try {
      const km = await crypto.subtle.importKey('raw', _enc.encode(password), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: _hexToBuf(saltHex), iterations: 100000, hash: 'SHA-256' }, km, 256);
      return _hex(bits);
    } catch (e) { /* fall through */ }
  }
  // fallback: SHA-256 of salt:password (single round) — still no plaintext
  if (window.crypto && crypto.subtle && crypto.subtle.digest) {
    const d = await crypto.subtle.digest('SHA-256', _enc.encode(saltHex + ':' + password));
    return _hex(d);
  }
  // last-resort non-crypto fallback
  let h = 2166136261; const s = saltHex + ':' + password;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16);
}
const auth = {
  users() { return store.get('pp_users', {}); },
  current() { const e = store.get('pp_session', null); return e ? (this.users()[e] ? { email: e, name: this.users()[e].name } : null) : null; },
  async register(name, email, password) {
    name = (name || '').trim(); email = (email || '').trim().toLowerCase();
    if (!name) throw new Error('Please enter your name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Enter a valid email address.');
    if ((password || '').length < 6) throw new Error('Password must be at least 6 characters.');
    const users = this.users();
    if (users[email]) throw new Error('An account with this email already exists.');
    const salt = _randSaltHex();
    const hash = await _derive(password, salt);
    users[email] = { name, salt, hash, created: Date.now() };
    store.set('pp_users', users); store.set('pp_session', email);
    return { email, name };
  },
  async login(email, password) {
    email = (email || '').trim().toLowerCase();
    const users = this.users(); const u = users[email];
    if (!u) throw new Error('No account found for that email.');
    const hash = await _derive(password, u.salt);
    if (hash !== u.hash) throw new Error('Incorrect password.');
    store.set('pp_session', email);
    return { email, name: u.name };
  },
  logout() { store.del('pp_session'); },
};

/* ── AI bridge ───────────────────────────────────────────────────────────
   Uses the built-in window.claude.complete when available (Claude preview).
   Otherwise POSTs to a /api/claude serverless function (the Vercel build).
   Accepts a string prompt or { messages }. Throws if neither is available
   so callers can fall back to manual entry. */
window.ppComplete = async function (arg) {
  if (window.claude && typeof window.claude.complete === 'function') {
    return await window.claude.complete(arg);
  }
  const body = typeof arg === 'string' ? { prompt: arg } : { messages: arg.messages };
  const r = await fetch('/api/claude', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { let e = {}; try { e = await r.json(); } catch (_) {} throw new Error(e.error || ('AI request failed (' + r.status + ')')); }
  const data = await r.json();
  return data.text || '';
};

/* ── AI: detect ingredients from a photo ── */
window.ppDetectIngredients = async function (dataUrl) {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/.exec(dataUrl || '');
  if (!m) throw new Error('no-image');
  const media_type = m[1], data = m[2];
  const text = 'Identify the edible food ingredients visible in this photo of a fridge, pantry, or groceries. Respond with ONLY a JSON array of short ingredient names as strings, Title Case, no quantities, no duplicates, maximum 12 items. If you cannot see any food, respond with []. Example: ["Eggs","Tomatoes","Cheddar Cheese"]';
  const res = await window.ppComplete({
    messages: [{ role: 'user', content: [
      { type: 'image', source: { type: 'base64', media_type, data } },
      { type: 'text', text },
    ] }],
  });
  const match = String(res).match(/\[[\s\S]*\]/);
  if (!match) return [];
  let arr = JSON.parse(match[0]);
  arr = (Array.isArray(arr) ? arr : []).filter(x => typeof x === 'string').map(s => s.trim()).filter(Boolean);
  const seen = new Set(); const out = [];
  for (const a of arr) { const k = a.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(a); } }
  return out.slice(0, 12);
};

/* ── AI: generate an original recipe from a pantry ── */
window.ppGenerateRecipe = async function (pantry) {
  const list = (pantry || []).filter(Boolean).join(', ') || 'common pantry staples';
  const text = `You are a creative, practical chef. Invent ONE appealing recipe that primarily uses these ingredients the user already has: ${list}. Assume salt, pepper, cooking oil and water are available. Respond with ONLY minified JSON (no markdown, no prose) of exactly this shape: {"name":string,"cuisine":string,"time":string,"cal":number,"protein":string,"servings":number,"difficulty":string,"ingredients":[string],"steps":[string]}. "time" like "30 min". "protein" like "28g". Provide 6 to 11 ingredient strings WITH quantities, and 4 to 7 clear step strings.`;
  const res = await window.ppComplete(text);
  const match = String(res).match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse recipe.');
  const obj = JSON.parse(match[0]);
  obj.id = 'ai_' + Date.now();
  obj.aiGenerated = true;
  obj.img = null;
  obj.cuisine = obj.cuisine || 'AI Original';
  obj.difficulty = obj.difficulty || 'Easy';
  obj.ingredients = Array.isArray(obj.ingredients) ? obj.ingredients : [];
  obj.steps = Array.isArray(obj.steps) ? obj.steps : [];
  return obj;
};

/* ── shared UI atoms ── */
function Label({ children, style }) {
  return <div style={{ fontFamily: PP.sans, fontSize: 10.5, letterSpacing: 3, textTransform: 'uppercase', color: PP.gold, fontWeight: 500, ...style }}>{children}</div>;
}
function Wordmark() {
  return <div style={{ fontFamily: PP.serif, fontSize: 19, fontWeight: 700, color: PP.gold, whiteSpace: 'nowrap', flexShrink: 0 }}>Pantry Pal</div>;
}
function initialsOf(name) {
  const p = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '·';
  return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
}
function InitialsAvatar({ name, size = 38 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, rgba(201,169,110,0.9), rgba(232,213,168,0.75))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PP.charcoal, fontFamily: PP.serif, fontWeight: 700, fontSize: size * 0.4 }}>
      {initialsOf(name)}
    </div>
  );
}
function GuestAvatar({ size = 38 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, border: `1px solid ${PP.line}`, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke={PP.warm} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    </div>
  );
}
function GoldButton({ children, onClick, style, disabled }) {
  return (
    <button className="pp-tap" onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '15px', background: `linear-gradient(135deg, ${PP.gold}, ${PP.goldLight})`,
      border: 'none', borderRadius: 12, cursor: disabled ? 'default' : 'pointer', fontFamily: PP.sans, fontSize: 13, fontWeight: 700,
      letterSpacing: 1.5, textTransform: 'uppercase', color: PP.charcoal, opacity: disabled ? 0.5 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, ...style,
    }}>{children}</button>
  );
}
function Field({ label, type = 'text', value, onChange, placeholder, autoFocus }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{ fontFamily: PP.sans, fontSize: 11, color: PP.warm, display: 'block', marginBottom: 6, letterSpacing: 0.3 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
        autoComplete={type === 'password' ? 'current-password' : 'off'} autoCapitalize="off" spellCheck="false"
        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: `1px solid ${PP.line}`, borderRadius: 11, padding: '13px 14px', fontFamily: PP.sans, fontSize: 15, color: PP.offWhite, outline: 'none' }} />
    </div>
  );
}
const SparkleIcon = ({ s = 16, c = PP.charcoal }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.8 4.8L18.6 9.6 13.8 11.4 12 16.2 10.2 11.4 5.4 9.6 10.2 7.8z" /><path d="M19 14l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" />
  </svg>
);
const arrowIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

Object.assign(window, {
  PP, store, auth, Label, Wordmark, initialsOf, InitialsAvatar, GuestAvatar,
  GoldButton, Field, SparkleIcon, arrowIcon,
});
