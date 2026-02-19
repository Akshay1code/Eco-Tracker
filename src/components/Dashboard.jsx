import React, { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & DATA
// ══════════════════════════════════════════════════════════════════════════════

const MOTIVATIONAL_QUOTES = [
  { text: "Every step you take is a vote for the planet you want to live on.", author: "Unknown" },
  { text: "The Earth does not belong to us. We belong to the Earth.", author: "Chief Seattle" },
  { text: "Small acts, when multiplied by millions, can transform the world.", author: "Howard Zinn" },
  { text: "In every walk with nature, one receives far more than he seeks.", author: "John Muir" },
  { text: "What you do makes a difference. You just have to decide what kind.", author: "Jane Goodall" },
  { text: "The greatest threat to our planet is thinking someone else will save it.", author: "Robert Swan" },
  { text: "We don't need perfection. We need millions doing it imperfectly.", author: "Anne-Marie Bonneau" },
];

const ECO_EQUIVALENTS = [
  { threshold: 0,     icon: "🌱", text: "less than powering an LED for a minute" },
  { threshold: 0.001, icon: "💡", text: "= 1 minute of LED bulb" },
  { threshold: 0.01,  icon: "📱", text: "= charging your phone once" },
  { threshold: 0.05,  icon: "☕", text: "= brewing a cup of coffee" },
  { threshold: 0.1,   icon: "🚗", text: "= driving 0.5 km by car" },
  { threshold: 0.5,   icon: "✈️", text: "= 2 minutes of air travel" },
];

const RANK_TIERS = [
  { min: 0,    icon: "🌱", title: "Seedling",      color: "#86efac", bg: "#052e16" },
  { min: 0.01, icon: "🌿", title: "Sapling",       color: "#4ade80", bg: "#14532d" },
  { min: 0.05, icon: "🌳", title: "Tree Guardian", color: "#22c55e", bg: "#166534" },
  { min: 0.1,  icon: "🌲", title: "Forest Keeper", color: "#16a34a", bg: "#15803d" },
  { min: 0.5,  icon: "🌍", title: "Eco Legend",    color: "#fbbf24", bg: "#78350f" },
];

const DAILY_GOALS = [
  { id: "walk1km",   label: "Walk 1 km",            icon: "🚶", reward: 50,  color: "#22c55e", check: d => d.distance >= 1 },
  { id: "track10m",  label: "Track 10 minutes",     icon: "⏱", reward: 30,  color: "#3b82f6", check: d => d.screenTime >= 600 },
  { id: "lowcarbon", label: "Stay under 0.1 kg CO₂",icon: "🌿", reward: 100, color: "#a855f7", check: d => d.carbon > 0 && d.carbon < 0.1 },
  { id: "walk500m",  label: "Walk 500 m",           icon: "👣", reward: 25,  color: "#f59e0b", check: d => d.distance >= 0.5 },
  { id: "screen5m",  label: "5 min active",         icon: "🎯", reward: 20,  color: "#06b6d4", check: d => d.screenTime >= 300 },
];

// ══════════════════════════════════════════════════════════════════════════════
// PERSISTENCE HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function todayKey() { return new Date().toISOString().split("T")[0]; }

function loadDailyStats() {
  try { const r = localStorage.getItem(`eco_daily_${todayKey()}`); return r ? JSON.parse(r) : null; }
  catch { return null; }
}

function saveDailyStats(stats) {
  try { localStorage.setItem(`eco_daily_${todayKey()}`, JSON.stringify(stats)); } catch {}
}

function loadHourlyHistory() {
  try { const r = localStorage.getItem(`eco_hourly_${todayKey()}`); return r ? JSON.parse(r) : []; }
  catch { return []; }
}

function saveHourlyHistory(h) {
  try { localStorage.setItem(`eco_hourly_${todayKey()}`, JSON.stringify(h)); } catch {}
}

function loadStreak() {
  try {
    const r = localStorage.getItem("eco_streak");
    if (!r) return 1;
    const { days, lastDate } = JSON.parse(r);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().split("T")[0];
    if (lastDate === todayKey() || lastDate === yKey) return days;
    return 1;
  } catch { return 1; }
}

function saveStreak(days) {
  try { localStorage.setItem("eco_streak", JSON.stringify({ days, lastDate: todayKey() })); } catch {}
}

function loadAllDailyHistory() {
  try {
    return Object.keys(localStorage)
      .filter(k => k.startsWith("eco_daily_"))
      .sort()
      .slice(-7)
      .map(k => ({ date: k.replace("eco_daily_", ""), ...JSON.parse(localStorage.getItem(k)) }));
  } catch { return []; }
}

// ══════════════════════════════════════════════════════════════════════════════
// DEVICE TRACKER HOOK
// ══════════════════════════════════════════════════════════════════════════════

function useDeviceCarbonTracker(userEmail) {
  const saved = loadDailyStats();
  const [carbon, setCarbon]           = useState(saved?.carbon || 0);
  const [batteryUsed, setBatteryUsed] = useState(saved?.batteryUsed || 0);
  const [distance, setDistance]       = useState(saved?.distance || 0);
  const [speed, setSpeed]             = useState(0);
  const [location, setLocation]       = useState(null);
  const [screenTime, setScreenTime]   = useState(saved?.screenTime || 0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionState, setPermissionState]   = useState("prompt");
  const [isTracking, setIsTracking]   = useState(false);
  const [supported] = useState({
    geolocation: "geolocation" in navigator,
    battery: "getBattery" in navigator,
    wakeLock: "wakeLock" in navigator,
    permissions: "permissions" in navigator,
  });

  const wakeLockRef    = useRef(null);
  const watchIdRef     = useRef(null);
  const batteryRef     = useRef(null);
  const initialBatRef  = useRef(null);
  const carbonRef      = useRef(carbon);
  const distanceRef    = useRef(distance);
  const screenTimeRef  = useRef(screenTime);
  const battUsedRef    = useRef(batteryUsed);

  useEffect(() => { carbonRef.current     = carbon;      }, [carbon]);
  useEffect(() => { distanceRef.current   = distance;    }, [distance]);
  useEffect(() => { screenTimeRef.current = screenTime;  }, [screenTime]);
  useEffect(() => { battUsedRef.current   = batteryUsed; }, [batteryUsed]);

  // ── Persist every 10 s ──
  useEffect(() => {
    const interval = setInterval(() => {
      saveDailyStats({
        carbon: carbonRef.current,
        batteryUsed: battUsedRef.current,
        distance: distanceRef.current,
        screenTime: screenTimeRef.current,
        lastSaved: Date.now(),
      });
      // Hourly snapshot at HH:00
      const now = new Date();
      if (now.getMinutes() === 0 && now.getSeconds() < 12) {
        const history = loadHourlyHistory();
        const label = `${now.getHours()}:00`;
        if (!history.find(h => h.hour === label)) {
          history.push({ hour: label, carbon: carbonRef.current, distance: distanceRef.current });
          saveHourlyHistory(history);
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Screen time — only while visible ──
  useEffect(() => {
    let interval;
    const start = () => { interval = setInterval(() => setScreenTime(p => p + 1), 1000); };
    const stop  = () => clearInterval(interval);
    start();
    const handler = () => document.hidden ? stop() : start();
    document.addEventListener("visibilitychange", handler);
    return () => { stop(); document.removeEventListener("visibilitychange", handler); };
  }, []);

  // ── Check permission state ──
  useEffect(() => {
    if (!supported.permissions) return;
    navigator.permissions.query({ name: "geolocation" }).then(result => {
      setPermissionState(result.state);
      result.onchange = () => setPermissionState(result.state);
    }).catch(() => {});
  }, [supported.permissions]);

  // ── Wake lock ──
  const acquireWakeLock = useCallback(async () => {
    if (!supported.wakeLock) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      wakeLockRef.current.addEventListener("release", () => {
        setTimeout(acquireWakeLock, 2000);
      });
    } catch {}
  }, [supported.wakeLock]);

  // ── Start tracking ──
  const startTracking = useCallback(() => {
    if (!userEmail || watchIdRef.current) return;
    setIsTracking(true);
    acquireWakeLock();

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, speed: spd } = pos.coords;
          setLocation({ latitude, longitude });
          setSpeed((spd || 0) * 3.6);
          setDistance(p => p + 0.005);
          setCarbon(p => p + 0.005 * 0.0002);
          setPermissionDenied(false);
          setPermissionState("granted");
        },
        () => {
          setPermissionDenied(true);
          setPermissionState("denied");
          setIsTracking(false);
          watchIdRef.current = null;
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    if ("getBattery" in navigator) {
      navigator.getBattery().then(bat => {
        batteryRef.current  = bat;
        initialBatRef.current = bat.level;
        bat.addEventListener("levelchange", () => {
          const used = (initialBatRef.current - bat.level) * 100;
          setBatteryUsed(used > 0 ? used : 0);
        });
      });
    }
  }, [userEmail, acquireWakeLock]);

  // ── Stop tracking ──
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {});
  }, []);

  // ── Auto-start if already granted ──
  useEffect(() => {
    if (userEmail && permissionState === "granted" && !isTracking) startTracking();
  }, [userEmail, permissionState]);

  // ── Re-acquire wake lock on tab focus ──
  useEffect(() => {
    const handler = () => { if (!document.hidden && isTracking) acquireWakeLock(); };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [isTracking, acquireWakeLock]);

  return {
    carbon, batteryUsed, distance, speed, location, screenTime,
    permissionDenied, permissionState, isTracking, supported,
    startTracking, stopTracking,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function formatTime(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function getRank(carbon) { return [...RANK_TIERS].reverse().find(r => carbon >= r.min) || RANK_TIERS[0]; }

function getEcoEquivalent(carbon) { return [...ECO_EQUIVALENTS].reverse().find(e => carbon >= e.threshold) || ECO_EQUIVALENTS[0]; }

function getXP(carbon) { return Math.floor(carbon * 10000); }

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Still up?";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function Particles({ trigger }) {
  const [ps, setPs] = useState([]);
  useEffect(() => {
    if (!trigger) return;
    setPs(Array.from({length:32},(_,i)=>({
      id:i, x:30+Math.random()*40, y:20+Math.random()*60,
      dx:(Math.random()-0.5)*240, dy:-(60+Math.random()*180),
      color:["#22c55e","#86efac","#fbbf24","#60a5fa","#f0abfc","#fdba74"][i%6],
      size:4+Math.random()*7,
    })));
    setTimeout(()=>setPs([]),1600);
  },[trigger]);
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {ps.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:`${p.x}%`,top:`${p.y}%`,
          width:p.size,height:p.size,borderRadius:"50%",
          background:p.color,boxShadow:`0 0 ${p.size*2}px ${p.color}`,
          animation:"particlePop 1.6s cubic-bezier(.1,0,.6,1) forwards",
          "--dx":`${p.dx}px`,"--dy":`${p.dy}px`,
        }}/>
      ))}
    </div>
  );
}

