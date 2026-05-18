import { useMemo, useState } from 'react';
import { MdAdd, MdDelete, MdFlag, MdLocalFireDepartment, MdStars, MdTimer, MdTrackChanges, MdTrendingUp } from 'react-icons/md';
import TopBar from '../components/layout/TopBar.jsx';
import useUserProfile from '../hooks/useUserProfile.js';
import { updateUserGoals } from '../lib/userApi.js';
import '../styles/gamification.css';

const CATEGORIES = [
  { value:'transport', label:'🚗 Transport', color:'#1976d2', bg:'rgba(25,118,210,0.1)' },
  { value:'energy',    label:'⚡ Energy',    color:'#f9a825', bg:'rgba(249,168,37,0.1)' },
  { value:'food',      label:'🥗 Food',      color:'#e64a19', bg:'rgba(230,74,25,0.1)'  },
  { value:'waste',     label:'♻️ Waste',     color:'#6a1fa2', bg:'rgba(106,31,162,0.1)' },
  { value:'mindset',   label:'🌱 Mindset',   color:'#2e7d32', bg:'rgba(46,125,50,0.1)'  },
];
const PRIORITIES = [
  { value:'high',   label:'🔥 High',   color:'#c62828', bg:'rgba(198,40,40,0.1)'   },
  { value:'medium', label:'⚡ Medium', color:'#f9a825', bg:'rgba(249,168,37,0.1)'  },
  { value:'low',    label:'🌿 Low',    color:'#2e7d32', bg:'rgba(46,125,50,0.1)'   },
];
const TEMPLATES = [
  { title:'Greener commute week',    desc:'Replace 3 car rides with cycling, walking, or transit.', xp:180, days:7,  category:'transport', priority:'high'   },
  { title:'Low-waste kitchen reset', desc:'Meal plan, reuse containers, avoid single-use packaging.', xp:220, days:10, category:'food',      priority:'medium' },
  { title:'Home energy tune-up',     desc:'Audit lights, chargers, and cooling habits.', xp:250, days:14, category:'energy',    priority:'medium' },
  { title:'Plastic-free week',       desc:'Swap all single-use plastics for reusable alternatives.', xp:200, days:7,  category:'waste',     priority:'high'   },
  { title:'30-day step challenge',   desc:'Walk or cycle every day for 30 days straight.', xp:350, days:30, category:'transport', priority:'medium' },
  { title:'Mindful consumption',     desc:'Track and cut one unnecessary purchase each week.',  xp:150, days:14, category:'mindset',   priority:'low'    },
];

const clamp  = v => Math.max(0, Math.min(100, Number(v)||0));
const fmtDate = v => { if(!v) return ''; const d=new Date(v); return isNaN(d)?v:d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); };
const futureDt = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const daysLeft = dl => { if(!dl) return null; const e=new Date(`${dl}T00:00:00`), t=new Date(); const s=new Date(t.getFullYear(),t.getMonth(),t.getDate()); return isNaN(e)?null:Math.ceil((e-s)/86400000); };
const sortGoals = goals => [...goals].sort((a,b) => { if(a.done!==b.done) return a.done?1:-1; const la=new Date((a.done?a.completedAt:a.deadline)||0), lb=new Date((b.done?b.completedAt:b.deadline)||0); return a.done?lb-la:la-lb; });
const getStatus = g => {
  if(g.done) return { label:'Completed', tone:'success', detail:`Finished ${fmtDate(g.completedAt)}` };
  const d=daysLeft(g.deadline);
  if(d===null) return { label:'No deadline', tone:'neutral', detail:'Add a date to keep it visible.' };
  if(d<0)  return { label:'Overdue',   tone:'danger',  detail:`${Math.abs(d)}d past target` };
  if(d===0) return { label:'Due today', tone:'warn',   detail:'A good day to close this out.' };
  if(d<=3)  return { label:'Due soon',  tone:'warn',   detail:`${d}d left` };
  return        { label:'On track',   tone:'success', detail:`${d} day${d!==1?'s':''} remaining` };
};
const getCat  = v => CATEGORIES.find(c=>c.value===v) || CATEGORIES[4];
const getPri  = v => PRIORITIES.find(p=>p.value===v) || PRIORITIES[1];
const createForm = () => ({ title:'', desc:'', deadline:'', xp:200, category:'transport', priority:'medium' });

