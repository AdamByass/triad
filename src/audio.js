// ===== AUDIO CORE =====
let AC = null;
function ac(){
  if(!AC || AC.state==='closed'){ const C = window.AudioContext||window.webkitAudioContext; try{ AC = new C({latencyHint:'interactive'}); }catch(e){ AC = new C(); } }
  if(AC.state!=='running'){ try{ const p=AC.resume(); if(p&&p.catch) p.catch(()=>{}); }catch(e){} }  // also covers iOS "interrupted"
  return AC;
}
const wakeAudio = ()=>{ if(AC && AC.state!=='running'){ try{ const p=AC.resume(); if(p&&p.catch) p.catch(()=>{}); }catch(e){} } };
document.addEventListener('pointerdown', wakeAudio, true);
document.addEventListener('touchend', wakeAudio, true);
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) wakeAudio(); });

function gateMic(seconds){ Mic.deafUntil = Math.max(Mic.deafUntil, performance.now()+seconds*1000); }
function playNote(m, dur=1.2, when=0, vol=0.32, gate=true){
  const c=ac(), t=c.currentTime+when, f=midiToFreq(m);
  const g=c.createGain(); const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3200;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.008); g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
  [[1,'triangle',1],[2,'sine',0.35],[3,'sine',0.12]].forEach(([h,type,a])=>{ const o=c.createOscillator(); const og=c.createGain(); o.type=type; o.frequency.value=f*h; og.gain.value=a; o.connect(og); og.connect(lp); o.start(t); o.stop(t+dur+0.05); });
  lp.connect(g); g.connect(c.destination);
  if(gate) gateMic(when+dur*0.8+0.15);
}
function playChordMidi(ms, dur=1.6, arp=0, vol=0.22){ ms.forEach((m,i)=>playNote(m,dur,i*arp,vol)); }
function chordPcs(name){ const p=parseChord(name); return p ? CHORD_FORMULAS[p.q].map(([s])=>mod(pcOf(p.root)+s,12)) : []; }
function chordMidis(name, base=48){
  const p=parseChord(name); if(!p) return [];
  const root=base+pcOf(p.root);
  const ms=CHORD_FORMULAS[p.q].map(([s])=>root+s);
  if(p.bass){ let b=base+pcOf(p.bass); while(b>=ms[0]) b-=12; ms.unshift(b); }
  return ms;
}
function tickAt(t, freq=1900, vol=0.3){ const o=AC.createOscillator(), g=AC.createGain(); o.frequency.value=freq; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.04); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+0.05); }
let _noise=null;
function chkAt(t, vol=0.25, up=false){ // short unpitched "strum" tick
  if(!_noise || _noise.sampleRate!==AC.sampleRate){ _noise=AC.createBuffer(1, Math.floor(AC.sampleRate*0.08), AC.sampleRate); const d=_noise.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  const s=AC.createBufferSource(); s.buffer=_noise; const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=up?5200:3200; f.Q.value=0.8;
  const g=AC.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.06); s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t); s.stop(t+0.08);
}

// ----- Lookahead scheduler (one active at a time) -----
class Sched{
  constructor(o){ Object.assign(this,{bpm:70,spb:1,swing:false,onStep(){},onStop(){}},o); this.on=false; }
  stepDur(i){ const b=60/this.bpm; if(this.spb===2 && this.swing) return (i%2===0?2/3:1/3)*b; return b/this.spb; }
  start(){ Sched.stopAll(); ac(); this.i=0; this.next=AC.currentTime+0.12; this.on=true; Sched.active=this; this.timer=setInterval(()=>this.tick(),25); this.tick(); }
  tick(){ if(!this.on) return; let guard=0;
    while(this.on && this.next < AC.currentTime+0.15 && guard++<64){ const t=this.next, i=this.i; const perf=performance.now()+(t-AC.currentTime)*1000; this.next+=this.stepDur(i); this.i++; this.onStep(i,t,perf); } }
  stop(){ if(!this.on) return; this.on=false; clearInterval(this.timer); if(Sched.active===this) Sched.active=null; this.onStop(); }
  static stopAll(){ if(Sched.active) Sched.active.stop(); }
}
Sched.active=null;
const at = (perf, fn)=>setTimeout(fn, Math.max(0, perf-performance.now()));
const outLatencyMs = ()=> AC ? ((AC.outputLatency||AC.baseLatency||0)*1000) : 0;