function QuoteCard() {
  const [idx,setIdx] = useState(()=>Math.floor(Math.random()*MOTIVATIONAL_QUOTES.length));
  const [fade,setFade] = useState(true);
  const rotate = () => { setFade(false); setTimeout(()=>{ setIdx(i=>(i+1)%MOTIVATIONAL_QUOTES.length); setFade(true); },300); };
  useEffect(()=>{ const t=setInterval(rotate,12000); return()=>clearInterval(t); },[]);
  const q = MOTIVATIONAL_QUOTES[idx];
  return (
    <div style={{
      background:"linear-gradient(135deg,rgba(34,197,94,0.05),rgba(16,185,129,0.03))",
      border:"1px solid rgba(34,197,94,0.12)",borderRadius:18,
      padding:"22px 26px",position:"relative",overflow:"hidden",cursor:"pointer",
    }} onClick={rotate}>
      <div style={{position:"absolute",top:-16,right:4,fontSize:90,opacity:0.04,fontFamily:"Georgia,serif",lineHeight:1,userSelect:"none"}}>"</div>
      <div style={{color:"rgba(255,255,255,0.72)",fontSize:13,lineHeight:1.8,fontStyle:"italic",marginBottom:12,opacity:fade?1:0,transition:"opacity 0.3s"}}>
        "{q.text}"
      </div>
      <div style={{color:"#4ade80",fontSize:11,fontWeight:600,fontFamily:"'Space Mono',monospace",opacity:fade?1:0,transition:"opacity 0.3s"}}>
        — {q.author}
      </div>
      <div style={{position:"absolute",bottom:12,right:16,color:"rgba(255,255,255,0.14)",fontSize:10,fontFamily:"'Space Mono',monospace"}}>tap ↻</div>
    </div>
  );
}

