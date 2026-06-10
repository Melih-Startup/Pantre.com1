/* Pantry Pal — Scan: camera/upload → AI ingredient detection → review & add missed → Find Recipes. */
const { PP: PPx, Label: LabelX, GoldButton: GoldButtonX, SparkleIcon: SparkleIconX } = window;
const { useState: useStateScan, useEffect: useEffectScan, useRef: useRefScan } = React;

function ScanScreen({ onAdd }) {
  const videoRef = useRefScan(null);
  const streamRef = useRefScan(null);
  const fileRef = useRefScan(null);
  const [mode, setMode] = useStateScan('idle'); // idle | live | analyzing | review
  const [shot, setShot] = useStateScan(null);
  const [detected, setDetected] = useStateScan([]);
  const [extra, setExtra] = useStateScan('');
  const [note, setNote] = useStateScan(null);
  const [err, setErr] = useStateScan(null);

  const stop = () => { if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; } };
  useEffectScan(() => stop, []);

  const reset = () => { stop(); setMode('idle'); setShot(null); setDetected([]); setExtra(''); setNote(null); };

  const openCamera = async () => {
    setErr(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = s; setMode('live');
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); } }, 50);
    } catch (e) { setErr('Camera unavailable here — upload a photo instead.'); }
  };

  const analyze = async (dataUrl) => {
    setShot(dataUrl); setMode('analyzing'); setNote(null);
    try {
      const found = await window.ppDetectIngredients(dataUrl);
      setDetected(found);
      setNote(found.length ? null : "AI couldn't spot clear ingredients — add them below.");
    } catch (e) {
      setDetected([]);
      setNote('AI detection is unavailable right now — type your ingredients below.');
    }
    setMode('review');
  };

  const capture = () => {
    const v = videoRef.current; if (!v) return;
    const c = document.createElement('canvas'); c.width = v.videoWidth || 720; c.height = v.videoHeight || 960;
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.82);
    stop(); analyze(dataUrl);
  };

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => analyze(reader.result);
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const removeChip = (d) => setDetected(detected.filter(x => x !== d));
  const addExtra = () => {
    const v = extra.trim();
    if (v && !detected.some(d => d.toLowerCase() === v.toLowerCase())) setDetected([...detected, v]);
    setExtra('');
  };
  const findRecipes = () => { onAdd(detected); reset(); };

  return (
    <div style={{ padding: 'calc(46px + env(safe-area-inset-top)) 22px 28px' }}>
      <LabelX>AI Camera</LabelX>
      <h1 style={{ fontFamily: PPx.serif, fontSize: 28, fontWeight: 700, color: PPx.offWhite, margin: '8px 0 0', letterSpacing: -0.4 }}>Scan your pantry</h1>
      <p style={{ fontFamily: PPx.sans, fontSize: 13.5, color: PPx.warm, lineHeight: 1.6, margin: '10px 0 0' }}>Snap your fridge or shelf and AI will read the ingredients — then you confirm anything it missed.</p>

      {mode === 'idle' && (
        <React.Fragment>
          <div className="pp-tap" onClick={openCamera} style={{ marginTop: 22, border: `2px dashed rgba(201,169,110,0.32)`, borderRadius: 18, background: 'rgba(201,169,110,0.05)', padding: '46px 24px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
            <div style={{ width: 58, height: 58, margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(201,169,110,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={PPx.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </div>
            <div style={{ fontFamily: PPx.serif, fontSize: 17, fontWeight: 600, color: PPx.offWhite, marginBottom: 6 }}>Open Camera</div>
            <div style={{ fontFamily: PPx.sans, fontSize: 12.5, color: PPx.warm }}>or tap below to upload a photo</div>
          </div>
          {err && <div style={{ fontFamily: PPx.sans, fontSize: 12, color: '#e0a17a', marginTop: 12, textAlign: 'center' }}>{err}</div>}
          <button className="pp-tap" onClick={() => fileRef.current && fileRef.current.click()} style={{ width: '100%', marginTop: 14, padding: '13px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${PPx.line}`, borderRadius: 12, cursor: 'pointer', fontFamily: PPx.sans, fontSize: 12.5, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: PPx.offWhite }}>Upload a Photo</button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: 'none' }} />
        </React.Fragment>
      )}

      {mode === 'live' && (
        <React.Fragment>
          <div style={{ marginTop: 22, borderRadius: 18, overflow: 'hidden', border: `1px solid ${PPx.line}`, background: '#000', aspectRatio: '3/4', position: 'relative' }}>
            <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 14, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 12, pointerEvents: 'none' }} />
          </div>
          <GoldButtonX onClick={capture} style={{ marginTop: 16 }}>Capture</GoldButtonX>
          <button className="pp-tap" onClick={reset} style={{ width: '100%', marginTop: 10, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: PPx.sans, fontSize: 12, color: PPx.warm, letterSpacing: 1 }}>Cancel</button>
        </React.Fragment>
      )}

      {mode === 'analyzing' && (
        <div style={{ marginTop: 22 }}>
          <div style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${PPx.line}`, position: 'relative' }}>
            <img src={shot} alt="Captured" style={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'cover', filter: 'brightness(0.55)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <span className="pp-spin" style={{ width: 30, height: 30, borderRadius: '50%', border: '3px solid rgba(201,169,110,0.25)', borderTopColor: PPx.gold, display: 'inline-block' }} />
              <div style={{ fontFamily: PPx.sans, fontSize: 13, color: '#fff', display: 'flex', alignItems: 'center', gap: 7 }}><SparkleIconX s={15} c={PPx.goldLight} /> AI is reading your photo…</div>
            </div>
          </div>
        </div>
      )}

      {mode === 'review' && (
        <React.Fragment>
          <div style={{ marginTop: 22, borderRadius: 18, overflow: 'hidden', border: `1px solid ${PPx.line}` }}>
            <img src={shot} alt="Captured" style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'cover' }} />
          </div>

          <div style={{ marginTop: 18, padding: 16, background: PPx.surface, border: `1px solid ${PPx.line}`, borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><SparkleIconX s={14} c={PPx.gold} /><LabelX>Detected by AI</LabelX></div>
              <span style={{ fontFamily: PPx.sans, fontSize: 10, color: PPx.warm, fontStyle: 'italic' }}>tap × to remove</span>
            </div>
            {detected.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {detected.map(d => (
                  <button key={d} className="pp-tap" onClick={() => removeChip(d)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 100, background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.28)', fontFamily: PPx.sans, fontSize: 12.5, color: PPx.goldLight, cursor: 'pointer' }}>
                    {d}<svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke={PPx.gold} strokeWidth="1.6" strokeLinecap="round"><path d="M1 1l8 8M9 1l-8 8" /></svg>
                  </button>
                ))}
              </div>
            ) : <div style={{ fontFamily: PPx.sans, fontSize: 12.5, color: PPx.warm, lineHeight: 1.5 }}>Nothing detected yet — add your ingredients below.</div>}
            {note && <div style={{ fontFamily: PPx.sans, fontSize: 11.5, color: '#d9b48a', marginTop: 12, lineHeight: 1.5 }}>{note}</div>}
          </div>

          {/* missed anything */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: PPx.sans, fontSize: 13, color: PPx.offWhite, marginBottom: 9, fontWeight: 500 }}>Did we miss anything?</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${PPx.line}`, borderRadius: 12, padding: '11px 12px' }}>
              <input value={extra} onChange={e => setExtra(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addExtra(); }} placeholder="Type an ingredient & press +" style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontFamily: PPx.sans, fontSize: 14, color: PPx.offWhite }} />
              <button className="pp-tap" onClick={addExtra} aria-label="Add" style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, border: 'none', cursor: 'pointer', background: 'rgba(201,169,110,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PPx.gold} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>
          </div>

          <GoldButtonX onClick={findRecipes} disabled={detected.length === 0} style={{ marginTop: 18 }}>Find Recipes ({detected.length})</GoldButtonX>
          <button className="pp-tap" onClick={reset} style={{ width: '100%', marginTop: 10, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: PPx.sans, fontSize: 12, color: PPx.warm, letterSpacing: 1 }}>Retake</button>
        </React.Fragment>
      )}
    </div>
  );
}

window.ScanScreen = ScanScreen;