/* Progress ring */
function Ring({ pct, size=56, stroke=5, color='#43a047' }) {
  const r = (size-stroke*2)/2, circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{ flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8f5e9" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
        strokeLinecap="round" style={{ transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dashoffset 0.7s ease' }}/>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={size*0.22} fontWeight="800" fill={color}>{pct}%</text>
    </svg>
  );
}

export default function GoalsView({ onLogout, activeTab='goals' }) {
  const storedEmail = typeof window!=='undefined' ? localStorage.getItem('userEmail') : null;
  const { user:userProfile, isLoading, error } = useUserProfile(storedEmail);
  const [showForm,      setShowForm]      = useState(false);
  const [form,          setForm]          = useState(createForm);
  const [overrides,     setOverrides]     = useState(null);
  const [saveState,     setSaveState]     = useState({ type:'', message:'' });
  const [isSavingForm,  setIsSavingForm]  = useState(false);
  const [pendingId,     setPendingId]     = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [celebrated,    setCelebrated]    = useState(null);

  const goals = useMemo(() => overrides ?? sortGoals(userProfile?.goals||[]), [overrides, userProfile]);
  const activeGoals    = useMemo(() => goals.filter(g=>!g.done), [goals]);
  const completedGoals = useMemo(() => goals.filter(g=>g.done),  [goals]);
  const priorityGoal   = useMemo(() => [...activeGoals].sort((a,b) => { const da=daysLeft(a.deadline)??Infinity, db=daysLeft(b.deadline)??Infinity; return da-db||clamp(b.progress)-clamp(a.progress); })[0]||null, [activeGoals]);

  const stats = useMemo(() => ({
    avgProgress:    activeGoals.length ? Math.round(activeGoals.reduce((s,g)=>s+clamp(g.progress),0)/activeGoals.length) : 0,
    dueSoon:        activeGoals.filter(g=>{ const d=daysLeft(g.deadline); return d!==null&&d>=0&&d<=7; }).length,
    overdue:        activeGoals.filter(g=>{ const d=daysLeft(g.deadline); return d!==null&&d<0; }).length,
    earnedXp:       completedGoals.reduce((s,g)=>s+(Number(g.xp)||0),0),
    completionRate: goals.length ? Math.round((completedGoals.length/goals.length)*100) : 0,
  }), [activeGoals, completedGoals, goals.length]);

  const sync = async (updated, msg, id=null) => {
    setPendingId(id); setSaveState({ type:'', message:'' });
    try { await updateUserGoals(storedEmail, updated); setOverrides(sortGoals(updated)); setSaveState({ type:'success', message:msg }); }
    catch { setSaveState({ type:'error', message:'Could not save right now.' }); }
    finally { setPendingId(null); }
  };

  const completeGoal = async id => {
    const today=new Date().toISOString().slice(0,10);
    await sync(goals.map(g=>g.id===id?{...g,done:true,progress:100,completedAt:today}:g),'Quest completed! 🎉',id);
    setCelebrated(id); setTimeout(()=>setCelebrated(null), 2500);
  };
  const updateProgress = async (id,val) => {
    const progress=clamp(val), today=new Date().toISOString().slice(0,10);
    await sync(goals.map(g=>g.id===id?{...g,progress,done:progress>=100,completedAt:progress>=100?today:null}:g), progress>=100?'Quest completed! 🎉':'Progress updated.',id);
    if(progress>=100){ setCelebrated(id); setTimeout(()=>setCelebrated(null),2500); }
  };
  const deleteGoal = async id => { await sync(goals.filter(g=>g.id!==id),'Goal removed.',null); setDeleteConfirm(null); };

  const submit = async e => {
    e.preventDefault(); if(!form.title.trim()||!form.deadline||isSavingForm) return;
    setIsSavingForm(true); setSaveState({ type:'', message:'' });
    const newGoal = { id:goals.length?Math.max(...goals.map(g=>Number(g.id)||0))+1:1, title:form.title.trim(), desc:form.desc.trim()||'Custom eco quest', progress:0, deadline:form.deadline, xp:Number(form.xp)||100, category:form.category, priority:form.priority, done:false, completedAt:null };
    try { await updateUserGoals(storedEmail, sortGoals([newGoal,...goals])); setOverrides(sortGoals([newGoal,...goals])); setForm(createForm()); setShowForm(false); setSaveState({ type:'success', message:'New eco quest added!' }); }
    catch { setSaveState({ type:'error', message:'Could not save.' }); }
    finally { setIsSavingForm(false); }
  };

  const Chip = ({label, active, color, bg, onClick}) => (
    <button type="button" onClick={onClick}
      style={{ padding:'0.35rem 0.75rem', borderRadius:'9999px', border:`1.5px solid ${active?color:'rgba(0,0,0,0.1)'}`, background:active?bg:'transparent', color:active?color:'#555', fontWeight:700, fontSize:'0.78rem', cursor:'pointer', transition:'all 0.15s' }}>
      {label}
    </button>
  );

  return (
    <div className="gamification-page">
      <TopBar activeTab={activeTab} onLogout={onLogout} />

      <header className="section-hero">
        <div className="section-hero-copy">
          <span className="section-kicker">Quest Board</span>
          <h1 className="gamification-title">Eco Quests</h1>
          <p className="gamification-subtitle">Turn sustainability goals into missions with deadlines and momentum.</p>
        </div>
        <div className="section-hero-side">
          <article className="hero-compass-card hero-compass-card-goals">
            <div className="hero-compass-header"><span className="hero-compass-kicker">Mission control</span><MdStars/></div>
            <strong>{priorityGoal?priorityGoal.title:'Build your next eco mission'}</strong>
            <p>{priorityGoal?`${clamp(priorityGoal.progress)}% complete · ${getStatus(priorityGoal).detail}`:'Add a quest and this board will guide your next move.'}</p>
            <div className="hero-compass-metrics">
              <div><span>Completion</span><strong>{stats.completionRate}%</strong></div>
              <div><span>XP banked</span><strong>{stats.earnedXp}</strong></div>
            </div>
          </article>
          <button className="toggle-form-btn" onClick={()=>setShowForm(p=>!p)} type="button">
            {showForm?'Cancel Mission':<><MdAdd style={{verticalAlign:'middle',marginRight:4}}/>Start New Quest</>}
          </button>
        </div>
      </header>

      <section className="insight-grid">
        {[
          { label:'Active missions',  value:activeGoals.length,    copy:`${stats.dueSoon} due this week`, accent:true },
          { label:'Avg progress',     value:`${stats.avgProgress}%`, copy:'across all active quests' },
          { label:'Overdue',          value:stats.overdue,           copy:'goals past their target date' },
          { label:'XP earned',        value:stats.earnedXp,          copy:'from completed quests' },
        ].map(({label,value,copy,accent})=>(
          <article key={label} className={`insight-card${accent?' insight-card-accent':''}`}>
            {accent&&<div className="insight-icon-shell"><MdFlag/></div>}
            <div className="insight-content"><p className="insight-label">{label}</p><h2>{value}</h2><p className="insight-copy">{copy}</p></div>
          </article>
        ))}
      </section>

      {/* Templates */}
      <section className="feature-panel-grid">
        <article className="feature-panel" style={{gridColumn:'1/-1'}}>
          <div className="feature-panel-header">
            <div><span className="section-kicker">Fast Start</span><h2 className="feature-panel-title">Pick a quest template</h2></div>
            <MdStars className="feature-panel-icon"/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'0.9rem'}}>
            {TEMPLATES.map(t=>{
              const cat=getCat(t.category), pri=getPri(t.priority);
              return (
                <button key={t.title} className="template-card" type="button"
                  onClick={()=>{ setShowForm(true); setForm({title:t.title,desc:t.desc,deadline:futureDt(t.days),xp:t.xp,category:t.category,priority:t.priority}); }}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem'}}>
                    <span style={{padding:'0.2rem 0.55rem',borderRadius:'9999px',background:cat.bg,color:cat.color,fontSize:'0.7rem',fontWeight:800}}>{cat.label}</span>
                    <span style={{padding:'0.2rem 0.55rem',borderRadius:'9999px',background:pri.bg,color:pri.color,fontSize:'0.7rem',fontWeight:800}}>{pri.label}</span>
                  </div>
                  <span className="prompt-card-kicker">Starter quest</span>
                  <strong>{t.title}</strong>
                  <p>{t.desc}</p>
                  <div className="template-card-footer"><span>+{t.xp} XP</span><span>{t.days}d window</span></div>
                </button>
              );
            })}
          </div>
        </article>
      </section>

      {/* Form */}
      {showForm&&(
        <form className="premium-form-card" onSubmit={submit}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem'}}>
            <div className="input-group"><label className="input-label">Quest Title</label>
              <input className="premium-input" placeholder="e.g. Bike to work three times this week" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Deadline</label>
              <input type="date" className="premium-input" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></div>
          </div>
          <div className="input-group"><label className="input-label">Mission Description</label>
            <textarea className="premium-textarea" rows={3} placeholder="Describe the concrete actions that make this goal complete." value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})}/></div>
          <div className="input-group"><label className="input-label">Category</label>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
              {CATEGORIES.map(({value,label,color,bg})=>(
                <Chip key={value} label={label} active={form.category===value} color={color} bg={bg} onClick={()=>setForm({...form,category:value})}/>
              ))}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem'}}>
            <div className="input-group"><label className="input-label">Priority</label>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                {PRIORITIES.map(({value,label,color,bg})=>(
                  <Chip key={value} label={label} active={form.priority===value} color={color} bg={bg} onClick={()=>setForm({...form,priority:value})}/>
                ))}
              </div>
            </div>
            <div className="input-group"><label className="input-label">XP Potential</label>
              <input type="number" className="premium-input" value={form.xp} min="50" step="10" onChange={e=>setForm({...form,xp:e.target.value})}/></div>
          </div>
          <div className="form-actions-row">
            <button type="submit" className="complete-btn complete-btn-wide" disabled={isSavingForm}>
              {isSavingForm?'Creating Quest…':'Accept Quest'}
            </button>
          </div>
        </form>
      )}

      {saveState.message&&<div className={`feedback-banner ${saveState.type==='error'?'error':'success'}`}>{saveState.message}</div>}
      {error&&<div className="feedback-banner error">{error}</div>}

      {/* Delete modal */}
      {deleteConfirm!==null&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',display:'grid',placeItems:'center',zIndex:1000}} onClick={()=>setDeleteConfirm(null)}>
          <div style={{background:'#fff',borderRadius:'1.25rem',padding:'2rem',maxWidth:'360px',width:'90%',boxShadow:'0 24px 48px rgba(0,0,0,0.15)'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#b3261e',marginBottom:'0.75rem'}}>Delete this quest?</h3>
            <p style={{color:'#555',marginBottom:'1.5rem',fontSize:'0.9rem'}}>This cannot be undone.</p>
            <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end'}}>
              <button onClick={()=>setDeleteConfirm(null)} style={{padding:'0.5rem 1rem',borderRadius:'0.75rem',border:'1px solid #ddd',background:'#fff',cursor:'pointer',fontWeight:600}}>Cancel</button>
              <button onClick={()=>deleteGoal(deleteConfirm)} style={{padding:'0.5rem 1rem',borderRadius:'0.75rem',border:'none',background:'#b3261e',color:'#fff',cursor:'pointer',fontWeight:700}}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Active quests */}
      <section className="section-block">
        <div className="section-heading-row">
          <div><span className="section-kicker">Active Board</span><h2 className="activity-section-title">Current missions</h2></div>
          <span className="section-count">{activeGoals.length} active</span>
        </div>
        <div className="quest-list">
          {activeGoals.map(quest=>{
            const status=getStatus(quest), progress=clamp(quest.progress);
            const cat=quest.category?getCat(quest.category):null, pri=quest.priority?getPri(quest.priority):null;
            const isCelebrating=celebrated===quest.id;
            return (
              <article key={quest.id} className={`quest-card ${status.tone==='danger'?'quest-card-urgent':''} ${status.tone==='warn'?'quest-card-warn':''}`}
                style={{position:'relative', outline: isCelebrating?'3px solid #43a047':'none', transition:'outline 0.3s'}}>
                {isCelebrating&&<div style={{position:'absolute',inset:0,background:'rgba(67,160,71,0.07)',borderRadius:'1.25rem',pointerEvents:'none',animation:'slide_up 0.4s ease'}}/>}
                {/* Delete btn */}
                <button onClick={()=>setDeleteConfirm(quest.id)} type="button" title="Remove quest"
                  style={{position:'absolute',top:'0.75rem',right:'0.75rem',background:'rgba(229,57,53,0.08)',border:'none',borderRadius:'0.5rem',padding:'0.3rem 0.45rem',cursor:'pointer',color:'#c62828',opacity:0.5,transition:'opacity 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.5'}>
                  <MdDelete fontSize="1rem"/>
                </button>

                <div className="quest-card-topline" style={{paddingRight:'2rem'}}>
                  <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center'}}>
                    <span className="quest-card-kicker">Mission #{quest.id}</span>
                    {cat&&<span style={{padding:'0.2rem 0.55rem',borderRadius:'9999px',background:cat.bg,color:cat.color,fontSize:'0.7rem',fontWeight:800}}>{cat.label}</span>}
                    {pri&&<span style={{padding:'0.2rem 0.55rem',borderRadius:'9999px',background:pri.bg,color:pri.color,fontSize:'0.7rem',fontWeight:800}}>{pri.label}</span>}
                  </div>
                  <span className="xp-badge">+{quest.xp} XP</span>
                </div>

                <div style={{display:'flex',gap:'1rem',alignItems:'center',marginBottom:'0.75rem'}}>
                  <Ring pct={progress} color={status.tone==='danger'?'#e53935':status.tone==='warn'?'#f9a825':'#43a047'}/>
                  <div className="quest-info" style={{flex:1}}>
                    <div className="quest-title-row">
                      <h3>{quest.title}</h3>
                      <span className={`status-pill ${status.tone}`}>{status.label}</span>
                    </div>
                    <p>{quest.desc}</p>
                  </div>
                </div>

                <div className="quest-progress-bar"><div className="quest-progress-fill" style={{width:`${progress}%`,background:status.tone==='danger'?'linear-gradient(to right,#e53935,#ff8a65)':status.tone==='warn'?'linear-gradient(to right,#f9a825,#ffd166)':'linear-gradient(to right,#43a047,#69f07a)'}}/></div>
                <div className="quest-progress-meta"><span>{progress}% complete</span><span>{status.detail}</span></div>

                <div className="quest-detail-row">
                  <span className="quest-detail-pill"><MdTimer/> Target {fmtDate(quest.deadline)}</span>
                  <span className="quest-detail-pill">{progress<25?'Next: 25%':progress<50?'Next: 50%':progress<75?'Next: 75%':progress<100?'Final push!':'Done!'}</span>
                </div>

                <div className="quest-progress-actions">
                  {[25,50,75,100].map(step=>(
                    <button key={step} className={`progress-chip ${progress>=step?'active':''}`} type="button"
                      disabled={pendingId===quest.id} onClick={()=>updateProgress(quest.id,step)}>{step}%</button>
                  ))}
                </div>
                <div className="quest-footer">
                  <button className="complete-btn" type="button" disabled={pendingId===quest.id} onClick={()=>completeGoal(quest.id)}>
                    {pendingId===quest.id?'Saving…':isCelebrating?'🎉 Claimed!':'Claim Mastery'}
                  </button>
                </div>
              </article>
            );
          })}
          {activeGoals.length===0&&(
            <div className="empty-collection-card"><MdTrackChanges size="3rem"/>
              <h3>{isLoading?'Loading your quests…':'No active quests yet'}</h3>
              <p>Pick a template above or create your own measurable eco challenge.</p>
            </div>
          )}
        </div>
      </section>

      {completedGoals.length>0&&(
        <section className="section-block">
          <div className="section-heading-row">
            <div><span className="section-kicker">Completed</span><h2 className="activity-section-title">Hall of fame</h2></div>
            <span className="section-count">{completedGoals.length} cleared</span>
          </div>
          <div className="quest-list">
            {completedGoals.map(quest=>{
              const cat=quest.category?getCat(quest.category):null;
              return (
                <article key={quest.id} className="quest-card completed" style={{position:'relative'}}>
                  <button onClick={()=>setDeleteConfirm(quest.id)} type="button" title="Remove"
                    style={{position:'absolute',top:'0.75rem',right:'0.75rem',background:'rgba(229,57,53,0.08)',border:'none',borderRadius:'0.5rem',padding:'0.3rem 0.45rem',cursor:'pointer',color:'#c62828',opacity:0.4,transition:'opacity 0.15s'}}
                    onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.4'}>
                    <MdDelete fontSize="1rem"/>
                  </button>
                  <div className="quest-card-topline" style={{paddingRight:'2rem'}}>
                    <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                      <span className="quest-card-kicker">Completed mission</span>
                      {cat&&<span style={{padding:'0.2rem 0.55rem',borderRadius:'9999px',background:cat.bg,color:cat.color,fontSize:'0.7rem',fontWeight:800}}>{cat.label}</span>}
                    </div>
                    <span className="xp-badge xp-badge-muted">+{quest.xp} XP</span>
                  </div>
                  <div className="quest-header">
                    <div className="quest-info">
                      <div className="quest-title-row">
                        <h3>{quest.title}</h3>
                        <span className="status-pill success"><MdLocalFireDepartment/>Finished</span>
                      </div>
                      <p>Completed on {fmtDate(quest.completedAt)} · {quest.xp} XP earned.</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
