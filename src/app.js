// ===== STATE & STORAGE =====
const BUILD = 'Version 2 · 14 Nov 2026';
const HOSTED_URL = 'https://adambyass.github.io/triad/';
const STORE_KEY = 'triad.v1';
const STRANDS = ['voice','theory','guitar','piano','songs'];
const STRAND_LABEL = {voice:'Voice & ear',theory:'Theory',guitar:'Guitar',piano:'Piano',songs:'Songs'};
const RATING = ['','Struggled','OK','Solid'];
const unitById = id => CURRICULUM.find(u=>u.id===id);
const unitIndex = id => CURRICULUM.findIndex(u=>u.id===id);

function defaultState(){ return {v:2, updated:0, placed:false, unit:'u1', levels:{guitar:1,piano:0,voice:0,theory:0},
  range:{low:45,high:64}, ratings:{}, completed:[], sessions:[], seenConcept:{}, session:null, bests:{}, metrics:[], settings:{headphones:false} }; }
var S = defaultState();
try { const raw = localStorage.getItem(STORE_KEY); if (raw) S = Object.assign(defaultState(), JSON.parse(raw)); } catch(e){}

let dbDoc = null, saveTimer = null, cloudOK = false;
function save(){
  S.updated = Date.now();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch(e){}
  clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>{ if(dbDoc){ try{ dbDoc.set({json:JSON.stringify(S), updated:S.updated}).catch(()=>{}); }catch(e){} } }, 800);
}
async function initCloud(){
  try{
    if(dbDoc || !window.claude || !window.claude.use) return;
    const [db,user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if(!db || !user) return;
    const id = await user.id(); if(!id) return;
    const ref = db.collection('data/users/'+id).doc('state');
    const snap = await Promise.race([ref.get(), new Promise((_,rej)=>setTimeout(()=>rej('timeout'),10000))]);
    let data = null;
    if (snap) { data = typeof snap.data==='function' ? snap.data() : (snap.exists===false ? null : (snap.data!==undefined ? snap.data : snap)); }
    dbDoc = ref; cloudOK = true;
    if (data && data.json && (data.updated||0) > (S.updated||0)) { S = Object.assign(defaultState(), JSON.parse(data.json)); try{localStorage.setItem(STORE_KEY, JSON.stringify(S));}catch(e){} render(); }
    else save();
  }catch(e){}
}
function rate(unitId, strand, r){ S.ratings[unitId] = S.ratings[unitId] || {}; (S.ratings[unitId][strand] = S.ratings[unitId][strand] || []).push(r); save(); }
function strandAvg(unitId, strand){ const a = (S.ratings[unitId]||{})[strand]||[]; if(!a.length) return null; const last = a.slice(-3); return last.reduce((x,y)=>x+y,0)/last.length; }
function unitReady(unitId){ return STRANDS.every(s=>{ const a=(S.ratings[unitId]||{})[s]||[]; return a.length>=2 && strandAvg(unitId,s)>=2.4; }); }
function logMetric(m){ S.metrics.push(Object.assign({d:Date.now()},m)); if(S.metrics.length>300) S.metrics=S.metrics.slice(-300); save(); }

// ===== HELPERS =====
const $ = (s,el=document)=>el.querySelector(s);
const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function h(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }
const fmtMin = m=>`${m} min`;
const cssVar = n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
let loopOwner=null, loopRAF=null;
function stopLoops(){ if(loopRAF) cancelAnimationFrame(loopRAF); loopRAF=null; const o=loopOwner; loopOwner=null; if(o && o.onStop) o.onStop(); }
function leave(){ stopLoops(); Sched.stopAll(); Drone.stop(); }

// ===== DIAGRAMS =====
function guitarSVG(name){
  const sh=GUITAR_SHAPES[name]; if(!sh) return '';
  const W=110,H=140,x0=18,y0=38,sw=15,fh=19, fretted=sh.filter(f=>f>0), maxF=Math.max(...sh,0);
  const base = maxF>5 ? Math.min(...fretted) : 1;
  let s=`<svg viewBox="0 0 ${W} ${H}" class="gsvg" role="img" aria-label="${esc(name)} guitar chord"><text x="${W/2}" y="14" text-anchor="middle" class="dname">${esc(name)}</text>`;
  if(base===1) s+=`<rect x="${x0}" y="${y0-3}" width="${sw*5}" height="3" fill="currentColor"/>`; else s+=`<text x="${x0+sw*5+5}" y="${y0+fh*0.7}" class="fret">${base}fr</text>`;
  for(let i=0;i<6;i++) s+=`<line x1="${x0+i*sw}" y1="${y0}" x2="${x0+i*sw}" y2="${y0+fh*5}" stroke="currentColor" stroke-width="1"/>`;
  for(let j=0;j<=5;j++) s+=`<line x1="${x0}" y1="${y0+j*fh}" x2="${x0+sw*5}" y2="${y0+j*fh}" stroke="currentColor" stroke-width="1" opacity=".6"/>`;
  // barre: lowest fret held on 2+ strings including the outermost fretted strings
  const minF=fretted.length?Math.min(...fretted):0, atMin=sh.map((f,i)=>f===minF?i:-1).filter(i=>i>=0);
  if(fretted.length>=5 && atMin.length>=2 && !sh.includes(0)){ const a=atMin[0], b=atMin[atMin.length-1]; s+=`<rect x="${x0+a*sw-6}" y="${y0+(minF-base+0.5)*fh-5}" width="${(b-a)*sw+12}" height="10" rx="5" class="dot"/>`; }
  sh.forEach((f,i)=>{ const x=x0+i*sw;
    if(f<0) s+=`<text x="${x}" y="${y0-7}" text-anchor="middle" class="xo">×</text>`;
    else if(f===0) s+=`<circle cx="${x}" cy="${y0-10}" r="3.6" fill="none" stroke="currentColor"/>`;
    else s+=`<circle cx="${x}" cy="${y0+(f-base+0.5)*fh}" r="6" class="dot"/>`; });
  return s+'</svg>';
}
const isBlackKey = m=>[1,3,6,8,10].includes(mod(m,12));
function keysSVG({from=48,to=71,on=[],pcs=null,labels=null,interactive=false}={}){
  const onSet=new Set(on), pcSet=pcs?new Set(pcs.map(n=>typeof n==='number'?mod(n,12):pcOf(n))):null;
  const isOn=m=>onSet.has(m)||(pcSet&&pcSet.has(mod(m,12)));
  while(isBlackKey(from)) from--; while(isBlackKey(to)) to++;
  const whites=[]; for(let m=from;m<=to;m++) if(!isBlackKey(m)) whites.push(m);
  const ww=22, H=86, W=whites.length*ww;
  const lab=m=>labels&&labels[m]!=null?String(labels[m]):(isOn(m)?SHARP[mod(m,12)]:'');
  let s=`<svg viewBox="0 0 ${W} ${H}" class="ksvg${interactive?' play':''}" role="img" aria-label="keyboard">`;
  whites.forEach((m,i)=>{ const x=i*ww, o=isOn(m), pc=mod(m,12);
    s+=`<rect x="${x}" y="0" width="${ww}" height="${H}" class="wk${o?' on':''}" data-m="${m}"/>`;
    const t=lab(m)||(pc===0?'C'+(Math.floor(m/12)-1):'');
    if(t) s+=`<text x="${x+ww/2}" y="${H-7}" text-anchor="middle" class="kl${o?' onl':''}">${t}</text>`; });
  for(let m=from;m<=to;m++){ if(!isBlackKey(m)) continue; const i=whites.filter(w=>w<m).length, x=i*ww-7, o=isOn(m);
    s+=`<rect x="${x}" y="0" width="14" height="${H*0.6}" class="bk${o?' on':''}" data-m="${m}"/>`;
    const t=lab(m); if(t) s+=`<text x="${x+7}" y="${H*0.6-6}" text-anchor="middle" class="kl onl sm">${t}</text>`; }
  return s+'</svg>';
}
function kbdDiagram(k){
  const lo=Math.min(...k.midis), hi=Math.max(...k.midis); const labels={};
  k.midis.forEach((m,i)=>{ labels[m]=k.fingers?k.fingers[i]:SHARP[mod(m,12)]; });
  return `<figure class="diag"><figcaption>${esc(k.label)}${k.fingers?' · numbers are fingers (1 = thumb)':''}</figcaption>${keysSVG({from:lo-mod(lo,12),to:hi+(11-mod(hi,12)),on:k.midis,labels})}<div class="cc-notes">${k.midis.map(m=>SHARP[mod(m,12)]).join(' · ')}</div></figure>`;
}
function fretboardSVG(fb){
  const OPEN=[40,45,50,55,59,64], NAMES=['E','A','D','G','B','e'];
  const names={}; fb.pcs.forEach(n=>names[pcOf(n)]=n); const rootPc=pcOf(fb.root);
  const strings=fb.strings||[0,1,2,3,4,5];
  const fw=44, sg=24, left=30, top=22, nf=fb.to-fb.from+1, W=left+nf*fw+10, H=top+5*sg+30;
  const y=si=>top+(5-si)*sg;
  let s=`<svg viewBox="0 0 ${W} ${H}" class="fsvg" role="img" aria-label="${esc(fb.label)}">`;
  for(let k=0;k<=nf;k++){ const nut=fb.from===0&&k===1; s+=`<line x1="${left+k*fw}" y1="${top}" x2="${left+k*fw}" y2="${top+5*sg}" stroke="currentColor" stroke-width="${nut?4:1}" opacity="${nut?1:.45}"/>`; }
  for(let si=0;si<6;si++){ s+=`<line x1="${left}" y1="${y(si)}" x2="${left+nf*fw}" y2="${y(si)}" stroke="currentColor" stroke-width="${1+(5-si)*0.25}" opacity="${strings.includes(si)?.8:.25}"/><text x="10" y="${y(si)+4}" text-anchor="middle" class="fl">${NAMES[si]}</text>`; }
  for(let f=fb.from;f<=fb.to;f++){ s+=`<text x="${left+(f-fb.from+0.5)*fw}" y="${H-8}" text-anchor="middle" class="fl">${f===0?'open':f}</text>`; }
  strings.forEach(si=>{ for(let f=fb.from;f<=fb.to;f++){ const pc=mod(OPEN[si]+f,12); if(names[pc]===undefined) continue; const x=left+(f-fb.from+0.5)*fw, r=pc===rootPc;
    s+=`<circle cx="${x}" cy="${y(si)}" r="10" class="${r?'fr':'fn'}"/><text x="${x}" y="${y(si)+3.5}" text-anchor="middle" class="ft${r?' r':''}">${names[pc]}</text>`; } });
  return `<figure class="diag"><figcaption>${esc(fb.label)} · filled dots are the root</figcaption>${s}</svg></figure>`;
}
function chordCard(name){
  const p=parseChord(name); const notes=p?chordNotes(p.root,p.q):[];
  return `<div class="chordcard"><div class="cc-top">${guitarSVG(name)}<button class="btn sm ghost" data-act="playchord" data-chord="${esc(name)}">► Hear</button></div>${keysSVG({pcs:notes})}<div class="cc-notes">${notes.join(' · ')}${p&&p.bass?` · bass ${p.bass}`:''}</div></div>`;
}
function wireChordButtons(root){ root.querySelectorAll('[data-act="playchord"]').forEach(b=>b.onclick=()=>{ ac(); playChordMidi(chordMidis(b.dataset.chord),1.8,0.07); }); }

// ===== MICROPHONE UI =====
function micErrorMsg(){
  const e=Mic.err||{}; const hosted=/github\.io$|^localhost$|^127\./.test(location.hostname);
  if(!hosted) return `<b>The microphone is blocked in this view.</b> Inside Claude it always is. Open the hosted copy in Safari for pitch checking: <a href="${HOSTED_URL}">${HOSTED_URL.replace('https://','')}</a>. Here, use <i>Got it</i> to self-check.`;
  if(e.name==='NotAllowedError'||e.name==='SecurityError') return `<b>Microphone permission is off for this site.</b> In Safari tap the button at the left of the address bar, choose Website Settings, set Microphone to Allow, then reload. If that is missing: Settings app, Apps, Safari, Microphone, set to Ask or Allow.`;
  if(e.name==='NotFoundError') return `<b>No microphone found.</b> If headphones or a Bluetooth device are connected, disconnect them and try again.`;
  if(e.name==='Unsupported') return `<b>This browser view cannot use the microphone.</b> Open ${HOSTED_URL.replace('https://','')} directly in Safari.`;
  return `<b>The microphone could not start</b> (${esc(e.name||'unknown error')}). Close other apps using the microphone, reload the page and try again.`;
}
const micRowHTML = `<div class="microw"><div class="lvl"><i data-r="lvl"></i></div><span data-r="mstat">Microphone off</span></div>`;
function micStatusText(st, hearing){
  if(!st.running) return 'Audio is paused: tap anywhere on the page';
  if(st.silent) return 'No signal from the microphone';
  if(st.deaf) return 'App is playing: listen';
  return hearing || 'Listening…';
}

// ===== PITCH TRAINER =====
function buildTargets(spec){
  const {low,high}=S.range; const mid=(low+high)/2, span=high-low;
  const dedupe = a=>a.filter((x,i)=>i===0||x!==a[i-1]);
  const rint=(a,b)=>a+Math.floor(Math.random()*Math.max(1,b-a+1));
  if(spec.kind==='match'){ const out=[]; for(let i=0;i<(spec.count||8);i++){ let m; do{ m=rint(low+2,high-2); }while(out.length && m===out[out.length-1]); out.push(m);} return out.map(m=>({m})); }
  if(spec.kind==='hold'){ const out=[]; for(let i=0;i<(spec.count||3);i++){ let m; do{ m=rint(Math.round(low+span*0.3),Math.round(low+span*0.7)); }while(out.length && m===out[out.length-1]); out.push(m);} return out.map(m=>({m})); }
  if(spec.kind==='interval'){ const out=[]; const mx=Math.max(...spec.intervals); for(let i=0;i<(spec.count||8);i++){ const iv=rnd(spec.intervals); const root=rint(low+1,Math.max(low+1,high-mx-1)); out.push({root, m:root+iv, iv}); } return out; }
  if(spec.pcs) return dedupe(spec.pcs).map(n=>({pc:pcOf(n), name:n}));
  const src = spec.rel || spec.midi;
  const lo=Math.min(...src), hi=Math.max(...src);
  const shift = Math.round(mid-(lo+hi)/2);
  return dedupe(src.map(x=>x+shift)).map(m=>({m}));
}
function trainerLabel(spec){ return spec.label || (spec.kind==='match'?'Pitch matching':spec.kind==='range'?'Range finder':'Trainer'); }

function mountTrainer(el, spec, {instrument=false, unitId=null}={}){
  if(loopOwner && loopOwner.el===el) stopLoops();
  if(spec.kind==='range') return mountRange(el);
  const targets = buildTargets(spec);
  const isHold = spec.kind==='hold', isIv = spec.kind==='interval';
  const tol = instrument ? 0.45 : 0.4, holdMs = isHold ? spec.seconds*1000 : (instrument ? 220 : 420);
  const autoRef = !instrument && (spec.kind==='match' || isIv || isHold);
  let idx=0, hold=0, last=0, hits=0, skips=0, finished=false, cents=[], trace=[], helpShown=false;
  el.innerHTML = `<div class="trainer">
    <div class="tr-head"><div><div class="tr-label">${esc(trainerLabel(spec))}</div><div class="tr-sub" data-r="sub"></div></div>
      <div class="tr-actions"><button class="btn" data-r="listen">Listen</button><button class="btn ghost" data-r="ref">► ${isIv?'Play root':'Play note'}</button>${isIv?'<button class="btn ghost" data-r="ans">► Answer</button>':''}${(!instrument&&!autoRef)?'<button class="btn ghost" data-r="all">► Hear it all</button>':''}</div></div>
    ${micRowHTML}
    <div class="tr-target" data-r="target">–</div>
    <div class="meter"><div class="meter-zone"></div><div class="meter-needle" data-r="needle"></div><div class="meter-ticks"><span>flat</span><span>in tune</span><span>sharp</span></div></div>
    <div class="holdbar"><i data-r="hold"></i></div>
    <canvas class="trace" data-r="cv"></canvas>
    <div class="chips" data-r="chips">${targets.map((t,i)=>`<span class="chip" data-i="${i}">${t.name?esc(t.name):midiName(t.m).replace(/-?\d+$/,'')}</span>`).join('')}</div>
    <div class="tr-foot"><button class="btn ghost sm" data-r="skip">Skip</button><button class="btn ghost sm" data-r="self">Got it ✓ (self-check)</button><button class="btn ghost sm" data-r="restart">Restart</button></div>
    <div class="tr-msg" data-r="msg">Tap Listen, then ${instrument?'play':'sing'} the note${isHold?` and hold it for ${spec.seconds} seconds`:''}.</div></div>`;
  const R = k=>el.querySelector(`[data-r="${k}"]`);
  const cv=R('cv'), ctx=cv.getContext('2d'); const col={good:cssVar('--good')||'#2f7d4a', ink:cssVar('--ink')||'#222', band:cssVar('--goodbg')||'#e5f2e8', line:cssVar('--line')||'#ddd'};
  const targetLabel = t => isIv ? `${INTERVAL_NAMES[t.iv]} above ${midiName(t.root)}` : (t.name ? t.name : midiName(t.m));
  function playRef(){ const t=targets[idx]; if(!t) return; ac(); if(isIv) playNote(t.root,1.3); else if(t.pc!==undefined) playNote(60+t.pc,1.1); else playNote(t.m,1.1); }
  function show(){
    const t=targets[idx];
    el.querySelectorAll('.chip').forEach((c,i)=>{ c.classList.toggle('done',i<idx); c.classList.toggle('cur',i===idx); });
    if(!t){ finish(); return; }
    R('target').textContent = targetLabel(t);
    R('sub').textContent = `${idx+1} of ${targets.length}` + (instrument?' · any octave counts':'');
  }
  function finish(){
    finished=true; const avg=cents.length?Math.round(cents.reduce((a,b)=>a+b,0)/cents.length):null;
    R('target').textContent='Done'; R('sub').textContent=`${hits} matched · ${skips} skipped`;
    const ratio=hits/targets.length; let verdict='';
    if(avg!=null){ const r = ratio>=0.9&&avg<=20?3:ratio>=0.7&&avg<=32?2:1; verdict=` Suggested rating: ${RATING[r]}.`;
      logMetric({k:instrument?'inst':'voice', u:unitId, label:trainerLabel(spec), cents:avg, hits, total:targets.length}); }
    R('msg').textContent = avg!=null ? `Average error ${avg} cents while on the note (under 20 is good, over 35 is audibly off).${verdict}` : 'Self-checked: no pitch data recorded.';
    if(loopOwner===owner) stopLoops();
  }
  function advance(hit){ if(finished) return; if(hit) hits++; else skips++; idx++; hold=0; R('hold').style.width='0%'; show(); if(targets[idx] && autoRef && Mic.live()) setTimeout(playRef,450); }
  function drawTrace(now){
    const w=cv.clientWidth, hgt=cv.clientHeight, dpr=window.devicePixelRatio||1; if(!w) return;
    if(cv.width!==Math.round(w*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(hgt*dpr); }
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,hgt);
    const span=3, y=d=>hgt/2-(Math.max(-span,Math.min(span,d))/span)*(hgt/2-5);
    ctx.fillStyle=col.band; ctx.fillRect(0,y(tol),w,y(-tol)-y(tol));
    ctx.strokeStyle=col.line; ctx.lineWidth=1; [-2,-1,1,2].forEach(k=>{ ctx.beginPath(); ctx.moveTo(0,y(k)); ctx.lineTo(w,y(k)); ctx.stroke(); });
    const win=5000; while(trace.length && now-trace[0].t>win) trace.shift();
    for(const p of trace){ if(p.d==null) continue; ctx.fillStyle=Math.abs(p.d)<tol?col.good:col.ink; ctx.fillRect(w-(now-p.t)/win*w-1.5, y(p.d)-1.5, 3, 3); }
  }
  const owner={ el, onStop(){ const b=R('listen'); if(b){ b.disabled=false; b.textContent='Listen'; } const l=R('lvl'); if(l) l.style.width='0%'; const m=R('mstat'); if(m && !finished) m.textContent='Microphone paused'; } };
  function frame(){
    if(loopOwner!==owner) return;
    if(!el.isConnected){ stopLoops(); return; }
    const now=performance.now(), dt=Math.min(120, now-last); last=now;
    const st=Mic.read(); const t=targets[idx];
    if(!st || !st.live){ R('msg').textContent='The microphone stopped. Tap Listen to restart it.'; stopLoops(); return; }
    R('lvl').style.width=Math.round(st.level*100)+'%';
    R('mstat').textContent = micStatusText(st, st.midi!=null ? 'Hearing '+midiName(Math.round(st.midi)) : null);
    if(st.silent && !helpShown){ helpShown=true; R('msg').innerHTML='The microphone is connected but sending silence. <button class="btn sm" data-r="remic">Restart microphone</button>'; R('remic').onclick=async()=>{ Mic.stop(); helpShown=false; await startListening(); }; }
    let diff=null;
    if(t && st.midi!=null){
      diff = t.pc!==undefined ? mod(st.midi-t.pc+6,12)-6 : st.midi-t.m;
      const c=Math.max(-50,Math.min(50,diff*100)); const needle=R('needle'); needle.style.left=(50+c)+'%';
      const good=Math.abs(diff)<tol; needle.classList.toggle('good',good);
      if(!helpShown || !st.silent){
        const ad=Math.abs(diff);
        if(t.pc===undefined && Math.abs(ad-12)<0.6) R('msg').textContent = diff<0 ? 'Right note, one octave too low' : 'Right note, one octave too high';
        else if(ad>=0.95) R('msg').textContent = `Too ${diff<0?'low':'high'} by ${Math.round(ad)} half step${Math.round(ad)>1?'s':''}`;
        else R('msg').textContent = good ? (isHold?'Hold it steady…':'Hold it…') : (diff<0?'A little flat':'A little sharp');
      }
      if(good){ hold+=dt; cents.push(Math.abs(diff*100)); if(hold>=holdMs){ const tg=R('target'); tg.classList.add('flash'); setTimeout(()=>tg.classList.remove('flash'),300); advance(true); } }
      else hold=Math.max(0, hold-dt*(isHold?1.5:0.5));
    } else if(!st.deaf) hold=Math.max(0, hold-dt*(isHold?0.4:1));
    R('hold').style.width=Math.min(100,hold/holdMs*100)+'%';
    trace.push({t:now, d:diff}); drawTrace(now);
    if(!finished) loopRAF=requestAnimationFrame(frame);
  }
  async function startListening(){
    ac(); const btn=R('listen'); btn.disabled=true; btn.textContent='Starting…';
    const ok = await Mic.start();
    if(!ok){ btn.disabled=false; btn.textContent='Listen'; R('msg').innerHTML = micErrorMsg(); return; }
    stopLoops(); loopOwner=owner; btn.disabled=true; btn.textContent='Listening'; last=performance.now(); helpShown=false;
    if(R('msg').textContent.startsWith('Tap Listen')) R('msg').textContent='';
    loopRAF=requestAnimationFrame(frame);
    if(autoRef && !finished) playRef();
  }
  R('listen').onclick = startListening;
  R('ref').onclick = playRef;
  if(R('ans')) R('ans').onclick = ()=>{ const t=targets[idx]; if(t){ ac(); playNote(t.m,1.2); } };
  if(R('all')) R('all').onclick = ()=>{ ac(); targets.slice(idx).forEach((t,i)=>playNote(t.m,0.6,i*0.55)); };
  R('skip').onclick = ()=>advance(false);
  R('self').onclick = ()=>advance(true);
  R('restart').onclick = ()=>mountTrainer(el, spec, {instrument, unitId});
  show(); drawTrace(performance.now());
}
function simpleMicLoop(el, R, onRead){
  const owner={ el, onStop(){ const b=R('listen'); if(b){ b.disabled=false; b.textContent='Listen'; } } };
  function frame(){ if(loopOwner!==owner) return; if(!el.isConnected){ stopLoops(); return; }
    const st=Mic.read(); if(!st||!st.live){ R('msg').textContent='The microphone stopped. Tap Listen to restart it.'; stopLoops(); return; }
    const l=R('lvl'); if(l) l.style.width=Math.round(st.level*100)+'%';
    const m=R('mstat'); if(m) m.textContent=micStatusText(st, st.midi!=null?'Hearing '+midiName(Math.round(st.midi)):null);
    onRead(st); loopRAF=requestAnimationFrame(frame); }
  R('listen').onclick=async()=>{ ac(); const b=R('listen'); b.disabled=true; b.textContent='Starting…';
    if(!(await Mic.start())){ b.disabled=false; b.textContent='Listen'; R('msg').innerHTML=micErrorMsg(); return; }
    stopLoops(); loopOwner=owner; b.textContent='Listening'; R('msg').textContent=''; loopRAF=requestAnimationFrame(frame); };
}
function mountRange(el){
  let cur=null;
  el.innerHTML = `<div class="trainer"><div class="tr-head"><div><div class="tr-label">Range finder</div><div class="tr-sub">Slide slowly down to your lowest comfortable note and tap Set lowest. Then up to your highest comfortable note (not strained) and tap Set highest.</div></div>
    <div class="tr-actions"><button class="btn" data-r="listen">Listen</button></div></div>${micRowHTML}
    <div class="tr-target" data-r="target">–</div>
    <div class="tr-foot"><button class="btn" data-r="lo">Set lowest</button><button class="btn" data-r="hi">Set highest</button></div>
    <div class="tr-heard">Saved range: <b data-r="saved">${midiName(S.range.low)} – ${midiName(S.range.high)}</b></div>
    <div class="tr-msg" data-r="msg"></div></div>`;
  const R=k=>el.querySelector(`[data-r="${k}"]`);
  simpleMicLoop(el, R, st=>{ if(st.midi!=null){ cur=Math.round(st.midi); R('target').textContent=midiName(cur); } });
  const upd=()=>{ R('saved').textContent=`${midiName(S.range.low)} – ${midiName(S.range.high)}`; save(); };
  R('lo').onclick=()=>{ if(cur!=null && cur<S.range.high-4){ S.range.low=cur; upd(); } };
  R('hi').onclick=()=>{ if(cur!=null && cur>S.range.low+4){ S.range.high=cur; upd(); } };
}
function mountTuner(c){
  const STR=[[40,'low E'],[45,'A'],[50,'D'],[55,'G'],[59,'B'],[64,'high E']];
  c.innerHTML=`<h2>Tuner and pitch meter</h2><p class="small">Play one guitar string, or sing a note. For guitar it shows the nearest string and which way to turn.</p>
    <div class="tr-actions"><button class="btn" data-r="listen">Listen</button></div>${micRowHTML}<div class="tr-target" data-r="n">–</div>
    <div class="meter"><div class="meter-zone"></div><div class="meter-needle" data-r="needle"></div><div class="meter-ticks"><span>flat</span><span>in tune</span><span>sharp</span></div></div><div class="tr-heard" data-r="hz"></div><div class="tr-msg" data-r="msg"></div>`;
  const R=k=>c.querySelector(`[data-r="${k}"]`);
  simpleMicLoop(c, R, st=>{ if(st.midi==null) return; const n=Math.round(st.midi), cents=Math.round((st.midi-n)*100);
    R('n').textContent=midiName(n); R('needle').style.left=(50+cents)+'%'; R('needle').classList.toggle('good',Math.abs(cents)<8);
    const near=STR.slice().sort((a,b)=>Math.abs(a[0]-st.midi)-Math.abs(b[0]-st.midi))[0]; const d=st.midi-near[0];
    R('hz').textContent=`${st.freq.toFixed(1)} Hz · ${cents>0?'+':''}${cents} cents` + (Math.abs(d)<1.5 ? ` · ${near[1]} string: ${Math.abs(d)<0.08?'in tune':d<0?'tune up':'tune down'}` : ''); });
}
function mountMicCheck(c){
  c.innerHTML=`<h2>Microphone check</h2><p class="small">Tap Listen and make a steady sound. If the level bar moves and a note appears, pitch checking will work. If not, tap Copy report and send it to Claude.</p>
    <div class="tr-actions"><button class="btn" data-r="listen">Listen</button><button class="btn ghost" data-r="re">Restart microphone</button><button class="btn ghost" data-r="copy">Copy report</button></div>${micRowHTML}
    <pre class="report" data-r="rep">Not started.</pre><div class="tr-msg" data-r="msg"></div>`;
  const R=k=>c.querySelector(`[data-r="${k}"]`); let perm='unknown', maxLevel=0, heard=0;
  try{ navigator.permissions.query({name:'microphone'}).then(p=>perm=p.state).catch(()=>{}); }catch(e){}
  const report=st=>{ let tr={}, lab=''; try{ const t=Mic.stream.getAudioTracks()[0]; tr=t.getSettings?t.getSettings():{}; lab=t.label; }catch(e){}
    if(st){ maxLevel=Math.max(maxLevel,st.rms); if(st.midi!=null) heard++; }
    return [`${BUILD}`,`Page: ${location.hostname||'file'} · secure: ${window.isSecureContext}`,`Permission: ${perm}`,`Input: ${lab||'?'} · ${tr.sampleRate||'?'} Hz · echoCancel ${tr.echoCancellation} · autoGain ${tr.autoGainControl}`,
      `Audio engine: ${AC?AC.state:'none'} · ${AC?AC.sampleRate:'?'} Hz · rebuilt ${Mic.rebuilds}×`,
      st?`Level now: ${st.rms>0?(20*Math.log10(st.rms)).toFixed(0):'-inf'} dB · loudest: ${maxLevel>0?(20*Math.log10(maxLevel)).toFixed(0):'-inf'} dB · silent: ${st.silent}`:'',
      st?`Clarity: ${st.clarity.toFixed(2)} · note: ${st.midi!=null?midiName(Math.round(st.midi))+' ('+st.freq.toFixed(1)+' Hz)':'none'} · frames with a note: ${heard}`:''].filter(Boolean).join('\n'); };
  simpleMicLoop(c, R, st=>{ R('rep').textContent=report(st); });
  R('re').onclick=async()=>{ stopLoops(); Mic.stop(); R('listen').click(); };
  R('copy').onclick=async()=>{ const txt=R('rep').textContent+(Mic.err?`\nError: ${Mic.err.name} ${Mic.err.message||''}`:''); try{ await navigator.clipboard.writeText(txt); R('msg').textContent='Copied.'; }catch(e){ R('msg').textContent='Clipboard blocked: select the text above and copy it.'; } };
}

// ===== EAR TRAINER =====
function mountEar(el, spec, {count=6, label='Ear training'}={}){
  let n=0, score=0, cur=null, answered=false;
  const isQ = !!spec.qualities; const choices = isQ ? spec.qualities : spec.intervals;
  const nameOf = c => isQ ? QUALITY_NAME[c] : INTERVAL_NAMES[c];
  el.innerHTML = `<div class="ear"><div class="tr-head"><div><div class="tr-label">${esc(label)}</div><div class="tr-sub" data-r="sub"></div></div><button class="btn" data-r="play">► Play</button></div>
    <div class="opts" data-r="opts"></div><div class="tr-msg" data-r="msg"></div><button class="btn ghost sm" data-r="next" hidden>Next →</button></div>`;
  const R=k=>el.querySelector(`[data-r="${k}"]`);
  function play(){ if(!cur) return; if(isQ){ const ms=CHORD_FORMULAS[cur.c].map(([s])=>cur.root+s); playChordMidi(ms,1.6,0); setTimeout(()=>playChordMidi(ms,1.4,0.12),1700);} else { playNote(cur.root,0.9); playNote(cur.root+cur.c,1.1,0.75); } }
  function newQ(){
    if(n>=count){ R('sub').textContent=`Score ${score}/${count}`; R('opts').innerHTML=''; R('play').hidden=true; R('next').hidden=true;
      R('msg').textContent= score>=count*0.8?'Solid.':score>=count*0.5?'Partial: a weakness until it is 5 of 6.':'A clear gap. Repeat this tomorrow.'; logMetric({k:'ear',label,score,total:count}); return; }
    cur={c:rnd(choices), root:48+Math.floor(Math.random()*12)}; answered=false; n++;
    R('sub').textContent=`${n} of ${count} · score ${score}`;
    R('opts').innerHTML = choices.map(c=>`<button class="opt" data-c="${c}">${esc(nameOf(c))}</button>`).join('');
    R('msg').textContent=''; R('next').hidden=true;
    R('opts').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{ if(answered) return; answered=true; const c=isNaN(+b.dataset.c)?b.dataset.c:+b.dataset.c;
      const ok = c===cur.c; if(ok) score++; b.classList.add(ok?'right':'wrong');
      if(!ok) R('opts').querySelector(`[data-c="${cur.c}"]`).classList.add('right');
      R('msg').textContent = ok?'Correct.':`It was ${nameOf(cur.c)}.`; R('next').hidden=false; });
    setTimeout(play,250);
  }
  R('play').onclick=()=>{ ac(); if(!cur) newQ(); else play(); };
  R('next').onclick=newQ;
  R('sub').textContent = `${count} questions · tap Play to start`;
}