// Drone
const Drone = { nodes:null,
  start(pc, fifth=true){ this.stop(); const c=ac(); const g=c.createGain(); g.gain.setValueAtTime(0.0001,c.currentTime); g.gain.exponentialRampToValueAtTime(0.16,c.currentTime+0.4);
    const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1400; lp.connect(g); g.connect(c.destination);
    const root=36+pc+(pc<4?12:0); const fs=[root,root+12].concat(fifth?[root+7]:[]);
    const os=fs.map((m,i)=>{ const o=c.createOscillator(); o.type=i===2?'sine':'sawtooth'; o.frequency.value=midiToFreq(m); const og=c.createGain(); og.gain.value=i===0?0.5:i===1?0.3:0.25; o.connect(og); og.connect(lp); o.start(); return o; });
    this.nodes={g,os}; Mic.droneOn=true; },
  stop(){ if(!this.nodes) return; const {g,os}=this.nodes; const t=AC.currentTime; try{ g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.2); os.forEach(o=>o.stop(t+0.25)); }catch(e){} this.nodes=null; Mic.droneOn=false; }
};

// ===== PITCH DETECTION (McLeod pitch method: amplitude-independent) =====
const _nsdf = new Float32Array(1100);
function detectPitch(buf, sr){
  const N=buf.length; let e=0; for(let i=0;i<N;i++) e+=buf[i]*buf[i];
  const rms=Math.sqrt(e/N);
  if(rms<1e-5) return {freq:-1, rms, clarity:0};
  const maxLag=Math.min(N>>1, Math.floor(sr/62), _nsdf.length-2), minLag=Math.max(2,Math.floor(sr/1250));
  for(let tau=0; tau<=maxLag; tau++){ let acf=0, m=0; const lim=N-tau;
    for(let i=0;i<lim;i++){ const a=buf[i], b=buf[i+tau]; acf+=a*b; m+=a*a+b*b; }
    _nsdf[tau] = m>0 ? 2*acf/m : 0; }
  let tau=1; while(tau<maxLag && _nsdf[tau]>0) tau++;
  let gmax=0; const peaks=[];
  while(tau<maxLag){
    while(tau<maxLag && _nsdf[tau]<=0) tau++;
    let pv=-1, pt=-1;
    while(tau<maxLag && _nsdf[tau]>0){ if(_nsdf[tau]>pv){ pv=_nsdf[tau]; pt=tau; } tau++; }
    if(pt>0 && pt<maxLag-1 && _nsdf[pt]>=_nsdf[pt-1] && _nsdf[pt]>=_nsdf[pt+1]){ peaks.push(pt); if(pv>gmax) gmax=pv; }
  }
  if(!peaks.length) return {freq:-1, rms, clarity:0};
  const thr=gmax*0.9; let pt=peaks[0]; for(const p of peaks){ if(_nsdf[p]>=thr){ pt=p; break; } }
  const a=_nsdf[pt-1], b=_nsdf[pt], c=_nsdf[pt+1]; const den=a-2*b+c; const sh = den ? 0.5*(a-c)/den : 0;
  const T=pt+sh; if(T<minLag) return {freq:-1, rms, clarity:b};
  return {freq: sr/T, rms, clarity: b-0.25*(a-c)*sh};
}

