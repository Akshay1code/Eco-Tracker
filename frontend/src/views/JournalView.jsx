import { createElement, useMemo, useState } from 'react';
import {
  MdAutoAwesome, MdBookmark, MdCloudQueue, MdDelete, MdEdit,
  MdFilterList, MdInsights, MdMenuBook, MdMood, MdPark,
  MdPublic, MdSearch, MdSpa, MdToday, MdWbSunny, MdEco,
  MdElectricBolt, MdDirectionsCar, MdRestaurant, MdRecycling,
} from 'react-icons/md';
import TopBar from '../components/layout/TopBar.jsx';
import useUserProfile from '../hooks/useUserProfile.js';
import { updateUserJournal } from '../lib/userApi.js';
import '../styles/gamification.css';

/* ── Constants ────────────────────────────────────────────────── */
const MOOD_OPTIONS = [
  { value: 'grounded',   label: 'Grounded',   hint: 'Calm and intentional',      Icon: MdSpa,        color: '#2e7d32' },
  { value: 'optimistic', label: 'Optimistic',  hint: 'Small wins are adding up',  Icon: MdWbSunny,    color: '#f9a825' },
  { value: 'growing',    label: 'Growing',     hint: 'Learning as you go',        Icon: MdPark,       color: '#43a047' },
  { value: 'aware',      label: 'Aware',       hint: 'Seeing the bigger picture', Icon: MdPublic,     color: '#1976d2' },
  { value: 'inspired',   label: 'Inspired',    hint: 'Ready to do more',          Icon: MdAutoAwesome,color: '#7b1fa2' },
  { value: 'grateful',   label: 'Grateful',    hint: 'Appreciating small things', Icon: MdBookmark,   color: '#c62828' },
];

const CATEGORIES = [
  { value: 'transport', label: 'Transport', Icon: MdDirectionsCar, color: '#1976d2', bg: 'rgba(25,118,210,0.1)' },
  { value: 'food',      label: 'Food',      Icon: MdRestaurant,   color: '#e64a19', bg: 'rgba(230,74,25,0.1)'  },
  { value: 'energy',    label: 'Energy',    Icon: MdElectricBolt, color: '#f9a825', bg: 'rgba(249,168,37,0.1)' },
  { value: 'waste',     label: 'Waste',     Icon: MdRecycling,    color: '#6a1fa2', bg: 'rgba(106,31,162,0.1)' },
  { value: 'mindset',   label: 'Mindset',   Icon: MdEco,          color: '#2e7d32', bg: 'rgba(46,125,50,0.1)'  },
];

const JOURNAL_PROMPTS = [
  'One greener choice I made today was...',
  'Something I noticed about my habits this week...',
  'Tomorrow I want to reduce my impact by...',
  'A small eco-win I am proud of today...',
  'One thing I can swap for a greener alternative...',
];

const MOOD_LOOKUP   = Object.fromEntries(MOOD_OPTIONS.map(o => [o.value, o]));
const CAT_LOOKUP    = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

/* ── Helpers ──────────────────────────────────────────────────── */
const createForm = () => ({
  date:     new Date().toISOString().slice(0, 10),
  mood:     MOOD_OPTIONS[0].value,
  category: CATEGORIES[0].value,
  text:     '',
});

const getLiveCarbonKg = () => {
  try {
    const key = `eco_daily_${new Date().toISOString().slice(0, 10)}`;
    const raw = localStorage.getItem(key);
    const val = raw ? Number(JSON.parse(raw)?.carbon ?? 0) : 0;
    return Number.isFinite(val) ? Math.max(0, val) : 0;
  } catch { return 0; }
};