// ===== THEORY QUIZ =====
function mountQuiz(el, gens, {count=5, review=[], onFinish}={}){
  let n=0, score=0, q=null;
  el.innerHTML=`<div class="quiz"><div class="tr-sub" data-r="sub"></div><div class="qq" data-r="q"></div><div class="opts col" data-r="opts"></div><div class="tr-msg" data-r="msg"></div><button class="btn ghost sm" data-r="next" hidden>Next →</button></div>`;
  const R=k=>el.querySelector(`[data-r="${k}"]`);
  function next(){
    if(n>=count){ R('q').textContent=`Score: ${score}/${count}`; R('opts').innerHTML=''; R('next').hidden=true; R('sub').textContent='';
      R('msg').textContent = score===count?'Clean.':score>=count*0.6?'Pass with gaps. Re-read the concept for what you missed.':'Not there yet. Re-read the concept and retake.';
      logMetric({k:'quiz',score,total:count}); onFinish&&onFinish({score,count}); return; }
    const isRev = review.length && n>0 && Math.random()<0.25;
    q=QUIZ[rnd(isRev?review:gens)](); n++;
    R('sub').textContent=`Question ${n} of ${count}${isRev?' · review from an earlier unit':''}`; R('q').textContent=q.q; R('msg').textContent=''; R('next').hidden=true;
    R('opts').innerHTML=q.options.map((o,i)=>`<button class="opt" data-i="${i}">${esc(o)}</button>`).join('');
    R('opts').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{ if(R('next').hidden===false) return; const o=q.options[+b.dataset.i]; const ok=o===q.answer; if(ok) score++;
      b.classList.add(ok?'right':'wrong'); if(!ok) [...R('opts').children].find(x=>x.textContent===q.answer).classList.add('right');
      R('msg').textContent= ok?'Correct.':`Answer: ${q.answer}`; R('next').hidden=false; });
  }
  R('next').onclick=next; next();
}