function XPRing({ xp, rank }) {
  const max=500, pct=Math.min(xp%max,max)/max;
  const r=62, cx=80, cy=80, circ=2*Math.PI*r;
  return (
    <div style={{position:"relative",width:160,height:160}}>
      <svg width="160" height="160" style={{position:"absolute",inset:0}}>
        <defs>
          <linearGradient id="xpG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={rank.color}/>
            <stop offset="100%" stopColor="#86efac"/>
          </linearGradient>
          <filter id="xpGl">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
        {Array.from({length:36},(_,i)=>{
          const a=(i/36*360-90)*Math.PI/180,r1=r+6,r2=r+(i%9===0?14:9);
          return <line key={i} x1={cx+r1*Math.cos(a)} y1={cy+r1*Math.sin(a)} x2={cx+r2*Math.cos(a)} y2={cy+r2*Math.sin(a)} stroke={`rgba(255,255,255,${i%9===0?0.14:0.05})`} strokeWidth={i%9===0?2:1}/>;
        })}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#xpG)" strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
          filter="url(#xpGl)"
          style={{transform:`rotate(-90deg)`,transformOrigin:`${cx}px ${cy}px`,transition:"stroke-dashoffset 1.2s cubic-bezier(.4,2,.6,1)"}}
        />
        {pct>0.03&&(()=>{
          const a=(pct*360-90)*Math.PI/180;
          return <circle cx={cx+r*Math.cos(a)} cy={cy+r*Math.sin(a)} r={5} fill={rank.color} filter="url(#xpGl)"/>;
        })()}
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`radial-gradient(circle,${rank.color}0a 0%,transparent 70%)`}}>
        <span style={{fontSize:26,lineHeight:1}}>{rank.icon}</span>
        <span style={{color:"#fff",fontWeight:900,fontSize:12,marginTop:4}}>{xp.toLocaleString()}</span>
        <span style={{color:"rgba(255,255,255,0.3)",fontSize:8,letterSpacing:2,fontFamily:"'Space Mono',monospace"}}>XP</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit, glow, pulse, delay=0 }) {
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),delay);},[delay]);
  return (
    <div style={{
      background:"linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
      border:`1px solid ${glow?glow+"2a":"rgba(255,255,255,0.07)"}`,
      borderRadius:16,padding:"18px 20px",
      boxShadow:glow?`0 4px 20px ${glow}10,inset 0 1px 0 rgba(255,255,255,0.04)`:"inset 0 1px 0 rgba(255,255,255,0.03)",
      opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(10px)",
      transition:"opacity 0.5s ease,transform 0.5s ease",
      position:"relative",overflow:"hidden",
    }}>
      {glow&&<div style={{position:"absolute",top:0,right:0,width:50,height:50,background:`radial-gradient(circle at top right,${glow}14,transparent 70%)`}}/>}
      {pulse&&<div style={{position:"absolute",top:12,right:12,width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e",animation:"pulseDot 2s infinite"}}/>}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <span style={{fontSize:14}}>{icon}</span>
        <span style={{color:"rgba(255,255,255,0.3)",fontSize:9,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Space Mono',monospace"}}>{label}</span>
      </div>
      <div style={{display:"flex",alignItems:"baseline",gap:4}}>
        <span style={{fontSize:22,fontWeight:800,color:"#fff",lineHeight:1,textShadow:glow?`0 0 16px ${glow}44`:"none"}}>{value}</span>
        <span style={{color:"rgba(255,255,255,0.22)",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{unit}</span>
      </div>
    </div>
  );
}

function MissionCard({ mission, data, index }) {
  const done = mission.check(data);
  const progress = (() => {
    if (mission.id==="walk1km")   return Math.min(data.distance/1*100,100);
    if (mission.id==="walk500m")  return Math.min(data.distance/0.5*100,100);
    if (mission.id==="track10m")  return Math.min(data.screenTime/600*100,100);
    if (mission.id==="screen5m")  return Math.min(data.screenTime/300*100,100);
    if (mission.id==="lowcarbon") return data.carbon>0&&data.carbon<0.1?100:0;
    return 0;
  })();
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),index*100+200);},[index]);
  return (
    <div style={{
      background:done?`${mission.color}0d`:"rgba(255,255,255,0.025)",
      border:`1px solid ${done?mission.color+"35":"rgba(255,255,255,0.06)"}`,
      borderRadius:14,padding:"16px 18px",
      opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(8px)",
      transition:"all 0.4s ease",position:"relative",overflow:"hidden",
    }}>
      {done&&<div style={{position:"absolute",top:10,right:12,fontSize:15}}>✅</div>}
      <div style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start",paddingRight:done?28:0}}>
        <span style={{fontSize:18}}>{mission.icon}</span>
        <div style={{flex:1}}>
          <div style={{color:done?"#fff":"rgba(255,255,255,0.7)",fontSize:12,fontWeight:600,lineHeight:1.3}}>{mission.label}</div>
          <div style={{color:mission.color,fontSize:10,marginTop:2,fontFamily:"'Space Mono',monospace"}}>+{mission.reward} XP</div>
        </div>
      </div>
      <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${progress}%`,borderRadius:99,background:done?`linear-gradient(90deg,${mission.color},${mission.color}cc)`:`${mission.color}66`,boxShadow:done?`0 0 6px ${mission.color}66`:"none",transition:"width 1s ease"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:5}}>
        <span style={{color:done?mission.color:"rgba(255,255,255,0.18)",fontSize:9,fontFamily:"'Space Mono',monospace"}}>{progress.toFixed(0)}%</span>
      </div>
    </div>
  );
}

function HourlyChart({ history, currentCarbon }) {
  const now = new Date().getHours();
  const dataMap = {};
  history.forEach(h=>{ dataMap[h.hour]=h.carbon; });
  const visibleHours = Array.from({length:now+1},(_,i)=>`${i}:00`);
  const maxVal = Math.max(...visibleHours.map(h=>dataMap[h]||0), currentCarbon, 0.0001);
  const chartH = 80;
  if (visibleHours.length < 2) return (
    <div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:11,padding:"20px 0",fontFamily:"'Space Mono',monospace"}}>
      Hourly data will appear as the day progresses
    </div>
  );
  const pts = visibleHours.map((h,i)=>{
    const val = i===visibleHours.length-1 ? currentCarbon : (dataMap[h]||0);
    return { x:(i/(visibleHours.length-1))*100, y:chartH-(val/maxVal)*chartH };
  });
  const line = pts.map((p,i)=>`${i===0?"M":"L"}${p.x}%,${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length-1].x}%,${chartH} L0,${chartH} Z`;
  return (
    <div>
      <div style={{position:"relative",height:chartH+24}}>
        <svg width="100%" height={chartH+24} style={{overflow:"visible"}}>
          <defs>
            <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.28"/>
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={area} fill="url(#chartFill)"/>
          <path d={line} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx={`${pts[pts.length-1].x}%`} cy={pts[pts.length-1].y} r="5" fill="#22c55e" style={{filter:"drop-shadow(0 0 5px #22c55e)"}}/>
          <line x1="0" y1={chartH} x2="100%" y2={chartH} stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
        </svg>
        <div style={{display:"flex",justifyContent:"space-between",position:"absolute",bottom:0,left:0,right:0}}>
          {[0,Math.floor(now/2),now].filter((v,i,a)=>a.indexOf(v)===i).map(h=>(
            <span key={h} style={{color:h===now?"#4ade80":"rgba(255,255,255,0.2)",fontSize:9,fontFamily:"'Space Mono',monospace"}}>{h}:00</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeekChart({ history }) {
  if (!history.length) return (
    <div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:11,padding:"28px 0",fontFamily:"'Space Mono',monospace"}}>
      Keep tracking to see your weekly trends 📈
    </div>
  );
  const maxVal = Math.max(...history.map(d=>d.carbon||0),0.001);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:8,height:72}}>
      {history.map((d,i)=>{
        const h = Math.max(((d.carbon||0)/maxVal)*60,2);
        const isToday = d.date===todayKey();
        const label = isToday ? "Today" : new Date(d.date+"T12:00:00").toLocaleDateString("en",{weekday:"short"});
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
            <div style={{
              width:"100%",height:h,borderRadius:"5px 5px 0 0",
              background:isToday?"linear-gradient(180deg,#22c55e,#16a34a)":"rgba(34,197,94,0.18)",
              border:isToday?"1px solid rgba(34,197,94,0.5)":"1px solid rgba(34,197,94,0.1)",
              boxShadow:isToday?"0 0 10px rgba(34,197,94,0.3)":"none",
              transition:"height 0.8s ease",
            }}/>
            <span style={{color:isToday?"#4ade80":"rgba(255,255,255,0.25)",fontSize:8,fontFamily:"'Space Mono',monospace",textAlign:"center"}}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PermissionGate({ onGrant, supported }) {
  const [requesting,setRequesting]=useState(false);
  const [error,setError]=useState(false);
  const handleRequest = async () => {
    setRequesting(true); setError(false);
    try {
      await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:10000}));
      onGrant();
    } catch { setRequesting(false); setError(true); }
  };
  return (
    <div style={{
      background:"linear-gradient(135deg,rgba(34,197,94,0.07),rgba(16,185,129,0.03))",
      border:"1px solid rgba(34,197,94,0.2)",borderRadius:20,
      padding:"32px 28px",marginBottom:24,textAlign:"center",
      animation:"fadeUp 0.5s ease",
    }}>
      <div style={{fontSize:40,marginBottom:14}}>🌍</div>
      <div style={{color:"#86efac",fontWeight:800,fontSize:18,marginBottom:8}}>Enable Live Tracking</div>
      <div style={{color:"rgba(255,255,255,0.5)",fontSize:13,lineHeight:1.8,marginBottom:24,maxWidth:420,margin:"0 auto 24px"}}>
        Grant location access to track movement, carbon footprint, speed, and earn XP in real-time.
        Your data stays <strong style={{color:"#4ade80"}}>100% on your device</strong>.
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap",marginBottom:20}}>
        {[
          {icon:"🌱",text:"Track CO₂ footprint"},
          {icon:"📍",text:"Monitor movement"},
          {icon:"🏆",text:"Earn XP & badges"},
          {icon:"🔒",text:"Private & local"},
        ].map((f,i)=>(
          <div key={i} style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.15)",borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",gap:7,fontSize:12,color:"rgba(255,255,255,0.7)"}}>
            <span>{f.icon}</span>{f.text}
          </div>
        ))}
      </div>
      <button onClick={handleRequest} disabled={requesting} style={{
        background:requesting?"rgba(34,197,94,0.15)":"linear-gradient(135deg,#16a34a,#15803d)",
        border:"1px solid rgba(34,197,94,0.5)",color:"#fff",
        borderRadius:14,padding:"14px 40px",fontSize:14,fontWeight:700,
        cursor:requesting?"default":"pointer",
        letterSpacing:0.5,transition:"all 0.2s",
        boxShadow:requesting?"none":"0 4px 24px rgba(34,197,94,0.3)",
      }}>
        {requesting?"⏳ Requesting permission…":"🌿 Start Tracking Now"}
      </button>
      {error&&<div style={{color:"#f87171",fontSize:11,marginTop:12,fontFamily:"'Space Mono',monospace"}}>Permission denied. Please allow location in browser settings.</div>}
      {!supported.battery&&<div style={{color:"rgba(251,146,60,0.6)",fontSize:10,marginTop:10,fontFamily:"'Space Mono',monospace"}}>⚠ Battery API unavailable in this browser</div>}
    </div>
  );
}

function TrackingBadge({ isTracking, onStop, onStart }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:isTracking?"#22c55e":"#f87171",boxShadow:isTracking?"0 0 8px #22c55e":"0 0 6px #f87171",animation:isTracking?"pulseDot 2s infinite":"none"}}/>
      <span style={{color:isTracking?"#4ade80":"rgba(255,255,255,0.3)",fontSize:9,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>{isTracking?"LIVE":"PAUSED"}</span>
      {isTracking
        ? <button onClick={onStop} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#f87171",borderRadius:7,padding:"4px 11px",fontSize:10,cursor:"pointer",fontFamily:"'Space Mono',monospace"}}>⏸</button>
        : <button onClick={onStart} style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",color:"#4ade80",borderRadius:7,padding:"4px 11px",fontSize:10,cursor:"pointer",fontFamily:"'Space Mono',monospace"}}>▶</button>
      }
    </div>
  );
}

function DailySnapshot({ stats, time }) {
  if (!stats) return null;
  return (
    <div style={{background:"linear-gradient(135deg,rgba(251,146,60,0.06),rgba(234,88,12,0.03))",border:"1px solid rgba(251,146,60,0.18)",borderRadius:18,padding:"20px 24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <span style={{fontSize:15}}>📊</span>
        <span style={{color:"rgba(255,255,255,0.85)",fontSize:13,fontWeight:700}}>Today's Summary</span>
        <span style={{marginLeft:"auto",color:"rgba(255,255,255,0.25)",fontSize:10,fontFamily:"'Space Mono',monospace"}}>last saved {time}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {icon:"🌱",label:"CARBON",  value:`${(stats.carbon||0).toFixed(4)} kg`,  color:"#22c55e"},
          {icon:"📍",label:"DISTANCE",value:`${(stats.distance||0).toFixed(2)} km`, color:"#3b82f6"},
          {icon:"⏱",label:"ACTIVE",  value:formatTime(stats.screenTime||0),        color:"#f59e0b"},
          {icon:"🔋",label:"BATTERY", value:`${(stats.batteryUsed||0).toFixed(1)}%`,color:"#a855f7"},
        ].map((it,i)=>(
          <div key={i} style={{textAlign:"center",background:`${it.color}0a`,border:`1px solid ${it.color}18`,borderRadius:12,padding:"14px 8px"}}>
            <div style={{fontSize:22,marginBottom:6}}>{it.icon}</div>
            <div style={{color:it.color,fontWeight:800,fontSize:16}}>{it.value}</div>
            <div style={{color:"rgba(255,255,255,0.28)",fontSize:8,letterSpacing:2,fontFamily:"'Space Mono',monospace",marginTop:4}}>{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

export default function Dashboard({ userEmail: emailProp = null, onLogout }) {
  const storedEmail = emailProp || localStorage.getItem("userEmail");
  const rawName = storedEmail ? storedEmail.split("@")[0] : "Traveler";
  const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const [streak, setStreak]       = useState(() => loadStreak());
  const [lvlTrigger, setLvlTrig]  = useState(0);
  const [lvlBanner, setLvlBanner] = useState(false);
  const [lvlTitle, setLvlTitle]   = useState("");
  const [hourlyHistory, setHH]    = useState(() => loadHourlyHistory());
  const [weekHistory, setWH]      = useState(() => loadAllDailyHistory());
  const [snapTime, setSnapTime]   = useState(() => {
    const d = loadDailyStats();
    return d?.lastSaved ? new Date(d.lastSaved).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"}) : "--:--";
  });
  const [activeTab, setActiveTab] = useState("live");
  const prevRankRef = useRef(null);

  const {
    carbon, batteryUsed, distance, speed, location, screenTime,
    permissionDenied, permissionState, isTracking, supported,
    startTracking, stopTracking,
  } = useDeviceCarbonTracker(storedEmail);

  const rank   = getRank(carbon);
  const xp     = getXP(carbon);
  const equiv  = getEcoEquivalent(carbon);
  const liveData = { carbon, distance, screenTime, speed };
  const doneMissions = DAILY_GOALS.filter(m => m.check(liveData)).length;

  // Level-up detection
  useEffect(() => {
    if (prevRankRef.current && prevRankRef.current !== rank.title) {
      setLvlTrig(t => t+1);
      setLvlTitle(rank.title);
      setLvlBanner(true);
      setTimeout(() => setLvlBanner(false), 4000);
      const s = loadStreak() + 1;
      setStreak(s);
      saveStreak(s);
    }
    prevRankRef.current = rank.title;
  }, [rank.title]);

  // Refresh history every minute
  useEffect(() => {
    const t = setInterval(() => {
      setHH(loadHourlyHistory());
      setWH(loadAllDailyHistory());
      const d = loadDailyStats();
      if (d?.lastSaved) setSnapTime(new Date(d.lastSaved).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"}));
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    if (onLogout) { onLogout(); return; }
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:#050b07;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(34,197,94,0.2);border-radius:99px;}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(1.8);}}
        @keyframes particlePop{0%{transform:translate(0,0)scale(1);opacity:1;}100%{transform:translate(var(--dx,0),var(--dy,0))scale(0);opacity:0;}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translate(-50%,-20px);}to{opacity:1;transform:translate(-50%,0);}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 16px rgba(34,197,94,0.15);}50%{box-shadow:0 0 36px rgba(34,197,94,0.4);}}
        @keyframes streakBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-2px);}}
        @keyframes scanDown{from{transform:translateY(-100%);}to{transform:translateY(100vh);}}
        .tab-btn:hover{background:rgba(255,255,255,0.05)!important;}
        .logout-btn:hover{background:rgba(239,68,68,0.12)!important;border-color:rgba(239,68,68,0.4)!important;color:#f87171!important;}
      `}</style>

      <Particles trigger={lvlTrigger} />

      {lvlBanner && (
        <div style={{position:"fixed",top:76,left:"50%",zIndex:9998,background:"linear-gradient(135deg,#052e16,#14532d)",border:"1px solid rgba(34,197,94,0.7)",borderRadius:16,padding:"14px 36px",textAlign:"center",boxShadow:"0 0 48px rgba(34,197,94,0.35),0 8px 32px rgba(0,0,0,0.6)",animation:"fadeSlideDown 0.4s ease"}}>
          <div style={{color:"#4ade80",fontWeight:800,fontSize:17}}>🎉 RANK UP — You're now a {lvlTitle}!</div>
          <div style={{color:"rgba(134,239,172,0.5)",fontSize:10,marginTop:4,fontFamily:"'Space Mono',monospace"}}>{xp.toLocaleString()} TOTAL XP EARNED</div>
        </div>
      )}

      {/* Scan line */}
      <div style={{position:"fixed",left:0,right:0,height:2,zIndex:1,pointerEvents:"none",background:"linear-gradient(90deg,transparent,rgba(34,197,94,0.06),transparent)",animation:"scanDown 8s linear infinite"}}/>

      {/* BG glows */}
      <div style={{position:"fixed",top:"5%",left:"20%",width:800,height:800,borderRadius:"50%",pointerEvents:"none",zIndex:0,background:"radial-gradient(circle,rgba(34,197,94,0.04) 0%,transparent 60%)",filter:"blur(60px)"}}/>
      <div style={{position:"fixed",bottom:"10%",right:"15%",width:500,height:500,borderRadius:"50%",pointerEvents:"none",zIndex:0,background:"radial-gradient(circle,rgba(59,130,246,0.03) 0%,transparent 65%)",filter:"blur(40px)"}}/>

      {/* Grid */}
      <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,opacity:0.028}} preserveAspectRatio="none">
        {Array.from({length:14},(_,i)=><line key={`v${i}`} x1={`${(i+1)*6.67}%`} y1="0" x2={`${(i+1)*6.67}%`} y2="100%" stroke="#22c55e" strokeWidth="0.5"/>)}
        {Array.from({length:10},(_,i)=><line key={`h${i}`} x1="0" y1={`${(i+1)*9.09}%`} x2="100%" y2={`${(i+1)*9.09}%`} stroke="#22c55e" strokeWidth="0.5"/>)}
      </svg>

      <div style={{minHeight:"100vh",color:"#fff",fontFamily:"'Space Grotesk',sans-serif",position:"relative",zIndex:2}}>
        <div style={{maxWidth:1140,margin:"0 auto",padding:"0 24px 64px"}}>

          {/* ══ HEADER ══ */}
          <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0 22px",borderBottom:"1px solid rgba(255,255,255,0.05)",marginBottom:26}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#052e16,#14532d)",border:"1px solid rgba(34,197,94,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,animation:"glowPulse 3s infinite"}}>🌿</div>
              <div>
                <h1 style={{fontWeight:800,fontSize:19,color:"#fff",letterSpacing:-0.5}}>ECO JOURNEY</h1>
                <div style={{color:"rgba(34,197,94,0.45)",fontSize:8,letterSpacing:3.5,fontFamily:"'Space Mono',monospace"}}>CARBON TRACKER RPG</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {/* Streak */}
              <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.22)",borderRadius:12,padding:"7px 14px",animation:"streakBob 3s ease infinite"}}>
                <span style={{fontSize:18}}>🔥</span>
                <div>
                  <div style={{color:"#fb923c",fontWeight:800,fontSize:17,lineHeight:1}}>{streak}</div>
                  <div style={{color:"rgba(255,255,255,0.3)",fontSize:7,letterSpacing:2,fontFamily:"'Space Mono',monospace"}}>DAY STREAK</div>
                </div>
              </div>
              <TrackingBadge isTracking={isTracking} onStop={stopTracking} onStart={startTracking} />
              <div style={{width:1,height:30,background:"rgba(255,255,255,0.07)"}}/>
              <div style={{textAlign:"right"}}>
                <div style={{color:"#86efac",fontWeight:700,fontSize:13}}>{userName}</div>
                <div style={{color:rank.color,fontSize:9,letterSpacing:1.5,fontFamily:"'Space Mono',monospace"}}>{rank.icon} {rank.title.toUpperCase()}</div>
              </div>
              <button onClick={handleLogout} className="logout-btn" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.35)",borderRadius:10,padding:"8px 16px",fontSize:10,cursor:"pointer",fontFamily:"'Space Mono',monospace",letterSpacing:1,transition:"all 0.25s"}}>LOG OUT</button>
            </div>
          </header>

          {/* ══ GREETING + QUOTE ══ */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr",gap:16,marginBottom:22,animation:"fadeUp 0.5s ease"}}>
            <div style={{background:"linear-gradient(135deg,rgba(34,197,94,0.08),rgba(16,185,129,0.04))",border:"1px solid rgba(34,197,94,0.14)",borderRadius:18,padding:"22px 24px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
              <div>
                <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,fontFamily:"'Space Mono',monospace",letterSpacing:2,marginBottom:4}}>{getGreeting().toUpperCase()}</div>
                <div style={{color:"#fff",fontWeight:800,fontSize:24}}>Hi, {userName} 👋</div>
              </div>
              <div style={{marginTop:16}}>
                <div style={{display:"flex",alignItems:"center",gap:10,background:`${rank.color}12`,border:`1px solid ${rank.color}25`,borderRadius:12,padding:"10px 14px",marginBottom:10}}>
                  <span style={{fontSize:24}}>{rank.icon}</span>
                  <div>
                    <div style={{color:rank.color,fontWeight:700,fontSize:14}}>{rank.title}</div>
                    <div style={{color:"rgba(255,255,255,0.3)",fontSize:9,fontFamily:"'Space Mono',monospace"}}>CURRENT RANK</div>
                  </div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <div style={{color:"#fff",fontWeight:800,fontSize:16}}>{xp.toLocaleString()}</div>
                    <div style={{color:"rgba(255,255,255,0.25)",fontSize:9,fontFamily:"'Space Mono',monospace"}}>TOTAL XP</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"8px 12px"}}>
                  <span style={{fontSize:15}}>{equiv.icon}</span>
                  <span style={{color:"rgba(255,255,255,0.45)",fontSize:11,lineHeight:1.5}}>Your carbon today {equiv.text}</span>
                </div>
              </div>
            </div>
            <QuoteCard />
          </div>

          {/* ══ PERMISSION / DENIED ══ */}
          {permissionState === "prompt" && !isTracking && (
            <PermissionGate onGrant={startTracking} supported={supported} />
          )}
          {permissionDenied && (
            <div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:14,padding:"14px 18px",marginBottom:20,color:"#f87171",fontSize:12,fontFamily:"'Space Mono',monospace"}}>
              <span>⚠</span>
              <span>Location denied. Go to browser settings → Site permissions → Location → Allow for this site.</span>
            </div>
          )}

          {/* ══ HERO ROW ══ */}
          <div style={{display:"grid",gridTemplateColumns:"196px 1fr",gap:20,marginBottom:20}}>
            {/* XP Panel */}
            <div style={{background:"linear-gradient(160deg,rgba(34,197,94,0.07),rgba(255,255,255,0.025))",border:`1px solid ${rank.color}20`,borderRadius:22,padding:"28px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:20,boxShadow:`0 0 40px ${rank.color}06`}}>
              <XPRing xp={xp} rank={rank} />
              {/* Next rank progress */}
              {(() => {
                const next = RANK_TIERS.find(r => r.min > carbon);
                if (!next) return <div style={{color:"rgba(255,255,255,0.25)",fontSize:10,textAlign:"center",fontFamily:"'Space Mono',monospace"}}>MAX RANK 🌍</div>;
                const pct = Math.min((carbon/next.min)*100,100);
                return (
                  <div style={{width:"100%"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{color:"rgba(255,255,255,0.3)",fontSize:9,fontFamily:"'Space Mono',monospace",letterSpacing:1.5}}>NEXT RANK</span>
                      <span style={{color:next.color,fontSize:10,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{pct.toFixed(1)}%</span>
                    </div>
                    <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,borderRadius:99,background:`linear-gradient(90deg,${next.color},${next.color}cc)`,boxShadow:`0 0 6px ${next.color}55`,transition:"width 1s ease"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                      <span style={{color:rank.color,fontSize:8,fontFamily:"'Space Mono',monospace"}}>{rank.icon} {rank.title}</span>
                      <span style={{color:next.color,fontSize:8,fontFamily:"'Space Mono',monospace"}}>{next.icon} {next.title}</span>
                    </div>
                  </div>
                );
              })()}
              <div style={{width:"100%",borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:16}}>
                <div style={{color:"rgba(255,255,255,0.2)",fontSize:8,letterSpacing:3,fontFamily:"'Space Mono',monospace",textAlign:"center",marginBottom:10}}>MISSIONS TODAY</div>
                <div style={{textAlign:"center"}}>
                  <span style={{color:"#fff",fontWeight:800,fontSize:24}}>{doneMissions}</span>
                  <span style={{color:"rgba(255,255,255,0.25)",fontSize:14}}> / {DAILY_GOALS.length}</span>
                </div>
                <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:99,marginTop:8,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(doneMissions/DAILY_GOALS.length)*100}%`,borderRadius:99,background:"linear-gradient(90deg,#22c55e,#86efac)",transition:"width 0.8s ease"}}/>
                </div>
              </div>
            </div>

            {/* Live Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              <StatCard delay={50}  icon="🌱" label="Carbon"   value={carbon.toFixed(5)}                                          unit="kg CO₂"   glow="#22c55e" pulse />
              <StatCard delay={100} icon="⏱" label="Active"   value={formatTime(screenTime)}                                      unit="hh:mm:ss" glow="#3b82f6" />
              <StatCard delay={150} icon="🔋" label="Battery"  value={batteryUsed.toFixed(2)}                                     unit="% used"   glow="#f59e0b" />
              <StatCard delay={200} icon="📍" label="Distance" value={distance.toFixed(3)}                                        unit="km"       glow="#a855f7" />
              <StatCard delay={250} icon="⚡" label="Speed"    value={speed.toFixed(1)}                                            unit="km/h"     glow="#06b6d4" />
              <StatCard delay={300} icon="🗺" label="Location" value={location?`${location.latitude.toFixed(3)}°`:"—"} unit={location?`${location.longitude.toFixed(3)}°`:"waiting"} />
            </div>
          </div>

          {/* ══ TABS ══ */}
          <div style={{display:"flex",gap:4,marginBottom:16,background:"rgba(255,255,255,0.03)",borderRadius:12,padding:4,width:"fit-content"}}>
            {[
              {id:"live", label:"📡 Live"},
              {id:"daily",label:"📊 Today"},
              {id:"week", label:"📈 This Week"},
            ].map(t=>(
              <button key={t.id} className="tab-btn" onClick={()=>setActiveTab(t.id)} style={{
                background:activeTab===t.id?"rgba(34,197,94,0.15)":"transparent",
                border:`1px solid ${activeTab===t.id?"rgba(34,197,94,0.35)":"transparent"}`,
                color:activeTab===t.id?"#4ade80":"rgba(255,255,255,0.35)",
                borderRadius:9,padding:"8px 18px",fontSize:12,cursor:"pointer",fontWeight:600,
              }}>{t.label}</button>
            ))}
          </div>

          {/* ══ LIVE TAB ══ */}
          {activeTab==="live" && (
            <div style={{animation:"fadeUp 0.4s ease",display:"flex",flexDirection:"column",gap:18}}>
              {/* Hourly chart */}
              <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:"22px 26px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14}}>📡</span>
                    <span style={{color:"rgba(255,255,255,0.8)",fontWeight:700,fontSize:13}}>Carbon Today — Hourly Trend</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:8,padding:"4px 10px"}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",animation:"pulseDot 2s infinite"}}/>
                    <span style={{color:"#4ade80",fontSize:9,fontFamily:"'Space Mono',monospace"}}>LIVE</span>
                  </div>
                </div>
                <HourlyChart history={hourlyHistory} currentCarbon={carbon} />
                <div style={{display:"flex",justifyContent:"space-between",marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                  <div style={{color:"rgba(255,255,255,0.3)",fontSize:10,fontFamily:"'Space Mono',monospace"}}>
                    🔒 All data stored locally on your device
                  </div>
                  <div style={{color:"rgba(34,197,94,0.5)",fontSize:10,fontFamily:"'Space Mono',monospace"}}>
                    Auto-saved every 10s
                  </div>
                </div>
              </div>

              {/* Missions */}
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:"22px 26px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                  <span style={{fontSize:15}}>🏆</span>
                  <span style={{color:"rgba(255,255,255,0.85)",fontWeight:700,fontSize:13}}>Daily Missions</span>
                  <div style={{marginLeft:"auto",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:8,padding:"3px 10px"}}>
                    <span style={{color:"#4ade80",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{doneMissions}/{DAILY_GOALS.length} DONE</span>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {DAILY_GOALS.map((m,i)=><MissionCard key={m.id} mission={m} data={liveData} index={i}/>)}
                </div>
              </div>
            </div>
          )}

          {/* ══ TODAY TAB ══ */}
          {activeTab==="daily" && (
            <div style={{animation:"fadeUp 0.4s ease",display:"flex",flexDirection:"column",gap:16}}>
              <DailySnapshot stats={loadDailyStats()} time={snapTime} />

              {/* Eco impact */}
              <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:"22px 26px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
                  <span style={{fontSize:15}}>🌍</span>
                  <span style={{fontWeight:700,fontSize:13}}>Real-World Eco Impact</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                  {[
                    {icon:"🌳",title:"Tree equivalent",   value:`${(carbon*40).toFixed(3)}`,           unit:"trees/day",  desc:"Trees absorbing equivalent CO₂",  color:"#22c55e"},
                    {icon:"🚗",title:"Car equivalent",    value:`${(carbon/0.21*1000).toFixed(0)}`,     unit:"meters",     desc:"Same emissions as driving this far",color:"#f59e0b"},
                    {icon:"💡",title:"LED bulb time",     value:`${Math.round(carbon/0.00001)}`,        unit:"minutes",    desc:"Running a LED bulb for this long",  color:"#3b82f6"},
                  ].map((item,i)=>(
                    <div key={i} style={{background:`${item.color}09`,border:`1px solid ${item.color}20`,borderRadius:14,padding:"20px 16px",textAlign:"center"}}>
                      <div style={{fontSize:30,marginBottom:10}}>{item.icon}</div>
                      <div style={{color:item.color,fontWeight:800,fontSize:24}}>{item.value}</div>
                      <div style={{color:"rgba(255,255,255,0.45)",fontSize:10,fontFamily:"'Space Mono',monospace",margin:"4px 0 8px"}}>{item.unit}</div>
                      <div style={{color:"rgba(255,255,255,0.25)",fontSize:10,lineHeight:1.5}}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission progress today */}
              <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:"22px 26px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                  <span style={{fontSize:15}}>🎯</span>
                  <span style={{fontWeight:700,fontSize:13}}>Mission Progress</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {DAILY_GOALS.map((m,i)=><MissionCard key={m.id} mission={m} data={liveData} index={i}/>)}
                </div>
              </div>
            </div>
          )}

          {/* ══ WEEK TAB ══ */}
          {activeTab==="week" && (
            <div style={{animation:"fadeUp 0.4s ease",display:"flex",flexDirection:"column",gap:16}}>
              <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:"22px 26px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
                  <span style={{fontSize:15}}>📈</span>
                  <span style={{fontWeight:700,fontSize:13}}>7-Day Carbon History</span>
                </div>
                <WeekChart history={weekHistory} />
              </div>

              {weekHistory.length > 0 && (() => {
                const tot = weekHistory.reduce((s,d)=>s+(d.carbon||0),0);
                const totD= weekHistory.reduce((s,d)=>s+(d.distance||0),0);
                const totT= weekHistory.reduce((s,d)=>s+(d.screenTime||0),0);
                const avg = tot/weekHistory.length;
                return (
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                    {[
                      {icon:"🌱",label:"Total Carbon",  value:`${tot.toFixed(3)} kg`,      color:"#22c55e"},
                      {icon:"📍",label:"Total Distance",value:`${totD.toFixed(2)} km`,      color:"#3b82f6"},
                      {icon:"⏱",label:"Total Active",  value:formatTime(totT),              color:"#f59e0b"},
                      {icon:"📊",label:"Daily Avg CO₂", value:`${avg.toFixed(4)} kg`,       color:"#a855f7"},
                    ].map((s,i)=>(
                      <div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${s.color}20`,borderRadius:14,padding:"18px 16px",textAlign:"center"}}>
                        <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
                        <div style={{color:s.color,fontWeight:800,fontSize:17}}>{s.value}</div>
                        <div style={{color:"rgba(255,255,255,0.28)",fontSize:9,letterSpacing:1.5,fontFamily:"'Space Mono',monospace",marginTop:4}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Motivation card */}
              <div style={{background:"linear-gradient(135deg,rgba(251,191,36,0.08),rgba(245,158,11,0.04))",border:"1px solid rgba(251,191,36,0.2)",borderRadius:18,padding:"22px 26px",display:"flex",alignItems:"center",gap:18}}>
                <span style={{fontSize:36}}>🏅</span>
                <div>
                  <div style={{color:"#fbbf24",fontWeight:700,fontSize:16,marginBottom:6}}>Keep Your Streak Going!</div>
                  <div style={{color:"rgba(255,255,255,0.5)",fontSize:13,lineHeight:1.7}}>
                    You've been tracking for <strong style={{color:"#fb923c"}}>{streak} day{streak!==1?"s":""}</strong>.
                    {streak >= 7 ? " That's a whole week — you're building a powerful habit! 🌟" :
                     streak >= 3 ? " You're on a roll! Keep showing up every day. 💪" :
                     " Every day counts. Come back tomorrow to grow your streak! 🌱"}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