const getImpact  = v => v <= 0.1 ? 'eco-good' : v <= 0.25 ? 'eco-mid' : 'eco-high';
const getLabel   = v => v <= 0.1 ? 'Low-impact' : v <= 0.25 ? 'Balanced' : 'High-impact';
const sortEntries = arr => [...arr].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
const fmtDate    = v => {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? v : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const getMoodMeta = value => MOOD_LOOKUP[value] || { value, label: value, hint: '', Icon: MdMood, color: '#888' };
const getCatMeta  = value => CAT_LOOKUP[value]  || { value, label: value, Icon: MdEco, color: '#2e7d32', bg: 'rgba(46,125,50,0.1)' };

const getStreak = journal => {
  const days = [...new Set(journal.map(e => e.date).filter(Boolean))]
    .map(d => new Date(`${d}T00:00:00`)).filter(d => !isNaN(d))
    .sort((a,b) => b - a);
  if (!days.length) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (Math.round((days[i-1] - days[i]) / 86400000) !== 1) break;
    streak++;
  }
  return streak;
};

/* ── 7-day heat strip ─────────────────────────────────────────── */
function HeatStrip({ entries }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const byDay = Object.fromEntries(days.map(d => [d, entries.filter(e => e.date === d).length]));
  return (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end', padding: '0.5rem 0' }}>
      {days.map(d => {
        const count = byDay[d] || 0;
        const opacity = count === 0 ? 0.12 : Math.min(0.2 + count * 0.28, 1);
        const label = new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' });
        return (
          <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
            <div title={`${d}: ${count} entr${count === 1 ? 'y' : 'ies'}`}
              style={{ width: '100%', height: '36px', borderRadius: '0.5rem', background: `rgba(46,125,50,${opacity})`, transition: 'background 0.3s' }} />
            <span style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */
export default function JournalView({ onLogout, activeTab = 'journal' }) {
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const { user: userProfile, isLoading, error } = useUserProfile(storedEmail);

  const [showForm,       setShowForm]       = useState(false);
  const [form,           setForm]           = useState(createForm);
  const [overrides,      setOverrides]      = useState(null);
  const [isSaving,       setIsSaving]       = useState(false);
  const [saveState,      setSaveState]      = useState({ type: '', message: '' });
  const [filterMood,     setFilterMood]     = useState('');
  const [filterCat,      setFilterCat]      = useState('');
  const [search,         setSearch]         = useState('');
  const [deleteConfirm,  setDeleteConfirm]  = useState(null); // entry id

  const allEntries = useMemo(() => overrides ?? sortEntries(userProfile?.journal || []), [overrides, userProfile]);

  const entries = useMemo(() => {
    let list = allEntries;
    if (filterMood) list = list.filter(e => e.mood === filterMood);
    if (filterCat)  list = list.filter(e => e.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.text?.toLowerCase().includes(q));
    }
    return list;
  }, [allEntries, filterMood, filterCat, search]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total:      allEntries.length,
      thisMonth:  allEntries.filter(e => { const d = new Date(e.date); return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).length,
      streak:     getStreak(allEntries),
      lowImpact:  allEntries.filter(e => Number(e.footprint) <= 0.1).length,
      week7:      allEntries.filter(e => { const d = new Date(`${e.date}T00:00:00`); return (now-d)/86400000 < 7; }).length,
    };
  }, [allEntries]);

  const saveEntries = async (updated, msg) => {
    await updateUserJournal(storedEmail, updated);
    setOverrides(updated);
    setSaveState({ type: 'success', message: msg });
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.text.trim() || isSaving) return;
    setIsSaving(true);
    setSaveState({ type: '', message: '' });
    const footprint = getLiveCarbonKg();
    const newEntry = {
      id:       allEntries.length ? Math.max(...allEntries.map(e => Number(e.id)||0)) + 1 : 1,
      date:     form.date,
      mood:     form.mood,
      category: form.category,
      text:     form.text.trim(),
      footprint,
    };
    try {
      await saveEntries(sortEntries([newEntry, ...allEntries]), 'Reflection saved to your eco journal.');
      setForm(createForm());
      setShowForm(false);
    } catch { setSaveState({ type: 'error', message: 'Could not save your reflection right now.' }); }
    finally { setIsSaving(false); }
  };

  const deleteEntry = async id => {
    try {
      const updated = sortEntries(allEntries.filter(e => e.id !== id));
      await saveEntries(updated, 'Entry removed from your journal.');
    } catch { setSaveState({ type: 'error', message: 'Could not delete that entry.' }); }
    finally { setDeleteConfirm(null); }
  };

  const latestEntry = allEntries[0] || null;

  return (
    <div className="gamification-page">
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      {/* Header */}
      <header className="section-hero">
        <div className="section-hero-copy">
          <span className="section-kicker">Reflection Studio</span>
          <h1 className="gamification-title">Eco Journal</h1>
          <p className="gamification-subtitle">
            Capture habits, tradeoffs and greener wins that shape your routine.
          </p>
        </div>
        <div className="section-hero-side">
          <article className="hero-compass-card">
            <div className="hero-compass-header">
              <span className="hero-compass-kicker">7-day activity</span>
              <MdMenuBook />
            </div>
            <HeatStrip entries={allEntries} />
            <div className="hero-compass-metrics">
              <div><span>Streak</span><strong>{stats.streak} day{stats.streak!==1?'s':''}</strong></div>
              <div><span>This week</span><strong>{stats.week7} notes</strong></div>
            </div>
          </article>
          <button className="toggle-form-btn" onClick={() => setShowForm(p => !p)} type="button">
            {showForm ? 'Discard Entry' : <><MdEdit style={{verticalAlign:'middle',marginRight:4}}/> New Reflection</>}
          </button>
        </div>
      </header>

      {/* Stats row */}
      <section className="insight-grid">
        {[
          { label:'Streak',        value:`${stats.streak}d`,    copy:'days in a row',      accent:true },
          { label:'Total entries', value:stats.total,           copy:`${stats.thisMonth} this month` },
          { label:'Low-impact',    value:stats.lowImpact,       copy:'entries under 0.1 kg' },
          { label:'This week',     value:stats.week7,           copy:'reflections logged' },
        ].map(({ label, value, copy, accent }) => (
          <article key={label} className={`insight-card${accent?' insight-card-accent':''}`}>
            {accent && <div className="insight-icon-shell"><MdMenuBook /></div>}
            <div className="insight-content">
              <p className="insight-label">{label}</p>
              <h2>{value}</h2>
              <p className="insight-copy">{copy}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Panels */}
      <section className="feature-panel-grid">
        <article className="feature-panel">
          <div className="feature-panel-header">
            <div><span className="section-kicker">Latest</span><h2 className="feature-panel-title">Most recent reflection</h2></div>
            <MdInsights className="feature-panel-icon" />
          </div>
          {latestEntry ? (
            <div className="feature-spotlight">
              <div className="feature-spotlight-row">
                <span className={`impact-pill ${getImpact(latestEntry.footprint)}`}>{getLabel(latestEntry.footprint)}</span>
                <span className="spotlight-meta-chip">{getMoodMeta(latestEntry.mood).label}</span>
                {latestEntry.category && (
                  <span className="spotlight-meta-chip" style={{ background: getCatMeta(latestEntry.category).bg, color: getCatMeta(latestEntry.category).color }}>
                    {latestEntry.category}
                  </span>
                )}
              </div>
              <p className="feature-spotlight-text">"{latestEntry.text}"</p>
              <p className="feature-spotlight-meta">{fmtDate(latestEntry.date)} · {Number(latestEntry.footprint||0).toFixed(3)} kg CO₂</p>
            </div>
          ) : (
            <div className="feature-empty"><MdMood size="2rem" /><p>Your first reflection will unlock insights here.</p></div>
          )}
        </article>

        <article className="feature-panel">
          <div className="feature-panel-header">
            <div><span className="section-kicker">Prompt Bank</span><h2 className="feature-panel-title">Not sure where to start?</h2></div>
            <MdAutoAwesome className="feature-panel-icon" />
          </div>
          <div className="prompt-card-grid">
            {JOURNAL_PROMPTS.map(prompt => (
              <button key={prompt} className="prompt-card" type="button"
                onClick={() => { setShowForm(true); setForm(f => ({ ...f, text: f.text || prompt })); }}>
                <span className="prompt-card-kicker">Reflection idea</span>
                <strong>{prompt}</strong>
                <span className="prompt-card-footer">Tap to draft</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      {/* New entry form */}
      {showForm && (
        <form className="premium-form-card" onSubmit={submit}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input type="date" className="premium-input" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                {CATEGORIES.map(({ value, label, color, bg }) => (
                  <button key={value} type="button"
                    style={{ padding:'0.4rem 0.8rem', borderRadius:'9999px', border:`1.5px solid ${form.category===value?color:'rgba(0,0,0,0.1)'}`,
                      background: form.category===value?bg:'transparent', color: form.category===value?color:'#555',
                      fontWeight:700, fontSize:'0.78rem', cursor:'pointer', transition:'all 0.15s' }}
                    onClick={() => setForm({ ...form, category: value })}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">How does this day feel?</label>
            <div className="mood-selector mood-selector-expanded">
              {MOOD_OPTIONS.map(({ value, label, hint, Icon, color }) => (
                <button key={value} type="button"
                  className={`mood-option-card ${form.mood===value?'active':''}`}
                  style={ form.mood===value ? { borderColor: color, background:`${color}18` } : {} }
                  onClick={() => setForm({ ...form, mood: value })}>
                  {createElement(Icon, { style:{ color: form.mood===value?color:'inherit' } })}
                  <strong>{label}</strong>
                  <span>{hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Daily Wisdom & Actions</label>
            <textarea className="premium-textarea premium-textarea-tall" rows={5}
              placeholder="What changed today, and what would you like to repeat tomorrow?"
              value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} />
            <div className="field-meta-row">
              <span>Write a short note about your choices and lessons.</span>
              <span>{form.text.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          <div className="field-meta-card reflection-guide-card">
            <strong>Today's tracked carbon: {getLiveCarbonKg().toFixed(3)} kg CO₂</strong>
            <p>This value from your active tracking session will be attached to this entry.</p>
          </div>

          <div className="form-actions-row">
            <button type="submit" className="complete-btn complete-btn-wide" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Preserve Memory'}
            </button>
          </div>
        </form>
      )}

      {saveState.message && (
        <div className={`feedback-banner ${saveState.type==='error'?'error':'success'}`}>{saveState.message}</div>
      )}
      {error && <div className="feedback-banner error">{error}</div>}

      {/* Delete confirmation modal */}
      {deleteConfirm !== null && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'grid', placeItems:'center', zIndex:1000 }}
          onClick={() => setDeleteConfirm(null)}>
          <div style={{ background:'#fff', borderRadius:'1.25rem', padding:'2rem', maxWidth:'360px', width:'90%', boxShadow:'0 24px 48px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ color:'#b3261e', marginBottom:'0.75rem' }}>Delete this reflection?</h3>
            <p style={{ color:'#555', marginBottom:'1.5rem', fontSize:'0.9rem' }}>This action cannot be undone.</p>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding:'0.5rem 1rem', borderRadius:'0.75rem', border:'1px solid #ddd', background:'#fff', cursor:'pointer', fontWeight:600 }}>
                Cancel
              </button>
              <button onClick={() => deleteEntry(deleteConfirm)}
                style={{ padding:'0.5rem 1rem', borderRadius:'0.75rem', border:'none', background:'#b3261e', color:'#fff', cursor:'pointer', fontWeight:700 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive */}
      <section className="section-block">
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Timeline</span>
            <h2 className="activity-section-title">Reflection archive</h2>
          </div>
          <span className="section-count">{allEntries.length} saved</span>
        </div>

        {/* Search & filter bar */}
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:'1 1 220px' }}>
            <MdSearch style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'#888', fontSize:'1.1rem' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries…"
              style={{ width:'100%', paddingLeft:'2.2rem', paddingRight:'0.75rem', height:'2.4rem', borderRadius:'0.75rem',
                border:'1.5px solid rgba(46,125,50,0.2)', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
            <MdFilterList style={{ color:'#888' }} />
            {['', ...MOOD_OPTIONS.map(m => m.value)].map(v => (
              <button key={v||'all'} type="button" onClick={() => setFilterMood(v)}
                style={{ padding:'0.35rem 0.75rem', borderRadius:'9999px', border:'1.5px solid',
                  borderColor: filterMood===v?'#2e7d32':'rgba(0,0,0,0.1)',
                  background: filterMood===v?'rgba(46,125,50,0.1)':'transparent',
                  color: filterMood===v?'#2e7d32':'#555', fontWeight:600, fontSize:'0.78rem', cursor:'pointer' }}>
                {v ? getMoodMeta(v).label : 'All moods'}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            {['', ...CATEGORIES.map(c => c.value)].map(v => {
              const cat = v ? getCatMeta(v) : null;
              return (
                <button key={v||'allcat'} type="button" onClick={() => setFilterCat(v)}
                  style={{ padding:'0.35rem 0.75rem', borderRadius:'9999px', border:'1.5px solid',
                    borderColor: filterCat===v?(cat?.color||'#2e7d32'):'rgba(0,0,0,0.1)',
                    background: filterCat===v?(cat?.bg||'rgba(46,125,50,0.1)'):'transparent',
                    color: filterCat===v?(cat?.color||'#2e7d32'):'#555', fontWeight:600, fontSize:'0.78rem', cursor:'pointer' }}>
                  {v || 'All categories'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Journal cards */}
        <div className="journal-grid">
          {entries.length > 0 ? entries.map(entry => {
            const mood = getMoodMeta(entry.mood);
            const cat  = entry.category ? getCatMeta(entry.category) : null;
            const MoodIcon = mood.Icon;
            return (
              <article key={entry.id} className={`journal-card ${getImpact(entry.footprint)}`}
                style={{ position:'relative' }}>
                {/* Delete button */}
                <button onClick={() => setDeleteConfirm(entry.id)} type="button"
                  title="Delete entry"
                  style={{ position:'absolute', top:'0.75rem', right:'0.75rem', background:'rgba(229,57,53,0.08)',
                    border:'none', borderRadius:'0.5rem', padding:'0.3rem 0.45rem', cursor:'pointer',
                    color:'#c62828', display:'flex', alignItems:'center', opacity:0.6, transition:'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity='1'}
                  onMouseLeave={e => e.currentTarget.style.opacity='0.6'}>
                  <MdDelete fontSize="1rem" />
                </button>

                <div className="journal-header journal-header-rich">
                  <span className="journal-date-tag">
                    <MdToday style={{verticalAlign:'middle',marginRight:4}} />
                    {fmtDate(entry.date)}
                  </span>
                  <div className="journal-header-pills">
                    <span className="journal-mood-badge" style={{ color: mood.color }}>
                      <MoodIcon /> {mood.label}
                    </span>
                    {cat && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem',
                        padding:'0.25rem 0.6rem', borderRadius:'9999px', background:cat.bg,
                        color:cat.color, fontSize:'0.75rem', fontWeight:700 }}>
                        {createElement(cat.Icon, { fontSize:'0.85rem' })} {cat.label}
                      </span>
                    )}
                    <span className={`impact-pill impact-pill-compact ${getImpact(entry.footprint)}`}>
                      {getLabel(entry.footprint)}
                    </span>
                  </div>
                </div>
                <p className="journal-text">{entry.text}</p>
                <div className="journal-footer">
                  <div className="impact-chip">
                    <MdCloudQueue /> {Number(entry.footprint||0).toFixed(3)} kg CO₂
                  </div>
                  <span className="journal-word-count">
                    {entry.text?.trim().split(/\s+/).filter(Boolean).length||0} words
                  </span>
                </div>
              </article>
            );
          }) : (
            <div className="empty-collection-card" style={{ gridColumn:'1/-1' }}>
              <MdMood size="3rem" />
              <h3>{isLoading ? 'Loading your journal…' : search||filterMood||filterCat ? 'No entries match your filter.' : 'Your journal is still blank'}</h3>
              <p>Start with one honest note about a greener choice you made today.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