// ===== METRONOME =====
const Metro = { bpm:70, beats:4 };
function mountMetro(el, bpm){
  if(bpm) Metro.bpm=bpm;
  el.innerHTML=`<div class="metro"><button class="btn" data-r="go">► Metronome</button>
    <button class="btn ghost sm" data-r="dn">−5</button><span class="bpm" data-r="bpm">${Metro.bpm} bpm</span><button class="btn ghost sm" data-r="up">+5</button>
    <select data-r="beats">${[2,3,4,6].map(b=>`<option value="${b}" ${b===Metro.beats?'selected':''}>${b} beats</option>`).join('')}</select>
    <span class="beats" data-r="dots"></span></div>`;
  const R=k=>el.querySelector(`[data-r="${k}"]`);
  const drawDots=()=>{ R('dots').innerHTML=Array.from({length:Metro.beats},()=>'<i></i>').join(''); }; drawDots();
  const sched=new Sched({ onStep(i,t,perf){ this.bpm=Metro.bpm; const b=i%Metro.beats; tickAt(t,b===0?2400:1900,b===0?0.5:0.3); at(perf,()=>{ if(el.isConnected) el.querySelectorAll('.beats i').forEach((d,k)=>d.classList.toggle('on',k===b)); }); },
    onStop(){ if(el.isConnected){ R('go').textContent='► Metronome'; el.querySelectorAll('.beats i').forEach(d=>d.classList.remove('on')); } } });
  R('go').onclick=()=>{ if(sched.on) sched.stop(); else { sched.bpm=Metro.bpm; sched.start(); R('go').textContent='■ Stop'; } };
  R('dn').onclick=()=>{ Metro.bpm=Math.max(30,Metro.bpm-5); R('bpm').textContent=Metro.bpm+' bpm'; };
  R('up').onclick=()=>{ Metro.bpm=Math.min(220,Metro.bpm+5); R('bpm').textContent=Metro.bpm+' bpm'; };
  R('beats').onchange=e=>{ Metro.beats=+e.target.value; drawDots(); };
}

