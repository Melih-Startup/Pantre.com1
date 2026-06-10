/* Pantry Pal — app shell + responsive frame (fullscreen on mobile, device bezel on desktop). */
const { PP: PPa, store: storeA, auth: authA, SparkleIcon: SparkleIconA } = window;
const { useState: useStateA, useEffect: useEffectA } = React;

function GeneratingOverlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(15,14,13,0.78)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <span className="pp-spin" style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid rgba(201,169,110,0.25)', borderTopColor: PPa.gold, display: 'inline-block' }} />
      <div style={{ fontFamily: PPa.sans, fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><SparkleIconA s={16} c={PPa.goldLight} /> Creating your recipe…</div>
      <div style={{ fontFamily: PPa.sans, fontSize: 12, color: PPa.warm }}>Building something from your pantry</div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'absolute', left: 22, right: 22, bottom: 'calc(90px + env(safe-area-inset-bottom))', zIndex: 70, background: '#2a2724', border: `1px solid ${PPa.line}`, borderRadius: 12, padding: '13px 16px', fontFamily: PPa.sans, fontSize: 13, color: PPa.offWhite, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>{msg}</div>
  );
}

function PantryHome() {
  const [tab, setTab] = useStateA('home');
  const [pantry, setPantry] = useStateA(() => storeA.get('pp_pantry', []));
  const [savedIds, setSavedIds] = useStateA(() => storeA.get('pp_saved', []));
  const [cookedIds, setCookedIds] = useStateA(() => storeA.get('pp_cooked', []));
  const [aiRecipes, setAiRecipes] = useStateA(() => storeA.get('pp_ai_recipes', []));
  const [user, setUser] = useStateA(() => authA.current());
  const [draft, setDraft] = useStateA('');
  const [openId, setOpenId] = useStateA(null);
  const [showAuth, setShowAuth] = useStateA(false);
  const [generating, setGenerating] = useStateA(false);
  const [toast, setToast] = useStateA(null);

  useEffectA(() => storeA.set('pp_pantry', pantry), [pantry]);
  useEffectA(() => storeA.set('pp_saved', savedIds), [savedIds]);
  useEffectA(() => storeA.set('pp_cooked', cookedIds), [cookedIds]);
  useEffectA(() => storeA.set('pp_ai_recipes', aiRecipes), [aiRecipes]);

  const flashToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const addItem = () => { const v = draft.trim(); if (v && !pantry.some(p => p.toLowerCase() === v.toLowerCase())) setPantry([...pantry, v]); setDraft(''); };
  const removeItem = (c) => setPantry(pantry.filter(x => x !== c));
  const addMany = (arr) => { const lower = pantry.map(p => p.toLowerCase()); const add = (arr || []).filter(a => !lower.includes(a.toLowerCase())); setPantry([...pantry, ...add]); setTab('home'); if (add.length) flashToast(`Added ${add.length} ingredient${add.length > 1 ? 's' : ''} to your pantry`); };
  const toggleSave = (id) => setSavedIds(savedIds.includes(id) ? savedIds.filter(x => x !== id) : [...savedIds, id]);
  const toggleCook = (id) => setCookedIds(cookedIds.includes(id) ? cookedIds.filter(x => x !== id) : [...cookedIds, id]);

  const allRecipes = [...aiRecipes, ...window.RECIPES];
  const findRecipe = (id) => allRecipes.find(r => r.id === id) || null;
  const ranked = window.recommend(pantry);
  const savedRecipes = savedIds.map(findRecipe).filter(Boolean);
  const openRecipe = openId ? findRecipe(openId) : null;

  const onGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const recipe = await window.ppGenerateRecipe(pantry);
      setAiRecipes(prev => [recipe, ...prev].slice(0, 30));
      setGenerating(false);
      setOpenId(recipe.id);
    } catch (e) {
      setGenerating(false);
      flashToast('Could not create a recipe right now — please try again.');
    }
  };

  const onAvatar = () => setTab('profile');
  const onAuthed = (u) => { setUser(u); setShowAuth(false); flashToast(`Welcome, ${u.name.split(' ')[0]}!`); };
  const onLogout = () => { authA.logout(); setUser(null); flashToast('Signed out'); };

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', background: PPa.charcoal, fontFamily: PPa.sans, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tab === 'home' && <window.HomeScreen user={user} pantry={pantry} draft={draft} setDraft={setDraft} addItem={addItem} removeItem={removeItem} ranked={ranked} creations={aiRecipes} onOpen={setOpenId} goScan={() => setTab('scan')} onGenerate={onGenerate} generating={generating} onAvatar={onAvatar} />}
        {tab === 'saved' && <window.SavedScreen savedRecipes={savedRecipes} onOpen={setOpenId} goHome={() => setTab('home')} />}
        {tab === 'scan' && <window.ScanScreen onAdd={addMany} />}
        {tab === 'profile' && <window.ProfileScreen user={user} savedCount={savedIds.length} cookedCount={cookedIds.length} pantryCount={pantry.length} creationsCount={aiRecipes.length} onAuth={() => setShowAuth(true)} onLogout={onLogout} />}
      </div>
      <window.TabBar active={tab} onSelect={setTab} />

      {openRecipe && <window.RecipeDetail r={openRecipe} pantry={pantry} isSaved={savedIds.includes(openRecipe.id)} isCooked={cookedIds.includes(openRecipe.id)} onSave={toggleSave} onCook={toggleCook} onClose={() => setOpenId(null)} />}
      {showAuth && <window.AuthSheet onClose={() => setShowAuth(false)} onAuthed={onAuthed} />}
      {generating && <GeneratingOverlay />}
      <Toast msg={toast} />
    </div>
  );
}

/* responsive frame: phone bezel on desktop, true fullscreen on mobile */
function ResponsiveFrame({ children }) {
  const mq = () => window.matchMedia('(max-width: 640px)').matches;
  const [mobile, setMobile] = useStateA(mq);
  const [scale, setScale] = useStateA(1);

  useEffectA(() => {
    const m = window.matchMedia('(max-width: 640px)');
    const onMq = () => setMobile(m.matches);
    const onResize = () => {
      const s = Math.min(1, (window.innerHeight - 24) / 874, (window.innerWidth - 24) / 402);
      setScale(s > 0 ? s : 1);
    };
    onResize();
    m.addEventListener('change', onMq);
    window.addEventListener('resize', onResize);
    return () => { m.removeEventListener('change', onMq); window.removeEventListener('resize', onResize); };
  }, []);

  if (mobile) {
    return <div style={{ position: 'fixed', inset: 0, background: PPa.charcoal }}>{children}</div>;
  }
  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
      <window.IOSDevice dark>{children}</window.IOSDevice>
    </div>
  );
}

function PantryApp() {
  return <ResponsiveFrame><PantryHome /></ResponsiveFrame>;
}

window.PantryApp = PantryApp;
window.PantryHome = PantryHome;
