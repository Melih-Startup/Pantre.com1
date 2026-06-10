/* Pantry Pal — screens: Home, Saved, Profile, RecipeDetail, TabBar, Auth. */
const { PP, store, auth, Label, Wordmark, InitialsAvatar, GuestAvatar, GoldButton, Field, SparkleIcon, arrowIcon, initialsOf } = window;
const { useState: useStateS, useRef: useRefS } = React;

/* gradient hero for AI-generated recipes (no photo) */
function AIHero({ name, height = 200, big }) {
  return (
    <div style={{ width: '100%', height, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #2b2622 0%, #1b1916 60%, #211d18 100%)' }}>
      <div style={{ position: 'absolute', top: -20, right: -10, opacity: 0.16 }}><SparkleIcon s={big ? 220 : 150} c={PP.gold} /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
    </div>
  );
}

/* ── recipe row ── */
function RecipeRow({ r, onOpen, isLast, saved }) {
  return (
    <div className="pp-tap" onClick={() => onOpen(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', cursor: 'pointer', borderBottom: isLast ? 'none' : `1px solid ${PP.line}` }}>
      <div style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0, overflow: 'hidden', background: '#000', position: 'relative' }}>
        {r.img ? <img src={r.img} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.92) saturate(1.05)' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#2b2622,#1b1916)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SparkleIcon s={22} c={PP.gold} /></div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: PP.sans, fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color: PP.gold, marginBottom: 4 }}>
          {r.aiGenerated ? 'AI creation' : (r.matchCount > 0 ? `Uses ${r.matchCount} of your items` : r.cuisine)}
        </div>
        <div style={{ fontFamily: PP.serif, fontSize: 16.5, fontWeight: 600, color: PP.offWhite, lineHeight: 1.2, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
        <div style={{ fontFamily: PP.sans, fontSize: 12, color: PP.warm }}>{r.time} · {r.cal} cal</div>
      </div>
      {saved
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill={PP.gold} stroke={PP.gold} strokeWidth="1.5" style={{ flexShrink: 0 }}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
        : <svg width="7" height="13" viewBox="0 0 7 13" style={{ flexShrink: 0 }}><path d="M1 1l5 5.5L1 12" stroke={PP.warm} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  );
}

/* ── tab bar ── */
function TabBar({ active, onSelect }) {
  const tabs = [
    { key: 'home', label: 'Home', d: 'M3 10.5L12 3l9 7.5M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9' },
    { key: 'saved', label: 'Saved', d: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' },
    { key: 'scan', label: 'Scan', d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' },
    { key: 'profile', label: 'Profile', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 18px', paddingBottom: 'calc(14px + env(safe-area-inset-bottom))', background: 'rgba(18,17,16,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: `1px solid ${PP.line}`, flexShrink: 0 }}>
      {tabs.map(t => {
        const on = active === t.key;
        return (
          <button key={t.key} className="pp-tap" onClick={() => onSelect(t.key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: on ? PP.gold : PP.warm, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {t.key === 'scan' && <circle cx="12" cy="13" r="3.4" />}<path d={t.d} />
            </svg>
            <span style={{ fontFamily: PP.sans, fontSize: 10, letterSpacing: 0.3, fontWeight: on ? 600 : 400 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── HOME ── */
function HomeScreen({ user, pantry, draft, setDraft, addItem, removeItem, ranked, creations, onOpen, goScan, onGenerate, generating, onAvatar }) {
  const personalized = pantry.length > 0;
  const hero = ranked[0];
  const list = ranked.slice(1, 4);
  return (
    <React.Fragment>
      <div style={{ padding: 'calc(46px + env(safe-area-inset-top)) 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Wordmark />
          <button className="pp-tap" onClick={onAvatar} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            {user ? <InitialsAvatar name={user.name} /> : <GuestAvatar />}
          </button>
        </div>
        <div style={{ marginTop: 26 }}>
          <Label>{user ? `Good evening, ${user.name.split(' ')[0]}` : 'Good evening'}</Label>
          <h1 style={{ fontFamily: PP.serif, fontSize: 30, fontWeight: 700, color: PP.offWhite, lineHeight: 1.15, margin: '8px 0 0', letterSpacing: -0.5 }}>What's in your<br />pantry tonight?</h1>
        </div>
      </div>

      {/* input + AI create card */}
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ background: PP.surface, border: `1px solid ${PP.line}`, borderRadius: 20, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${PP.line}`, borderRadius: 12, padding: '11px 12px' }}>
            <button className="pp-tap" onClick={addItem} aria-label="Add" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={PP.gold} strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addItem(); }} placeholder="Add an ingredient…" style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontFamily: PP.sans, fontSize: 14, color: PP.offWhite }} />
            <button className="pp-tap" onClick={goScan} aria-label="Scan" style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, border: 'none', cursor: 'pointer', background: 'rgba(201,169,110,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PP.gold} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="3.4" /></svg>
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {pantry.length === 0 && <div style={{ fontFamily: PP.sans, fontSize: 12.5, color: PP.warm, padding: '2px 0', lineHeight: 1.5 }}>Add a few ingredients, scan your shelf, or let AI invent something from what you have.</div>}
            {pantry.map(c => (
              <button key={c} className="pp-tap" onClick={() => removeItem(c)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 100, background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.22)', fontFamily: PP.sans, fontSize: 12.5, color: PP.goldLight, cursor: 'pointer' }}>
                {c}<svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke={PP.gold} strokeWidth="1.6" strokeLinecap="round"><path d="M1 1l8 8M9 1l-8 8" /></svg>
              </button>
            ))}
          </div>

          <GoldButton onClick={onGenerate} disabled={generating} style={{ marginTop: 16 }}>
            {generating ? <React.Fragment><span className="pp-spin" style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(22,22,22,0.35)', borderTopColor: PP.charcoal, display: 'inline-block' }} /> Inventing…</React.Fragment>
              : <React.Fragment><SparkleIcon s={16} /> Create a Recipe with AI</React.Fragment>}
          </GoldButton>
        </div>
      </div>

      {/* your AI creations */}
      {creations.length > 0 && (
        <React.Fragment>
          <div style={{ padding: '28px 22px 0', display: 'flex', alignItems: 'center', gap: 8 }}><SparkleIcon s={14} c={PP.gold} /><Label>Your creations</Label></div>
          <div style={{ padding: '4px 22px 0' }}>
            {creations.slice(0, 3).map((r, i) => <RecipeRow key={r.id} r={r} onOpen={onOpen} isLast={i === Math.min(creations.length, 3) - 1} />)}
          </div>
        </React.Fragment>
      )}

      {/* picks */}
      <div style={{ padding: '30px 22px 0' }}>
        <Label>{personalized ? 'From your pantry' : 'Popular this week'}</Label>
        <h2 style={{ fontFamily: PP.serif, fontSize: 21, fontWeight: 600, color: PP.offWhite, margin: '7px 0 4px', letterSpacing: -0.3 }}>{personalized ? "Tonight's picks" : 'Get inspired'}</h2>
      </div>

      <div style={{ padding: '14px 22px 0' }}>
        <div className="pp-tap" onClick={() => onOpen(hero.id)} style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: `1px solid ${PP.line}`, cursor: 'pointer' }}>
          <img src={hero.img} alt={hero.name} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', filter: 'brightness(0.78) saturate(1.08)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
          {personalized && hero.matchCount > 0 && (
            <div style={{ position: 'absolute', top: 14, left: 14, padding: '6px 13px', borderRadius: 100, background: PP.gold, fontFamily: PP.sans, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: PP.charcoal }}>Uses {hero.matchCount} of your items</div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18 }}>
            <div style={{ fontFamily: PP.sans, fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color: PP.goldLight, marginBottom: 6 }}>{hero.cuisine}</div>
            <div style={{ fontFamily: PP.serif, fontSize: 23, fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 8 }}>{hero.name}</div>
            <div style={{ display: 'flex', gap: 18 }}>
              {[hero.time, hero.cal + ' cal', hero.difficulty].map(v => <div key={v} style={{ fontFamily: PP.sans, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{v}</div>)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '26px 22px 0' }}><Label>More ideas</Label></div>
      <div style={{ padding: '4px 22px 28px' }}>
        {list.map((r, i) => <RecipeRow key={r.id} r={r} onOpen={onOpen} isLast={i === list.length - 1} />)}
      </div>
    </React.Fragment>
  );
}

/* ── SAVED ── */
function SavedScreen({ savedRecipes, onOpen, goHome }) {
  return (
    <div style={{ padding: 'calc(46px + env(safe-area-inset-top)) 22px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div><Label>Your collection</Label>
          <h1 style={{ fontFamily: PP.serif, fontSize: 28, fontWeight: 700, color: PP.offWhite, margin: '8px 0 0', letterSpacing: -0.4, whiteSpace: 'nowrap' }}>Saved recipes</h1>
        </div>
        <div style={{ fontFamily: PP.sans, fontSize: 12.5, color: PP.warm, paddingBottom: 4 }}>{savedRecipes.length} saved</div>
      </div>
      {savedRecipes.length === 0 ? (
        <div style={{ marginTop: 60, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 18px', borderRadius: '50%', background: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={PP.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          </div>
          <div style={{ fontFamily: PP.serif, fontSize: 18, color: PP.offWhite, marginBottom: 8 }}>Nothing saved yet</div>
          <div style={{ fontFamily: PP.sans, fontSize: 13, color: PP.warm, lineHeight: 1.6, maxWidth: 240, margin: '0 auto 22px' }}>Tap the bookmark on any recipe to keep it here for later.</div>
          <button className="pp-tap" onClick={goHome} style={{ padding: '12px 26px', background: 'rgba(201,169,110,0.14)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 100, cursor: 'pointer', fontFamily: PP.sans, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: PP.goldLight }}>Browse recipes</button>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {savedRecipes.map((r, i) => <RecipeRow key={r.id} r={r} onOpen={onOpen} saved isLast={i === savedRecipes.length - 1} />)}
        </div>
      )}
    </div>
  );
}

/* ── PROFILE ── */
function SettingRow({ icon, label, detail, isLast, onClick }) {
  return (
    <div className="pp-tap" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 0', cursor: 'pointer', borderBottom: isLast ? 'none' : `1px solid ${PP.line}` }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'rgba(201,169,110,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={PP.gold} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </div>
      <div style={{ flex: 1, fontFamily: PP.sans, fontSize: 14.5, color: PP.offWhite }}>{label}</div>
      {detail && <span style={{ fontFamily: PP.sans, fontSize: 13, color: PP.warm, marginRight: 4 }}>{detail}</span>}
      <svg width="7" height="13" viewBox="0 0 7 13"><path d="M1 1l5 5.5L1 12" stroke={PP.warm} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
}
function ProfileScreen({ user, savedCount, cookedCount, pantryCount, creationsCount, onAuth, onLogout }) {
  return (
    <div style={{ padding: 'calc(46px + env(safe-area-inset-top)) 22px 28px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {user ? <InitialsAvatar name={user.name} size={84} /> : <GuestAvatar size={84} />}
        <h1 style={{ fontFamily: PP.serif, fontSize: 24, fontWeight: 700, color: PP.offWhite, margin: '14px 0 2px', letterSpacing: -0.3 }}>{user ? user.name : 'Guest'}</h1>
        <div style={{ fontFamily: PP.sans, fontSize: 13, color: PP.warm }}>{user ? user.email : 'Sign in to save your kitchen across sessions'}</div>
      </div>

      {!user && (
        <div style={{ marginTop: 22 }}>
          <GoldButton onClick={onAuth}>Create account or sign in</GoldButton>
        </div>
      )}

      {user && (
        <div style={{ display: 'flex', marginTop: 24, background: PP.surface, border: `1px solid ${PP.line}`, borderRadius: 16, overflow: 'hidden' }}>
          {[[String(savedCount), 'Saved'], [String(cookedCount), 'Cooked'], [String(creationsCount), 'AI Made'], [String(pantryCount), 'Pantry']].map(([v, l], i, a) => (
            <div key={l} style={{ flex: 1, textAlign: 'center', padding: '16px 4px', borderRight: i < a.length - 1 ? `1px solid ${PP.line}` : 'none' }}>
              <div style={{ fontFamily: PP.serif, fontSize: 22, fontWeight: 700, color: PP.gold }}>{v}</div>
              <div style={{ fontFamily: PP.sans, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: PP.warm, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <SettingRow label="Dietary preferences" detail="None set" icon={<React.Fragment><path d="M3 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V2M5 2v20M21 15V2a5 5 0 0 0-3 5v6c0 1.1.9 2 2 2h1zm0 0v7" /></React.Fragment>} />
        <SettingRow label="Notifications" detail="On" icon={<React.Fragment><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></React.Fragment>} />
        <SettingRow label="Help & support" isLast icon={<React.Fragment><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" /></React.Fragment>} />
      </div>

      {user && (
        <button className="pp-tap" onClick={onLogout} style={{ width: '100%', marginTop: 24, padding: '14px', background: 'transparent', border: `1px solid rgba(255,255,255,0.14)`, borderRadius: 12, cursor: 'pointer', fontFamily: PP.sans, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: PP.warm }}>Sign Out</button>
      )}
    </div>
  );
}

/* ── AUTH sheet ── */
function AuthSheet({ onClose, onAuthed }) {
  const [mode, setMode] = useStateS('register'); // register | login
  const [name, setName] = useStateS('');
  const [email, setEmail] = useStateS('');
  const [pw, setPw] = useStateS('');
  const [err, setErr] = useStateS(null);
  const [busy, setBusy] = useStateS(false);

  const submit = async () => {
    setErr(null); setBusy(true);
    try {
      const u = mode === 'register' ? await auth.register(name, email, pw) : await auth.login(email, pw);
      onAuthed(u);
    } catch (e) { setErr(e.message || 'Something went wrong.'); }
    setBusy(false);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 45, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '92%', overflow: 'auto', background: '#1c1b19', borderRadius: '26px 26px 0 0', border: `1px solid ${PP.line}`, padding: '10px 22px calc(34px + env(safe-area-inset-bottom))' }}>
        <div style={{ width: 40, height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.18)', margin: '0 auto 20px' }} />
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <Label>Pantry Pal</Label>
          <h2 style={{ fontFamily: PP.serif, fontSize: 27, fontWeight: 700, color: PP.offWhite, margin: '6px 0 4px' }}>{mode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
          <div style={{ fontFamily: PP.sans, fontSize: 13, color: PP.warm }}>{mode === 'register' ? 'Save recipes & creations on this device.' : 'Sign in to your kitchen.'}</div>
        </div>

        {mode === 'register' && <Field label="Name" value={name} onChange={setName} placeholder="Alex Rivera" autoFocus />}
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus={mode === 'login'} />
        <Field label="Password" type="password" value={pw} onChange={setPw} placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'} />

        {err && <div style={{ fontFamily: PP.sans, fontSize: 12.5, color: '#e0936f', margin: '2px 0 12px', textAlign: 'center' }}>{err}</div>}

        <GoldButton onClick={submit} disabled={busy} style={{ marginTop: 6 }}>
          {busy ? 'Please wait…' : (mode === 'register' ? 'Create account' : 'Sign in')}
        </GoldButton>

        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: PP.sans, fontSize: 12.5, color: PP.warm }}>
          {mode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
          <button className="pp-tap" onClick={() => { setErr(null); setMode(mode === 'register' ? 'login' : 'register'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: PP.goldLight, fontFamily: PP.sans, fontSize: 12.5, fontWeight: 600, padding: 0 }}>
            {mode === 'register' ? 'Sign in' : 'Create one'}
          </button>
        </div>
        <div style={{ fontFamily: PP.sans, fontSize: 10.5, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>🔒 Your password is hashed (PBKDF2) and stored only on this device.</div>
      </div>
    </div>
  );
}

/* ── RECIPE DETAIL overlay ── */
function RecipeDetail({ r, pantry, isSaved, isCooked, onSave, onCook, onClose }) {
  const have = new Set(pantry.map(p => p.toLowerCase()));
  const has = (ing) => { const l = ing.toLowerCase(); return [...have].some(h => l.includes(h) || h.includes(l)); };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: PP.charcoal, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ position: 'relative' }}>
          {r.img
            ? <img src={r.img} alt={r.name} style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block', filter: 'brightness(0.82) saturate(1.08)' }} />
            : <AIHero name={r.name} height={300} big />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(22,22,22,1) 2%, rgba(22,22,22,0.2) 45%, rgba(0,0,0,0.35) 100%)' }} />
          <button className="pp-tap" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: 18, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <button className="pp-tap" onClick={() => onSave(r.id)} aria-label="Save" style={{ position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', right: 18, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={isSaved ? PP.gold : 'none'} stroke={isSaved ? PP.gold : '#fff'} strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          </button>
          <div style={{ position: 'absolute', bottom: 16, left: 22, right: 22 }}>
            <div style={{ fontFamily: PP.sans, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: PP.gold, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>{r.aiGenerated && <SparkleIcon s={13} c={PP.gold} />}{r.aiGenerated ? 'AI creation' : r.cuisine}</div>
            <div style={{ fontFamily: PP.serif, fontSize: 27, fontWeight: 700, color: '#fff', lineHeight: 1.12 }}>{r.name}</div>
          </div>
        </div>

        <div style={{ padding: '20px 22px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
            {[[String(r.time).replace(' min', 'm').replace(' hr', 'h'), 'Time'], [r.cal, 'Cal'], [r.protein, 'Protein'], [r.servings, 'Serves']].map(([v, l]) => (
              <div key={l} style={{ background: PP.surface, border: `1px solid ${PP.line}`, borderRadius: 12, padding: '13px 6px', textAlign: 'center' }}>
                <div style={{ fontFamily: PP.serif, fontSize: 16, fontWeight: 700, color: PP.gold, whiteSpace: 'nowrap' }}>{v}</div>
                <div style={{ fontFamily: PP.sans, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: PP.warm, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 26 }}>
            <div style={{ fontFamily: PP.sans, fontSize: 10.5, letterSpacing: 3, textTransform: 'uppercase', color: PP.gold, paddingBottom: 10, borderBottom: '1px solid rgba(201,169,110,0.18)' }}>Ingredients</div>
            <div style={{ marginTop: 12 }}>
              {r.ingredients.map((ing, idx) => (
                <div key={ing + idx} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 0', fontFamily: PP.sans, fontSize: 14, color: PP.offWhite }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: has(ing) ? PP.gold : 'transparent', border: has(ing) ? 'none' : `1.5px solid ${PP.warm}` }}>
                    {has(ing) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={PP.charcoal} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </span>
                  <span style={{ flex: 1 }}>{ing}</span>
                  {has(ing) && <span style={{ fontFamily: PP.sans, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: PP.gold }}>In pantry</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <div style={{ fontFamily: PP.sans, fontSize: 10.5, letterSpacing: 3, textTransform: 'uppercase', color: PP.gold, paddingBottom: 10, borderBottom: '1px solid rgba(201,169,110,0.18)' }}>Method</div>
            <div style={{ marginTop: 14 }}>
              {r.steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '0 0 18px' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${PP.gold}`, color: PP.gold, fontFamily: PP.serif, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                  <div style={{ flex: 1, fontFamily: PP.sans, fontSize: 13.5, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, paddingTop: 4 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="pp-tap" onClick={() => onSave(r.id)} style={{ flex: 1, padding: '14px', borderRadius: 12, cursor: 'pointer', border: `1px solid ${isSaved ? PP.gold : 'rgba(255,255,255,0.14)'}`, background: isSaved ? 'rgba(201,169,110,0.14)' : 'transparent', fontFamily: PP.sans, fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: isSaved ? PP.goldLight : PP.warm }}>{isSaved ? 'Saved ✓' : 'Save'}</button>
            <GoldButton onClick={() => onCook(r.id)} style={{ flex: 1 }}>{isCooked ? 'Cooked ✓' : 'I Cooked This'}</GoldButton>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RecipeRow, TabBar, HomeScreen, SavedScreen, ProfileScreen, AuthSheet, RecipeDetail, AIHero });