// ===== RHYTHM TRAINER =====
function mountRhythm(el, keys, {unitId=null}={}){
  let key=keys[0], pat=RHYTHMS[key], bpm=pat.bpm, sched=null, expected=[], taps=[], testing=false;
  el.innerHTML=`<div class="rhythm">${keys.length>1?`<div class="tabs-mini">${keys.map(k=>`<button class="pill" data-k="${k}">${esc(RHYTHMS[k].label)}</button>`).join('')}</div>`:`<div class="tr-label" data-r="lab"></div>`}
    <div class="rgrid" data-r="grid"></div>
    <div class="row"><button class="btn" data-r="play">► Play along</button><button class="btn ghost" data-r="test">Tap test</button><button class="btn ghost sm" data-r="dn">−5</button><span class="bpm" data-r="bpm"></span><button class="btn ghost sm" data-r="up">+5</button></div>
    <button class="tappad" data-r="pad" hidden>TAP HERE</button><div class="tr-msg" data-r="msg"></div></div>`;
  const R=k=>el.querySelector(`[data-r="${k}"]`);
  const isUp=i=>pat.spb>1 && i%2===1;
  function draw(){
    const n=pat.slots.length; R('bpm').textContent=bpm+' bpm'; if(R('lab')) R('lab').textContent=pat.label;
    el.querySelectorAll('.pill').forEach(p=>p.classList.toggle('on',p.dataset.k===key));
    const g=R('grid'); g.style.gridTemplateColumns=`repeat(${n},1fr)`;
    g.innerHTML=pat.slots.map((s,i)=>{ const sub=i%pat.spb, beat=Math.floor(i/pat.spb); const lab=sub===0?beat+1:(pat.spb===2?'&':['','e','&','a'][sub]);
      const sym=!s?'·':(pat.strum===false?'●':(isUp(i)?'↑':'↓'));
      return `<div class="rc${sub===0?' b':''}${s?' act':''}" data-i="${i}"><span class="ra">${sym}</span><span class="rl">${lab}</span></div>`; }).join('');
  }
  const hl=k=>{ if(!el.isConnected) return; el.querySelectorAll('.rc').forEach((c,i)=>c.classList.toggle('now',i===k)); };
  function reset(){ testing=false; R('pad').hidden=true; R('play').textContent='► Play along'; R('test').textContent='Tap test'; hl(-1); }
  function stop(){ if(sched && sched.on) sched.stop(); }
  function start(test){
    stop(); const n=pat.slots.length; expected=[]; taps=[]; testing=test;
    sched=new Sched({bpm, spb:pat.spb, swing:!!pat.swing,
      onStep(i,t,perf){ const k=i%n;
        if(test && i>=5*n){ at(perf+200, ()=>{ stop(); evaluate(); }); this.on=false; clearInterval(this.timer); if(Sched.active===this) Sched.active=null; return; }
        if(k%pat.spb===0) tickAt(t, k===0?2400:1900, k===0?0.4:0.22);
        if(!test){ if(pat.slots[k]) chkAt(t,0.3,isUp(k)); }
        else if(i>=n && pat.slots[k]) expected.push(perf+outLatencyMs());
        at(perf,()=>{ hl(k); if(test && el.isConnected) R('msg').textContent = i<n ? 'Count-in: listen for one bar' : `Bar ${Math.floor(i/n)} of 4: tap the arrows`; }); },
      onStop(){ testing=false; if(el.isConnected) reset(); }});
    if(test){ R('pad').hidden=false; R('test').textContent='■ Cancel'; R('play').textContent='► Play along'; } else { R('play').textContent='■ Stop'; R('msg').textContent='Strum or tap along. Keep the hand moving through the dots.'; }
    sched.start();
  }
  function evaluate(){
    reset(); if(!expected.length) return;
    const used=new Set(), offs=[]; const half=Math.min(180, 60000/bpm/pat.spb*0.5);
    for(const tp of taps){ let best=-1, bd=1e9; expected.forEach((ex,j)=>{ if(used.has(j)) return; const d=tp-ex; if(Math.abs(d)<Math.abs(bd)){ bd=d; best=j; } }); if(best>=0 && Math.abs(bd)<=half){ used.add(best); offs.push(bd); } }
    const hits=offs.length, extra=taps.length-hits, total=expected.length;
    if(!hits){ R('msg').textContent=`No taps landed on the pattern (${taps.length} taps). Watch one bar with Play along, then try again.`; return; }
    const sorted=offs.slice().sort((a,b)=>a-b), bias=sorted[Math.floor(sorted.length/2)];
    const spread=Math.round(offs.reduce((a,b)=>a+Math.abs(b-bias),0)/hits);
    const ratio=hits/total; const r = ratio>=0.9&&extra<=1&&spread<=35?3:ratio>=0.75&&spread<=60?2:1;
    R('msg').innerHTML=`<b>${hits}/${total}</b> on the pattern${extra>0?`, ${extra} extra tap${extra>1?'s':''}`:''}. Consistency <b>±${spread} ms</b> (under 35 is tight). On average ${Math.abs(Math.round(bias))} ms ${bias<0?'early':'late'}; a steady offset is partly device delay, so judge the consistency figure. Verdict: <b>${RATING[r]}</b>.`;
    logMetric({k:'rhythm', u:unitId, label:pat.label, spread, hits, total, bpm});
    const bk='rh_'+key; if(ratio>=0.9 && (S.bests[bk]==null || spread<S.bests[bk])){ S.bests[bk]=spread; save(); }
  }
  R('pad').addEventListener('pointerdown', e=>{ e.preventDefault(); const now=performance.now(); const ts=(e.timeStamp>0 && Math.abs(e.timeStamp-now)<500)?e.timeStamp:now; taps.push(ts); const p=R('pad'); p.classList.add('hit'); setTimeout(()=>p.classList.remove('hit'),80); });
  R('play').onclick=()=>{ if(sched && sched.on && !testing) stop(); else start(false); };
  R('test').onclick=()=>{ if(testing){ testing=false; stop(); reset(); R('msg').textContent=''; } else start(true); };
  R('dn').onclick=()=>{ bpm=Math.max(30,bpm-5); if(sched) sched.bpm=bpm; R('bpm').textContent=bpm+' bpm'; };
  R('up').onclick=()=>{ bpm=Math.min(200,bpm+5); if(sched) sched.bpm=bpm; R('bpm').textContent=bpm+' bpm'; };
  el.querySelectorAll('.pill').forEach(p=>p.onclick=()=>{ testing=false; stop(); key=p.dataset.k; pat=RHYTHMS[key]; bpm=pat.bpm; reset(); R('msg').textContent=''; draw(); });
  draw();
}