// ===== MICROPHONE =====
const Mic = { stream:null, src:null, analyser:null, sink:null, buf:null, ok:false, err:null,
  deafUntil:0, droneOn:false, floor:0.0004, hist:[], last:null, lastT:0, lastNonZero:0, lastPitchT:0, builtAt:0, rebuilds:0,
  live(){ return !!(this.ok && this.stream && this.stream.getAudioTracks().some(t=>t.readyState==='live')); },
  async start(){
    const c=ac();                                   // called inside the tap, so the context may start
    if(this.live()){ try{ await c.resume(); }catch(e){} return true; }
    this.stop(); this.err=null;
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ this.err={name:'Unsupported'}; return false; }
    try{
      try{ this.stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false, noiseSuppression:false, autoGainControl:false}}); }
      catch(e){ if(e && (e.name==='OverconstrainedError'||e.name==='TypeError')) this.stream = await navigator.mediaDevices.getUserMedia({audio:true}); else throw e; }
    }catch(e){ this.err=e; return false; }
    this.rebuilds=0;
    await this.build();
    return true;
  },
  async build(){
    const c=ac();
    try{ await c.resume(); }catch(e){}                // the permission prompt can leave iOS audio "interrupted"
    try{ if(this.src) this.src.disconnect(); }catch(e){}
    this.src=c.createMediaStreamSource(this.stream);
    this.analyser=c.createAnalyser(); this.analyser.fftSize=2048; this.analyser.smoothingTimeConstant=0;
    this.sink=c.createGain(); this.sink.gain.value=0;  // Safari only runs nodes that reach the output
    this.src.connect(this.analyser); this.analyser.connect(this.sink); this.sink.connect(c.destination);
    this.buf=new Float32Array(this.analyser.fftSize);
    this.ok=true; this.hist=[]; this.last=null; this.builtAt=this.lastNonZero=performance.now();
  },
  async rebuild(){ // a context created before the mic opened can stay silent on iOS: start a fresh one
    Sched.stopAll(); Drone.nodes=null; this.droneOn=false;
    try{ AC.close(); }catch(e){} AC=null; _noise=null;
    await this.build();
  },
  stop(){ try{ if(this.stream) this.stream.getTracks().forEach(t=>t.stop()); }catch(e){} try{ if(this.src) this.src.disconnect(); }catch(e){} this.stream=null; this.src=null; this.ok=false; },
  read(){
    if(!this.ok || !this.analyser) return null;
    const now=performance.now();
    if(this.last && now-this.lastT<28) return this.last;
    this.lastT=now;
    this.analyser.getFloatTimeDomainData(this.buf);
    let peak=0; for(let i=0;i<this.buf.length;i+=4){ const a=Math.abs(this.buf[i]); if(a>peak) peak=a; }
    if(peak>0) this.lastNonZero=now;
    const running = AC.state==='running';
    const silent = running && now-this.lastNonZero>1500 && now-this.builtAt>1500;
    if(silent && this.rebuilds<2 && this.live()){ this.rebuilds++; this.rebuild(); }
    const r=detectPitch(this.buf, AC.sampleRate);
    const headphones = !!(S.settings && S.settings.headphones);
    const deaf = !headphones && (now<this.deafUntil || this.droneOn);
    let midi=null;
    if(!deaf && r.freq>0 && r.clarity>=0.82 && r.rms>Math.max(0.0006,this.floor*2)){
      const m=freqToMidi(r.freq); if(this.hist.length && now-this.lastPitchT>160) this.hist.length=0;
      this.hist.push(m); if(this.hist.length>3) this.hist.shift();
      midi = this.hist.length<3 ? m : this.hist.slice().sort((x,y)=>x-y)[1];
      this.lastPitchT=now;
    } else if(r.clarity<0.5){ this.floor = this.floor*0.97 + r.rms*0.03; }
    const db = r.rms>0 ? 20*Math.log10(r.rms) : -100;
    this.last = { midi, freq:r.freq, clarity:r.clarity, rms:r.rms, level:Math.max(0,Math.min(1,(db+72)/60)), deaf, silent, running, live:this.live() };
    return this.last;
  }
};