// ===== BACKING LOOPS =====
function mountLoop(el, loops){
  let cur=0, bpm=loops[0].bpm, click=true, sched=null;
  el.innerHTML=`<div class="loop">${loops.length>1?`<div class="tabs-mini">${loops.map((l,i)=>`<button class="pill" data-l="${i}">${esc(l.label)}</button>`).join('')}</div>`:`<div class="tr-label">${esc(loops[0].label)}</div>`}
    <div class="strip" data-r="strip"></div>
    <div class="row"><button class="btn" data-r="go">► Play backing</button><button class="btn ghost sm" data-r="dn">−5</button><span class="bpm" data-r="bpm"></span><button class="btn ghost sm" data-r="up">+5</button>
    <label class="chk"><input type="checkbox" data-r="click" checked> click</label></div>
    <p class="small">Pitch checking pauses while the backing plays through the speaker (the microphone would hear it). With headphones, turn on the headphones setting under Progress.</p></div>`;
  const R=k=>el.querySelector(`[data-r="${k}"]`);
  function draw(){ const L=loops[cur]; R('bpm').textContent=bpm+' bpm'; el.querySelectorAll('.pill').forEach(p=>p.classList.toggle('on',+p.dataset.l===cur));
    R('strip').innerHTML=L.chords.map((c,i)=>`<span class="sc" data-i="${i}">${esc(c)}</span>`).join(''); }
  const hl=k=>{ if(el.isConnected) el.querySelectorAll('.sc').forEach((c,i)=>c.classList.toggle('now',i===k)); };
  function stop(){ if(sched && sched.on) sched.stop(); }
  function start(){
    const L=loops[cur], beats=L.beats||4, per=L.per||beats;
    sched=new Sched({bpm, spb:2, swing:!!L.swing,
      onStep(i,t,perf){ const beat=Math.floor(i/2), sub=i%2, ci=Math.floor(beat/per)%L.chords.length, bic=beat%per, name=L.chords[ci];
        const bd=60/this.bpm, when=Math.max(0,t-AC.currentTime), p=parseChord(name); if(!p) return;
        const voicing=chordPcs(name).map(pc=>55+mod(pc-55,12));
        if(sub===0){
          const bpc=pcOf(p.bass||p.root), bass=36+bpc+(bpc<4?12:0);
          if(bic===0) playNote(bass, bd*1.5, when, 0.36); else if(per>=4 && bic===2) playNote(bass, bd*0.9, when, 0.22);
          voicing.forEach(m=>playNote(m, bd*0.6, when, bic===0?0.11:0.075));
          if(click) tickAt(t, bic===0?2600:2200, bic===0?0.1:0.05);
          if(bic===0) at(perf,()=>hl(ci));
        } else if(L.swing){ voicing.forEach(m=>playNote(m, bd*0.25, when, 0.04)); }
        gateMic(bd*1.2); },
      onStop(){ if(el.isConnected){ R('go').textContent='► Play backing'; hl(-1); } }});
    sched.start(); R('go').textContent='■ Stop';
  }
  R('go').onclick=()=>{ if(sched && sched.on) stop(); else start(); };
  R('dn').onclick=()=>{ bpm=Math.max(40,bpm-5); if(sched) sched.bpm=bpm; R('bpm').textContent=bpm+' bpm'; };
  R('up').onclick=()=>{ bpm=Math.min(180,bpm+5); if(sched) sched.bpm=bpm; R('bpm').textContent=bpm+' bpm'; };
  R('click').onchange=e=>{ click=e.target.checked; };
  el.querySelectorAll('.pill').forEach(p=>p.onclick=()=>{ stop(); cur=+p.dataset.l; bpm=loops[cur].bpm; draw(); });
  draw();
}
function mountDrone(c){
  c.innerHTML=`<h2>Drone</h2><p class="small">A sustained home note to sing or play scales against. Pitch checking pauses while it sounds unless the headphones setting is on.</p>
    <div class="opts" data-r="notes">${SHARP.map((n,i)=>`<button class="opt" data-pc="${i}">${enh(n)}</button>`).join('')}</div>
    <div class="row"><button class="btn" data-r="stop">■ Stop</button><label class="chk"><input type="checkbox" data-r="fifth" checked> add the 5th</label></div>`;
  const R=k=>c.querySelector(`[data-r="${k}"]`);
  c.querySelectorAll('[data-pc]').forEach(b=>b.onclick=()=>{ c.querySelectorAll('[data-pc]').forEach(x=>x.classList.remove('right')); b.classList.add('right'); Sched.stopAll(); Drone.start(+b.dataset.pc, R('fifth').checked); });
  R('stop').onclick=()=>{ Drone.stop(); c.querySelectorAll('[data-pc]').forEach(x=>x.classList.remove('right')); };
}
function mountKeyboard(c){
  c.innerHTML=`<h2>Keyboard</h2><p class="small">Tap keys to hear notes when you are away from the piano.</p><div data-r="k">${keysSVG({from:48,to:72,interactive:true})}</div><div class="tr-target" data-r="n">–</div>`;
  c.querySelectorAll('[data-m]').forEach(k=>k.addEventListener('pointerdown',e=>{ e.preventDefault(); const m=+k.dataset.m; ac(); playNote(m,1.4,0,0.34); c.querySelector('[data-r="n"]').textContent=midiName(m); k.classList.add('on'); setTimeout(()=>k.classList.remove('on'),220); }));
}

// ===== SESSION PLANNER =====
const BASE_W = {voice:0.22, theory:0.14, guitar:0.18, piano:0.18, songs:0.28};
function planSession(minutes){
  const u=S.unit, n=S.sessions.length;
  let strands = STRANDS.slice();
  if(minutes<20){ const tech = n%2===0?'guitar':'piano'; strands=['voice','theory',tech,'songs']; }
  const w={}; strands.forEach(s=>w[s]=BASE_W[s]);
  const avgs = strands.map(s=>[s, strandAvg(u,s)]).filter(x=>x[1]!=null);
  let weakest=null;
  if(avgs.length>=2){ avgs.sort((a,b)=>a[1]-b[1]); if(avgs[0][1] < avgs[avgs.length-1][1]) weakest=avgs[0][0]; }
  if(!weakest) weakest = (S.levels.voice<=0) ? 'voice' : null;
  if(weakest && w[weakest]!=null) w[weakest]+=0.07;
  if(!S.seenConcept[u]) w.theory += 0.06;
  const tot=Object.values(w).reduce((a,b)=>a+b,0);
  let blocks = strands.map(s=>({strand:s, mins:Math.max(2, Math.round(minutes*w[s]/tot))}));
  let diff = minutes - blocks.reduce((a,b)=>a+b.mins,0);
  const order = blocks.slice().sort((a,b)=>b.mins-a.mins);
  let k=0; while(diff!==0 && k<50){ const b=order[k%order.length]; if(diff>0){b.mins++;diff--;} else if(b.mins>2){b.mins--;diff++;} k++; }
  const review = n>0 && n%4===3 && unitIndex(u)>0;
  const unit=unitById(u);
  const songIdx = (S.bests['songi_'+u]||0) % unit.songs.length;
  return { minutes, unit:u, created:Date.now(), weakest, review, songIdx, blocks: blocks.map(b=>({...b, done:false, rating:null, elapsed:0})) };
}

// ===== VIEWS =====
let view = 'today', courseUnit=null, openBlock=null, toolView=null;
function setView(v){ leave(); view=v; openBlock=null; courseUnit=null; toolView=null; render(); window.scrollTo(0,0); }
function render(){
  const app=$('#app');
  document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.toggle('on', b.dataset.v===view));
  app.innerHTML='';
  if(!S.placed){ app.appendChild(placementView()); return; }
  app.appendChild(view==='today' ? todayView() : view==='course' ? courseView() : view==='tools' ? toolsView() : progressView());
}
function rangeSel(which,label,val){
  let o=''; for(let m=36;m<=84;m++) o+=`<option value="${m}" ${m===val?'selected':''}>${midiName(m)}</option>`;
  return `<label class="sel">${label} <select data-range="${which}">${o}</select></label>`;
}
function placementView(){
  const plQ=(k,label,opts)=>`<div class="plq"><div class="pl-l">${label}</div>${opts.map((o,i)=>`<label class="radio"><input type="radio" name="${k}" value="${i}" ${S.levels[k]===i?'checked':''}> ${o}</label>`).join('')}</div>`;
  const el=h(`<section class="card placement"><h1>Set your starting point</h1>
    <p class="lead">Be honest; it sets where the course starts and where the extra practice time goes. All of this can be changed later.</p>
    <div class="pl-grid">
      ${plQ('guitar','Guitar',['Never played','Know some open chords','Comfortable with open chords and strumming','Barre chords and beyond'])}
      ${plQ('piano','Piano',['Never played','Can pick out a melody','Basic two-handed playing'])}
      ${plQ('voice','Singing',['Struggle to match notes','Can match notes, unreliable','Fairly reliable in tune'])}
      ${plQ('theory','Theory',['None','Know note names and some chords','Know scales, keys and chord numbers'])}
    </div>
    <h3>Vocal range</h3><p class="small">The default suits most male voices. Measure yours with the range finder under Tools.</p>
    <div class="row">${rangeSel('low','Lowest',S.range.low)} ${rangeSel('high','Highest',S.range.high)}</div>
    <button class="btn big" data-r="go">Start the course</button></section>`);
  el.querySelector('[data-r="go"]').onclick=()=>{
    ['guitar','piano','voice','theory'].forEach(k=>{ const r=el.querySelector(`input[name="${k}"]:checked`); if(r) S.levels[k]=+r.value; });
    S.range.low=+el.querySelector('[data-range="low"]').value; S.range.high=+el.querySelector('[data-range="high"]').value;
    if(!S.sessions.length) S.unit = S.levels.theory>=2 ? 'u3' : 'u1';
    S.placed=true; save(); view='today'; render();
  };
  return el;
}

// ----- TODAY -----
function todayView(){
  const u=unitById(S.unit)||CURRICULUM[0]; const sess=S.session;
  const wrap=h(`<div></div>`);
  if(openBlock!=null && sess){ wrap.appendChild(blockView(sess, openBlock)); return wrap; }
  const ready=unitReady(u.id), isLast=unitIndex(u.id)===CURRICULUM.length-1;
  wrap.appendChild(h(`<section class="card hero"><div class="eyebrow">${esc(u.stage)} · Unit ${unitIndex(u.id)+1} of ${CURRICULUM.length}</div>
    <h1>${esc(u.title)}</h1>
    <div class="strandbar">${STRANDS.map(s=>{const a=strandAvg(u.id,s); return `<div class="sb"><span>${STRAND_LABEL[s]}</span><b class="lvl-n l${a==null?0:Math.round(a)}">${a==null?'–':a.toFixed(1)}</b></div>`;}).join('')}</div>
    ${ready&&!isLast?`<div class="note good">Every strand is rated solid. <button class="btn sm" data-act="advance">Advance to the next unit</button></div>`:''}
    </section>`));
  if(sess && sess.blocks.some(b=>!b.done)){ wrap.appendChild(sessionCard(sess)); }
  else {
    const c=h(`<section class="card"><h2>How long have you got?</h2>
      <div class="times">${[10,15,20,30,45,60].map(m=>`<button class="timebtn" data-m="${m}">${m}<small>min</small></button>`).join('')}</div>
      <p class="small">Every length keeps the essentials: voice, the current concept, technique and a song. Longer sessions add both instruments and more time on whatever is rated weakest.</p></section>`);
    c.querySelectorAll('.timebtn').forEach(b=>b.onclick=()=>{ S.session=planSession(+b.dataset.m); save(); render(); });
    wrap.appendChild(c);
    if(S.sessions.length){ const l=S.sessions[S.sessions.length-1]; wrap.appendChild(h(`<p class="small center">Last session: ${new Date(l.date).toLocaleDateString()} · ${l.minutes} min · ${esc((unitById(l.unit)||{}).title||'')}</p>`)); }
  }
  return wrap;
}
function sessionCard(sess){
  const el=h(`<section class="card"><div class="row between"><h2>Today · ${sess.minutes} min</h2><button class="btn ghost sm" data-r="cancel">Discard</button></div>
    ${sess.weakest?`<p class="small">Extra time on <b>${STRAND_LABEL[sess.weakest]}</b> (lowest rated).</p>`:''}
    ${sess.review?`<p class="small">Review session: the song block includes one from an earlier unit.</p>`:''}
    <ol class="blocks">${sess.blocks.map((b,i)=>`<li class="blk ${b.done?'done':''}" data-i="${i}"><span class="bk-s">${STRAND_LABEL[b.strand]}</span><span class="bk-m">${fmtMin(b.mins)}</span><span class="bk-r">${b.done?RATING[b.rating]:'Start →'}</span></li>`).join('')}</ol></section>`);
  el.querySelectorAll('.blk').forEach(li=>li.onclick=()=>{ openBlock=+li.dataset.i; render(); window.scrollTo(0,0); });
  el.querySelector('[data-r="cancel"]').onclick=()=>{ S.session=null; save(); render(); };
  return el;
}
let blockTimer=null;
const clock = s=>{ const neg=s<0; s=Math.abs(s); return (neg?'+':'')+Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
function blockView(sess, i){
  const b=sess.blocks[i], u=unitById(sess.unit);
  const el=h(`<div><section class="card blockhead"><div class="row between"><button class="btn ghost sm" data-r="back">← Session</button>
      <div class="timer"><span data-r="clock">${clock(b.mins*60-b.elapsed)}</span><button class="btn sm" data-r="tgo">Start timer</button></div></div>
      <div class="eyebrow">${esc(u.title)}</div><h1>${STRAND_LABEL[b.strand]}</h1></section>
    <div data-r="body"></div>
    <section class="card rateblock"><h3>How did that go?</h3><div class="rates">
      <button class="rate r1" data-v="1">Struggled</button><button class="rate r2" data-v="2">OK</button><button class="rate r3" data-v="3">Solid</button></div>
      <p class="small">Rate the result, not the effort. Partly right is "Struggled" or "OK", not "Solid". A low rating brings this strand more time next session.</p></section></div>`);
  const R=k=>el.querySelector(`[data-r="${k}"]`);
  R('back').onclick=()=>{ clearInterval(blockTimer); leave(); openBlock=null; render(); };
  let running=false;
  R('tgo').onclick=()=>{ running=!running; R('tgo').textContent=running?'Pause':'Resume'; clearInterval(blockTimer);
    if(running) blockTimer=setInterval(()=>{ if(!el.isConnected){clearInterval(blockTimer);return;} b.elapsed++; const left=b.mins*60-b.elapsed; R('clock').textContent=clock(left); if(left===0){ ac(); playNote(84,0.5,0,0.3,false); playNote(79,0.6,0.25,0.3,false); } if(b.elapsed%15===0) save(); },1000); };
  el.querySelectorAll('.rate').forEach(x=>x.onclick=()=>{ clearInterval(blockTimer); leave(); finishBlock(sess,i,+x.dataset.v); });
  strandContent(R('body'), b.strand, u, {sess, block:b});
  return el;
}
function finishBlock(sess,i,r){
  const b=sess.blocks[i]; b.done=true; b.rating=r; rate(sess.unit,b.strand,r);
  if(b.strand==='songs') S.bests['songi_'+sess.unit]=(S.bests['songi_'+sess.unit]||0)+1;
  const all=sess.blocks.every(x=>x.done);
  if(all) S.sessions.push({date:Date.now(), minutes:sess.minutes, unit:sess.unit, ratings:sess.blocks.map(x=>[x.strand,x.rating])});
  save(); openBlock=null; render(); window.scrollTo(0,0);
  if(all) $('#app').prepend(h(`<section class="card note good"><b>Session logged.</b> ${S.sessions.length} session${S.sessions.length>1?'s':''} so far.</section>`));
}

// Strand content (used by session blocks and the course unit page)
function pillTabs(card, items, labelOf, onPick, start=0){
  const bar=h(`<div class="tabs-mini">${items.map((x,i)=>`<button class="pill" data-t="${i}">${esc(labelOf(x))}</button>`).join('')}</div>`);
  const pick=i=>{ bar.querySelectorAll('.pill').forEach(p=>p.classList.toggle('on',+p.dataset.t===i)); onPick(i); };
  bar.querySelectorAll('.pill').forEach(p=>p.onclick=()=>pick(+p.dataset.t));
  card.appendChild(bar); return pick;
}
function strandContent(body, strand, u, ctx={}){
  const add=html=>{ const c=h(html); body.appendChild(c); return c; };
  const diagrams=()=>`${u.kbd?kbdDiagram(u.kbd):''}${u.fretboard?fretboardSVG(u.fretboard):''}`;
  if(strand==='voice'){
    add(`<section class="card"><h2>Warm-up and technique</h2><p>${esc(u.voiceTech||'')}</p><details><summary class="small">Two-minute warm-up</summary><ol class="steps small">${WARMUP.map(w=>`<li>${esc(w)}</li>`).join('')}</ol></details></section>`);
    const e=add(`<section class="card"><h2>Ear first</h2><div data-r="ear"></div></section>`);
    mountEar(e.querySelector('[data-r="ear"]'), u.ear, {count:6, label:u.earLabel});
    const tc=add(`<section class="card"><h2>Sing</h2><p>${esc(u.voice.core)}</p>${u.voice.stretch?`<p class="stretch"><b>Stretch:</b> ${esc(u.voice.stretch)}</p>`:''}</section>`);
    const slot=h('<div></div>');
    const pick=pillTabs(tc, u.voiceTrainers, trainerLabel, i=>mountTrainer(slot, u.voiceTrainers[i], {unitId:u.id}));
    tc.appendChild(slot); pick(0);
  }
  if(strand==='theory'){
    const first=!S.seenConcept[u.id];
    add(`<section class="card"><details ${first||!ctx.sess?'open':''}><summary><h2 style="display:inline">${esc(u.title)}</h2> <span class="small">concept · tap to open or close</span></summary><div class="concept">${u.concept}</div></details></section>`);
    if(first){ S.seenConcept[u.id]=true; save(); }
    const ch=add(`<section class="card"><h2>See it</h2>${diagrams()}<div class="chords">${u.chords.map(chordCard).join('')}</div></section>`); wireChordButtons(ch);
    const q=add(`<section class="card"><h2>Check</h2><div data-r="q"></div></section>`);
    const review=[...new Set(CURRICULUM.slice(0,unitIndex(u.id)).flatMap(x=>x.quiz))];
    mountQuiz(q.querySelector('[data-r="q"]'), u.quiz, {count:ctx.sess?6:5, review, onFinish:({score,count})=>{
      const r = score>=count*0.85?3:score>=count*0.6?2:1; q.querySelector('.tr-msg').innerHTML += ` <br><span class="small">Suggested rating: <b>${RATING[r]}</b></span>`; }});
  }
  if(strand==='guitar' || strand==='piano'){
    const g=strand==='guitar', t=u[strand], trs = g?u.guitarTrainers:u.pianoTrainers, strong=S.levels[strand]>=2;
    const c=add(`<section class="card"><h2>${g?'Guitar':'Piano'} technique</h2><p>${esc(t.core)}</p><p class="stretch ${strong?'':'dim'}"><b>Stretch${strong?'':' (once the core is clean)'}:</b> ${esc(t.stretch)}</p>${g?(u.fretboard?fretboardSVG(u.fretboard):''):(u.kbd?kbdDiagram(u.kbd):'')}<div data-r="metro"></div></section>`);
    mountMetro(c.querySelector('[data-r="metro"]'), 60);
    const rc=add(`<section class="card"><h2>${g?'Strumming and rhythm':'Rhythm'}</h2><p class="small">${g?'Arrows are strum directions. The hand moves on every count and only touches the strings on the arrows.':'Clap or play the pattern on one chord.'} Play along first, then take the tap test: it measures your timing in milliseconds.</p><div data-r="rh"></div></section>`);
    mountRhythm(rc.querySelector('[data-r="rh"]'), u.rhythm||['main'], {unitId:u.id});
    const ch=add(`<section class="card"><h2>Chords this unit</h2><div class="chords">${u.chords.map(chordCard).join('')}</div></section>`); wireChordButtons(ch);
    if(trs && trs.length){
      const tc=add(`<section class="card"><h2>Note check</h2><p class="small">Single notes only: play each one cleanly and let it ring. Any octave counts. Chords and strumming are self-assessed.</p></section>`);
      const slot=h('<div></div>'); const pick=pillTabs(tc, trs, trainerLabel, i=>mountTrainer(slot, trs[i], {instrument:true, unitId:u.id})); tc.appendChild(slot); pick(0);
    }
    if(u.loops){ const lc=add(`<section class="card"><h2>Backing</h2><div data-r="lp"></div></section>`); mountLoop(lc.querySelector('[data-r="lp"]'), u.loops); }
  }
  if(strand==='songs'){
    let songs=u.songs.map(s=>({...s, unit:u}));
    const pickIdx = ctx.sess ? (ctx.sess.songIdx||0) % songs.length : 0;
    if(ctx.sess && ctx.sess.review){ const prev=CURRICULUM.slice(0,unitIndex(u.id)); const pu=prev[ctx.sess.created%prev.length]; if(pu){ const ps=pu.songs[ctx.sess.created%pu.songs.length]; songs=[...songs, {...ps, unit:pu, review:true}]; } }
    const c=add(`<section class="card"><h2>Songs</h2><p class="small">Each song uses this unit's concept. One per session: chords first, then the strum or accompaniment, then sing. Lyrics for modern songs are not included; open them alongside.</p></section>`);
    const box=h('<div></div>');
    const pick=pillTabs(c, songs, s=>s.t+(s.review?' (review)':''), i=>{ const s=songs[i];
      if(loopOwner && box.contains(loopOwner.el)) stopLoops();
      box.innerHTML=`<div class="song"><h3>${esc(s.t)} <span class="by">${esc(s.a)}</span></h3><div class="tags"><span class="tag">${esc(s.g)}</span>${s.review?`<span class="tag">from: ${esc(s.unit.title)}</span>`:''}</div>
        <p><b>Progression:</b> ${esc(s.prog)}</p><p><b>What it practises:</b> ${esc(s.use)}</p>
        <ol class="steps small"><li>Play the chords slowly with the metronome until the changes are clean.</li><li>Add the strum or accompaniment pattern.</li><li>Speak the lyrics in rhythm over it, then sing with a simplified strum, then the full pattern.</li></ol>
        <div data-r="metro"></div>${s.melody?`<h3>Melody check</h3><div data-r="mel"></div>`:''}</div>`;
      mountMetro(box.querySelector('[data-r="metro"]'), 72);
      if(s.melody) mountTrainer(box.querySelector('[data-r="mel"]'), {kind:'seq',label:s.melody+' (voice)',fit:true,midi:MELODIES[s.melody]}, {unitId:u.id});
    });
    c.appendChild(box); pick(pickIdx);
    if(u.loops){ const lc=add(`<section class="card"><h2>Backing for this unit</h2><div data-r="lp"></div></section>`); mountLoop(lc.querySelector('[data-r="lp"]'), u.loops); }
  }
}

// ----- COURSE -----
function courseView(){
  if(courseUnit) return unitView(unitById(courseUnit));
  const wrap=h(`<div><section class="card"><h1>Course</h1><p class="lead">${CURRICULUM.length} units in four stages. Each unit is one concept worked through theory, guitar, piano, voice and songs. Advance when every strand is rated solid, or jump anywhere.</p></section></div>`);
  let stage=''; const list=h(`<section class="card units"></section>`);
  CURRICULUM.forEach((u,i)=>{
    if(u.stage!==stage){ stage=u.stage; list.appendChild(h(`<div class="stage">${esc(stage)}</div>`)); }
    const cur=u.id===S.unit, done=S.completed.includes(u.id);
    const row=h(`<button class="unitrow ${cur?'cur':''} ${done?'done':''}"><span class="un">${i+1}</span><span class="ut">${esc(u.title)}</span><span class="us">${cur?'Current':done?'Done':''}</span></button>`);
    row.onclick=()=>{ courseUnit=u.id; render(); window.scrollTo(0,0); };
    list.appendChild(row);
  });
  wrap.appendChild(list); return wrap;
}
function unitView(u){
  const i=unitIndex(u.id);
  const wrap=h(`<div><section class="card"><button class="btn ghost sm" data-r="back">← All units</button>
    <div class="eyebrow">${esc(u.stage)} · Unit ${i+1}</div><h1>${esc(u.title)}</h1>
    <div class="row">${u.id===S.unit?'<span class="tag">Current unit</span>':`<button class="btn sm" data-r="make">Make this my current unit</button>`}
    ${S.completed.includes(u.id)?'<span class="tag">Done</span>':`<button class="btn ghost sm" data-r="done">Mark done</button>`}</div></section>
    <div class="tabs-mini big">${STRANDS.map(s=>`<button class="pill" data-s="${s}">${STRAND_LABEL[s]}</button>`).join('')}</div><div data-r="body"></div></div>`);
  const R=k=>wrap.querySelector(`[data-r="${k}"]`);
  R('back').onclick=()=>{ leave(); courseUnit=null; render(); };
  if(R('make')) R('make').onclick=()=>{ leave(); S.unit=u.id; S.session=null; save(); render(); };
  if(R('done')) R('done').onclick=()=>{ leave(); if(!S.completed.includes(u.id)) S.completed.push(u.id); save(); render(); };
  const show=s=>{ leave(); wrap.querySelectorAll('.tabs-mini.big .pill').forEach(p=>p.classList.toggle('on',p.dataset.s===s)); const b=R('body'); b.innerHTML=''; strandContent(b,s,u,{}); };
  wrap.querySelectorAll('.tabs-mini.big .pill').forEach(p=>p.onclick=()=>show(p.dataset.s));
  show('theory');
  return wrap;
}
function advanceUnit(){
  leave(); const i=unitIndex(S.unit); if(!S.completed.includes(S.unit)) S.completed.push(S.unit);
  if(i<CURRICULUM.length-1) S.unit=CURRICULUM[i+1].id; S.session=null; save(); render();
}

// ----- TOOLS -----
const TOOLS=[['metro','Metronome'],['tuner','Tuner / pitch meter'],['match','Pitch matching'],['hold','Hold a note'],['ear','Ear trainer'],['rhythm','Rhythm trainer'],['loops','Backing loops'],['drone','Drone'],['keys','Keyboard'],['chords','Chord library'],['range','Range finder'],['mic','Microphone check']];
function toolsView(){
  const wrap=h(`<div><section class="card"><h1>Tools</h1><div class="toolgrid">${TOOLS.map(([k,l])=>`<button class="tool" data-t="${k}">${l}</button>`).join('')}</div></section><div data-r="body"></div></div>`);
  const body=wrap.querySelector('[data-r="body"]');
  const open=t=>{ leave(); toolView=t; wrap.querySelectorAll('.tool').forEach(b=>b.classList.toggle('on',b.dataset.t===t)); body.innerHTML='';
    const c=h(`<section class="card"></section>`); body.appendChild(c);
    if(t==='metro'){ c.innerHTML='<h2>Metronome</h2><div></div>'; mountMetro(c.lastChild); }
    if(t==='tuner') mountTuner(c);
    if(t==='mic') mountMicCheck(c);
    if(t==='drone') mountDrone(c);
    if(t==='keys') mountKeyboard(c);
    if(t==='match'){ c.innerHTML='<h2>Pitch matching</h2><div></div>'; mountTrainer(c.lastChild,{kind:'match',count:12},{}); }
    if(t==='hold'){ c.innerHTML='<h2>Hold a note</h2><p class="small">The trace shows drift. A steady line inside the band for the full time is the goal.</p><div></div>'; mountTrainer(c.lastChild,{kind:'hold',label:'Hold a note steady (6 s)',seconds:6,count:4},{}); }
    if(t==='range'){ c.innerHTML='<h2>Range finder</h2><div></div>'; mountRange(c.lastChild); }
    if(t==='rhythm'){ c.innerHTML='<h2>Rhythm trainer</h2><div></div>'; mountRhythm(c.lastChild, Object.keys(RHYTHMS)); }
    if(t==='loops'){ c.innerHTML='<h2>Backing loops</h2><p class="small">Every loop in the course, for improvising or singing over.</p><div></div>'; const all=[]; const seen=new Set(); CURRICULUM.forEach(u=>(u.loops||[]).forEach(l=>{ if(!seen.has(l.label)){ seen.add(l.label); all.push(l); } })); mountLoop(c.lastChild, all); }
    if(t==='ear'){ c.innerHTML=`<h2>Ear trainer</h2><div class="tabs-mini"><button class="pill on" data-e="iv">Intervals</button><button class="pill" data-e="tri">Major / minor</button><button class="pill" data-e="sev">Sevenths</button></div><div data-r="e"></div>`;
      const go=e=>{ c.querySelectorAll('.pill').forEach(p=>p.classList.toggle('on',p.dataset.e===e)); const spec={iv:{intervals:[2,3,4,5,7,9,12]},tri:{qualities:['maj','min']},sev:{qualities:['maj7','min7','dom7']}}[e]; mountEar(c.querySelector('[data-r="e"]'),spec,{count:10,label:'Free practice'}); };
      c.querySelectorAll('.pill').forEach(p=>p.onclick=()=>go(p.dataset.e)); go('iv'); }
    if(t==='chords'){ c.innerHTML=`<h2>Chord library</h2><div class="chords">${Object.keys(GUITAR_SHAPES).map(chordCard).join('')}</div>`; wireChordButtons(c); }
  };
  wrap.querySelectorAll('.tool').forEach(b=>b.onclick=()=>open(b.dataset.t));
  if(toolView) open(toolView);
  return wrap;
}

// ----- PROGRESS -----
function progressView(){
  const totalMin=S.sessions.reduce((a,s)=>a+s.minutes,0);
  const days=new Set(S.sessions.map(s=>new Date(s.date).toDateString())).size;
  const mv=S.metrics.filter(m=>m.k==='voice'), avgOf=a=>a.length?Math.round(a.reduce((x,m)=>x+m.cents,0)/a.length):null;
  const recent=avgOf(mv.slice(-5)), before=avgOf(mv.slice(-10,-5));
  const rh=S.metrics.filter(m=>m.k==='rhythm').slice(-5); const rhAvg=rh.length?Math.round(rh.reduce((x,m)=>x+m.spread,0)/rh.length):null;
  const row=m=>{ const d=new Date(m.d).toLocaleDateString(); if(m.k==='voice'||m.k==='inst') return `<tr><td>${d}</td><td>${m.k==='voice'?'Voice':'Instrument'}: ${esc(m.label)}</td><td>${m.hits}/${m.total} · ${m.cents} cents</td></tr>`;
    if(m.k==='rhythm') return `<tr><td>${d}</td><td>Rhythm: ${esc(m.label)} at ${m.bpm}</td><td>${m.hits}/${m.total} · ±${m.spread} ms</td></tr>`;
    if(m.k==='ear') return `<tr><td>${d}</td><td>Ear: ${esc(m.label)}</td><td>${m.score}/${m.total}</td></tr>`;
    return `<tr><td>${d}</td><td>Theory quiz</td><td>${m.score}/${m.total}</td></tr>`; };
  const wrap=h(`<div><section class="card"><h1>Progress</h1>
    <div class="stats"><div><b>${S.sessions.length}</b><span>sessions</span></div><div><b>${Math.round(totalMin/6)/10}</b><span>hours</span></div><div><b>${days}</b><span>days practised</span></div><div><b>${S.completed.length}</b><span>units done</span></div></div></section>
    <section class="card"><h2>Measured accuracy</h2>
      <div class="stats two"><div><b>${recent==null?'–':recent+'¢'}</b><span>voice pitch error, last 5 trainers${before!=null?` (previous 5: ${before}¢)`:''}</span></div><div><b>${rhAvg==null?'–':'±'+rhAvg+' ms'}</b><span>rhythm consistency, last 5 tap tests</span></div></div>
      <p class="small">Pitch error is the average distance from the target while you were on the note, in cents (100 cents = one half step). Under 20 is good; over 35 is audibly out.</p>
      ${S.metrics.length?`<table class="rt left"><tbody>${S.metrics.slice(-12).reverse().map(row).join('')}</tbody></table>`:'<p class="small">Nothing measured yet. Trainers, tap tests and quizzes log here.</p>'}</section>
    <section class="card"><h2>Ratings by unit</h2><p class="small">Average of the last three ratings per strand (1 = struggled, 3 = solid). Below 2 is a weakness.</p>
    <table class="rt"><thead><tr><th>Unit</th>${STRANDS.map(s=>`<th>${STRAND_LABEL[s]}</th>`).join('')}</tr></thead><tbody>
    ${CURRICULUM.filter(u=>S.ratings[u.id]||u.id===S.unit).map(u=>`<tr><td>${unitIndex(u.id)+1}. ${esc(u.title)}</td>${STRANDS.map(s=>{const a=strandAvg(u.id,s); return `<td class="l${a==null?0:Math.round(a)}">${a==null?'–':a.toFixed(1)}</td>`;}).join('')}</tr>`).join('')}
    </tbody></table></section>
    <section class="card"><h2>Recent sessions</h2>${S.sessions.length?`<ul class="sesslist">${S.sessions.slice(-10).reverse().map(s=>`<li>${new Date(s.date).toLocaleDateString()} · ${s.minutes} min · ${esc((unitById(s.unit)||{}).title||'')}</li>`).join('')}</ul>`:'<p class="small">None yet.</p>'}</section>
    <section class="card"><h2>Settings</h2><div class="row">${rangeSel('low','Lowest note',S.range.low)} ${rangeSel('high','Highest note',S.range.high)}</div>
      <label class="chk block"><input type="checkbox" data-r="hp" ${S.settings.headphones?'checked':''}> I am using headphones (keep pitch checking on while the app plays sound)</label>
      <div class="row"><button class="btn ghost sm" data-r="replace">Redo placement</button></div></section>
    <section class="card"><h2>Backup</h2><p class="small">${cloudOK?'Progress syncs to your Claude account while you use the app inside Claude.':'Progress is saved in this browser on this device.'} A backup code moves progress between the Claude copy and the hosted copy, and protects against Safari clearing site data.</p>
      <div class="row"><button class="btn sm" data-r="copy">Copy backup code</button><button class="btn ghost sm" data-r="imp">Restore from code</button></div>
      <textarea data-r="ta" rows="3" placeholder="Paste a backup code here, then tap Restore" hidden></textarea><div class="tr-msg" data-r="msg"></div></section>
    <section class="card"><h2>Reset</h2><button class="btn ghost sm danger" data-r="reset">Reset all progress</button><div data-r="confirm"></div><p class="small">${BUILD}</p></section></div>`);
  const R=k=>wrap.querySelector(`[data-r="${k}"]`);
  wrap.querySelectorAll('[data-range]').forEach(s=>s.onchange=()=>{ S.range[s.dataset.range]=+s.value; save(); });
  R('hp').onchange=e=>{ S.settings.headphones=e.target.checked; save(); };
  R('replace').onclick=()=>{ S.placed=false; save(); render(); };
  R('copy').onclick=async()=>{ const code=btoa(unescape(encodeURIComponent(JSON.stringify(S)))); try{ await navigator.clipboard.writeText(code); R('msg').textContent='Copied.'; }catch(e){ R('ta').hidden=false; R('ta').value=code; R('ta').select(); R('msg').textContent='Clipboard blocked: the code is in the box; select and copy it.'; } };
  R('imp').onclick=()=>{ const ta=R('ta'); if(ta.hidden){ ta.hidden=false; ta.value=''; ta.focus(); R('msg').textContent='Paste the code, then tap Restore again.'; return; }
    try{ const obj=JSON.parse(decodeURIComponent(escape(atob(ta.value.trim())))); if(!obj || !obj.ratings) throw 0; S=Object.assign(defaultState(),obj); save(); R('msg').textContent='Restored.'; setTimeout(render,600);}catch(e){ R('msg').textContent='That code is not valid.'; } };
  R('reset').onclick=()=>{ const c=R('confirm'); c.innerHTML='<p>This deletes all ratings, sessions and measurements.</p><button class="btn sm danger">Yes, reset</button>'; c.querySelector('button').onclick=()=>{ S=defaultState(); save(); view='today'; render(); }; };
  return wrap;
}

// ===== BOOT =====
document.addEventListener('click', e=>{ const a=e.target.closest('[data-act]'); if(a && a.dataset.act==='advance') advanceUnit(); });
document.querySelectorAll('nav.tabs button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
if(!unitById(S.unit)) S.unit='u1';
render();
setTimeout(initCloud, 50);
setTimeout(initCloud, 2500);
