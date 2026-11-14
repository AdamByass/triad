// ===== MUSIC THEORY CORE =====
const SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const LETTERS = 'CDEFGAB';
const LETTER_PC = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const MAJOR_STEPS = [0,2,4,5,7,9,11];
const mod = (n,m)=>((n%m)+m)%m;
const rnd = a=>a[Math.floor(Math.random()*a.length)];
const shuffle = a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

function pcOf(name){ // 'C#', 'Bb', 'E##'
  let pc = LETTER_PC[name[0]];
  for (const ch of name.slice(1)) { if (ch==='#') pc++; else if (ch==='b') pc--; }
  return mod(pc,12);
}
function spell(root, semis, steps){ // spelled note `steps` letters and `semis` half steps above root
  const li = LETTERS.indexOf(root[0]);
  const letter = LETTERS[(li+steps)%7];
  const target = mod(pcOf(root)+semis,12);
  const d = mod(target-LETTER_PC[letter],12);
  const acc = {0:'',1:'#',2:'##',11:'b',10:'bb'}[d];
  return letter+(acc===undefined?'?':acc);
}
function majorScale(root){ return MAJOR_STEPS.map((s,i)=>spell(root,s,i)); }
const CHORD_FORMULAS = { // [semis, letter steps]
  maj:[[0,0],[4,2],[7,4]], min:[[0,0],[3,2],[7,4]], dim:[[0,0],[3,2],[6,4]],
  dom7:[[0,0],[4,2],[7,4],[10,6]], maj7:[[0,0],[4,2],[7,4],[11,6]], min7:[[0,0],[3,2],[7,4],[10,6]],
  five:[[0,0],[7,4]], sus4:[[0,0],[5,3],[7,4]], sus2:[[0,0],[2,1],[7,4]], add9:[[0,0],[4,2],[7,4],[14,8]]
};
const QUALITY_SUFFIX = {maj:'',min:'m',dim:'°',dom7:'7',maj7:'maj7',min7:'m7',five:'5',sus4:'sus4',sus2:'sus2',add9:'add9'};
const QUALITY_NAME = {maj:'major',min:'minor',dim:'diminished',dom7:'dominant 7th',maj7:'major 7th',min7:'minor 7th'};
function chordNotes(root, q){ return CHORD_FORMULAS[q].map(([s,l])=>spell(root,s,l)); }
function parseChord(name){
  const m = name.match(/^([A-G][#b]?)(maj7|m7|m|7|5|sus4|sus2|add9|°|dim)?(?:\/([A-G][#b]?))?/);
  if(!m) return null;
  const q = {undefined:'maj','m':'min','7':'dom7','maj7':'maj7','m7':'min7','5':'five','sus4':'sus4','sus2':'sus2','add9':'add9','°':'dim','dim':'dim'}[m[2]];
  return {root:m[1], q, bass:m[3]||null};
}
const DIATONIC_Q = ['maj','min','min','maj','maj','min','dim'];
const ROMAN = ['I','ii','iii','IV','V','vi','vii°'];
function diatonicChords(key){ const sc=majorScale(key); return sc.map((r,i)=>r+QUALITY_SUFFIX[DIATONIC_Q[i]]); }
function keySigCount(key){ const sc=majorScale(key); const s=sc.filter(n=>n.includes('#')).length, f=sc.filter(n=>n.includes('b')).length; return s?`${s} sharp${s>1?'s':''}`:f?`${f} flat${f>1?'s':''}`:'none'; }
function transposeChord(name, semis){
  const p=parseChord(name); if(!p) return name;
  const pc=mod(pcOf(p.root)+semis,12);
    let r=SHARP[pc]; const minor=p.q==='min'||p.q==='min7'; const fl=(minor?{3:'Eb',10:'Bb'}:{1:'Db',3:'Eb',6:'F#',8:'Ab',10:'Bb'})[pc]; if(fl) r=fl;
  return r+QUALITY_SUFFIX[p.q];
}
const midiName = m => SHARP[mod(m,12)]+(Math.floor(m/12)-1);
const freqToMidi = f => 69+12*Math.log2(f/440);
const midiToFreq = m => 440*Math.pow(2,(m-69)/12);
const INTERVAL_NAMES = {0:'unison',1:'minor 2nd',2:'major 2nd',3:'minor 3rd',4:'major 3rd',5:'perfect 4th',6:'tritone',7:'perfect 5th',8:'minor 6th',9:'major 6th',10:'minor 7th',11:'major 7th',12:'octave'};
const INTERVAL_STEPS = {1:1,2:1,3:2,4:2,5:3,6:3,7:4,8:5,9:5,10:6,11:6,12:7};
const enh = n => { const pc=pcOf(n); const alt={1:'C#/Db',3:'D#/Eb',6:'F#/Gb',8:'G#/Ab',10:'A#/Bb'}[pc]; return alt||n; };

// ===== QUIZ GENERATORS ===== each returns {q, options:[...], answer}
const KEYS = ['C','G','D','A','E','F','Bb'];
function mc(q, answer, pool, n=4){ const uniq=[...new Set(pool.filter(x=>x!==answer))]; const opts=shuffle([answer,...shuffle(uniq).slice(0,n-1)]); return {q,options:opts,answer}; }
const fmtNotes = a=>a.join(' – ');
const QUIZ = {
  halfstep(){ const n=rnd(SHARP); const up=Math.random()<.5; const ans=SHARP[mod(pcOf(n)+(up?1:-1),12)];
    return mc(`What is a half step ${up?'above':'below'} ${enh(n)}?`, enh(ans), SHARP.map(enh)); },
  wholestep(){ const n=rnd(['C','D','E','F','G','A','B']); const ans=SHARP[mod(pcOf(n)+2,12)];
    return mc(`What is a whole step above ${n}?`, enh(ans), SHARP.map(enh)); },
  scaledegree(){ const k=rnd(KEYS.slice(0,6)); const d=1+Math.floor(Math.random()*6); const sc=majorScale(k);
    const ord=['','2nd','3rd','4th','5th','6th','7th'][d];
    return mc(`What is the ${ord} note of ${k} major?`, sc[d], [...sc, ...SHARP]); },
  keysig(){ const k=rnd(KEYS); const opts=['none','1 sharp','2 sharps','3 sharps','4 sharps','1 flat','2 flats'];
    return mc(`How many sharps or flats in ${k} major?`, keySigCount(k), opts); },
  primary(){ const k=rnd(KEYS.slice(0,6)); const which=rnd([0,3,4]); const dc=diatonicChords(k);
    return mc(`In the key of ${k}, what is the ${ROMAN[which]} chord?`, dc[which], [...dc.slice(0,6)]); },
  triad_major(){ const r=rnd(['C','G','D','A','E','F']); const ans=fmtNotes(chordNotes(r,'maj'));
    return mc(`Which notes make ${r} major?`, ans, [fmtNotes(chordNotes(r,'min')), fmtNotes(chordNotes(r,'dim')), fmtNotes([r,spell(r,5,3),spell(r,7,4)]), fmtNotes([r,spell(r,4,2),spell(r,9,5)])]); },
  triad(){ const r=rnd(['C','G','D','A','E','F','B']); const q=rnd(['maj','min']); const ans=fmtNotes(chordNotes(r,q));
    const other=q==='maj'?'min':'maj';
    return mc(`Which notes make ${r}${QUALITY_SUFFIX[q]} (${QUALITY_NAME[q]})?`, ans, [fmtNotes(chordNotes(r,other)), fmtNotes(chordNotes(r,'dim')), fmtNotes([r,spell(r,5,3),spell(r,7,4)])]); },
  triad_quality(){ const r=rnd(['C','D','E','F','G','A']); const q=rnd(['maj','min','dim']);
    return mc(`${fmtNotes(chordNotes(r,q))} is a…`, `${r} ${QUALITY_NAME[q]}`, [`${r} major`,`${r} minor`,`${r} diminished`]); },
  interval_name(){ const r=rnd(['C','D','E','F','G','A']); const s=rnd([2,3,4,5,7,9,10,11,12]); const top=s===12?r:spell(r,s,INTERVAL_STEPS[s]);
    return mc(`${r} up to ${top} is a…`, INTERVAL_NAMES[s], Object.values(INTERVAL_NAMES).slice(1)); },
  interval_semitones(){ const s=rnd([3,4,5,7,9,10,12]);
    return mc(`How many half steps in a ${INTERVAL_NAMES[s]}?`, String(s), ['2','3','4','5','6','7','8','9','10','11','12']); },
  diatonic(){ const k=rnd(KEYS.slice(0,6)); const d=rnd([1,2,3,4,5]); const dc=diatonicChords(k);
    return mc(`In the key of ${k}, what is the ${ROMAN[d]} chord?`, dc[d], dc); },
  roman(){ const k=rnd(KEYS.slice(0,6)); const d=rnd([0,1,3,4,5]); const dc=diatonicChords(k);
    return mc(`In the key of ${k}, ${dc[d]} is which chord?`, ROMAN[d], ROMAN); },
  relative(){ const k=rnd(KEYS.slice(0,6)); const ans=majorScale(k)[5]+'m';
    return mc(`What is the relative minor of ${k} major?`, ans, diatonicChords(k).filter(c=>c.endsWith('m')).concat([k+'m', majorScale(k)[4]+'m'])); },
  pentatonic(){ const r=rnd(['A','E','D','G','B']); const ans=fmtNotes([r,spell(r,3,2),spell(r,5,3),spell(r,7,4),spell(r,10,6)]);
    return mc(`Which notes are ${r} minor pentatonic?`, ans, [fmtNotes([r,spell(r,4,2),spell(r,5,3),spell(r,7,4),spell(r,10,6)]), fmtNotes([r,spell(r,2,1),spell(r,4,2),spell(r,7,4),spell(r,9,5)]), fmtNotes([r,spell(r,3,2),spell(r,5,3),spell(r,7,4),spell(r,8,5)])]); },
  twelvebar(){ const k=rnd(['A','E','G','C','D']); const form=[0,0,0,0,3,3,0,0,4,3,0,4]; const b=Math.floor(Math.random()*12); const dc=majorScale(k);
    const chord=dc[form[b]]+'7';
    return mc(`12-bar blues in ${k}: which chord is in bar ${b+1}?`, chord, [dc[0]+'7',dc[3]+'7',dc[4]+'7',dc[5]+'m']); },
  seventh_dom(){ const r=rnd(['A','D','E','G','C']); const ans=fmtNotes(chordNotes(r,'dom7'));
    return mc(`Which notes make ${r}7?`, ans, [fmtNotes(chordNotes(r,'maj7')), fmtNotes(chordNotes(r,'min7')), fmtNotes(chordNotes(r,'maj'))]); },
  seventh(){ const r=rnd(['C','D','F','G','A']); const q=rnd(['dom7','maj7','min7']); const ans=fmtNotes(chordNotes(r,q));
    return mc(`Which notes make ${r}${QUALITY_SUFFIX[q]}?`, ans, ['dom7','maj7','min7'].map(x=>fmtNotes(chordNotes(r,x))).concat([fmtNotes(chordNotes(r,'maj'))])); },
  iivi(){ const k=rnd(['C','F','G','D','Bb']); const sc=majorScale(k); const ans=`${sc[1]}m7 – ${sc[4]}7 – ${k}maj7`;
    return mc(`What is the ii–V–I in ${k}?`, ans, [`${sc[1]}7 – ${sc[4]}m7 – ${k}maj7`, `${sc[3]}maj7 – ${sc[4]}7 – ${k}maj7`, `${sc[5]}m7 – ${sc[1]}m7 – ${k}7`]); },
  capo(){ const shape=rnd(['G','C','D','Em','Am','E']); const c=rnd([1,2,3,4,5,7]); const ans=transposeChord(shape,c);
    return mc(`With a capo on fret ${c}, the ${shape} chord shape sounds as…`, ans, [transposeChord(shape,c-1),transposeChord(shape,c+1),transposeChord(shape,c+2),transposeChord(shape,-c)]); },
  transpose(){ const prog=rnd([['C','G','Am','F'],['G','D','Em','C'],['A','D','E']]); const s=rnd([2,3,5,7]);
    const ans=prog.map(c=>transposeChord(c,s)).join(' – ');
    return mc(`Transpose ${prog.join(' – ')} up ${s} half steps`, ans, [prog.map(c=>transposeChord(c,s-1)).join(' – '), prog.map(c=>transposeChord(c,s+1)).join(' – '), prog.map(c=>transposeChord(c,-s)).join(' – ')]); },
  rhythm(){ const bank=[
      ['How many quarter-note beats in a bar of 3/4?','3',['2','4','6']],
      ['How many eighth notes fit in one bar of 4/4?','8',['4','6','16']],
      ['A half note lasts how many beats (in 4/4)?','2',['1','3','4']],
      ['In "1 & 2 & 3 & 4 &", the strumming hand moves UP on…','the "&"s',['the numbers','beats 2 and 4 only','beat 1 only']],
      ['Which beat is strongest in a waltz (3/4)?','1',['2','3','all equal']],
      ['A whole note lasts how many beats in 4/4?','4',['1','2','8']],
      ['In the pattern D · D U · U D U, which beat has no strum at all?','3',['1','2','4']]];
    const [q,a,o]=rnd(bank); return mc(q,a,o); }
};

Object.assign(QUIZ, {
  barre(){ const shape=rnd(['E','Em','A','Am']); const f=1+Math.floor(Math.random()*8); const ans=transposeChord(shape,f);
    const other={E:'A',Em:'Am',A:'E',Am:'Em'}[shape];
    return mc(`A barre chord using the ${shape} shape, with the barre at fret ${f}, is…`, ans, [transposeChord(shape,f-1),transposeChord(shape,f+1),transposeChord(shape,f+2),transposeChord(other,f)]); },
  fretnote(){ const s=rnd([['low E',4],['A',9]]); const f=1+Math.floor(Math.random()*10);
    return mc(`Which note is at fret ${f} on the ${s[0]} string?`, enh(SHARP[mod(s[1]+f,12)]), SHARP.map(enh)); },
  sus(){ const r=rnd(['D','A','E','G','C']); const q=rnd(['sus4','sus2']);
    if(Math.random()<0.25) return mc(`A ${q} chord replaces the 3rd with the…`, q==='sus4'?'4th':'2nd', ['4th','2nd','6th','7th']);
    return mc(`Which notes make ${r}${q}?`, fmtNotes(chordNotes(r,q)), [fmtNotes(chordNotes(r,'maj')),fmtNotes(chordNotes(r,'min')),fmtNotes(chordNotes(r,q==='sus4'?'sus2':'sus4'))]); },
  slash(){ const r=rnd(['C','G','D','F','A']); const n=chordNotes(r,'maj');
    if(Math.random()<0.3) return mc(`In the chord ${r}/${n[1]}, what does the letter after the slash mean?`, 'The lowest (bass) note', ['The lowest (bass) note','The highest note','A note to leave out','The key of the song']);
    const which=rnd([1,2]);
    return mc(`Which chord is ${r} major with its ${which===1?'3rd':'5th'} in the bass?`, `${r}/${n[which]}`, [`${r}/${n[which===1?2:1]}`,`${n[which]}/${r}`,`${r}/${spell(r,5,3)}`,`${r}/${spell(r,2,1)}`]); },
  sixteenth(){ const bank=[
      ['How many sixteenth notes fit in one beat?','4',['2','3','8']],
      ['How many sixteenth notes fit in a bar of 4/4?','16',['8','12','32']],
      ['How are sixteenth notes counted?','1 e & a',['1 & 2 &','1 trip-let','1 2 3 4']],
      ['In sixteenth-note strumming, the hand moves DOWN on…','the numbers and the "&"s',['the numbers only','the "e"s and "a"s','every sixteenth']],
      ['Syncopation means…','accenting notes that fall off the main beats',['playing faster','playing every beat equally','changing key']],
      ['The backbeat is on beats…','2 and 4',['1 and 3','1 only','3 only']],
      ['A 3+3+2 grouping over eight eighth notes puts accents on…','1, the "&" of 2, and 4',['1, 2, 3 and 4','1 and 3','the "&" of every beat']]];
    const [q,a,o]=rnd(bank); return mc(q,a,o); },
  circle(){ const order=['Eb','Bb','F','C','G','D','A','E','B']; const i=1+Math.floor(Math.random()*7); const cw=Math.random()<.6;
    return mc(`On the circle of fifths, which key is one step ${cw?'clockwise (a 5th up)':'anticlockwise (a 5th down)'} from ${order[i]}?`, order[cw?i+1:i-1], order); },
  secdom(){ const k=rnd(['C','G','D','F','A']); const sc=majorScale(k), dc=diatonicChords(k); const deg=rnd([1,4,5]);
    const sd=d=>spell(sc[d],7,4)+'7';
    return mc(`In ${k} major, which chord is the secondary dominant that leads to ${dc[deg]}?`, sd(deg), [sd(1),sd(4),sd(5),sc[4]+'7',sc[deg]+'7',sc[0]+'7']); },
  modes(){ const t=rnd([0,1,2]);
    if(t===0){ const k=rnd(['C','G','D','A','E']); const sc=majorScale(k);
      return mc(`What is the ♭VII chord in the key of ${k}?`, transposeChord(k,-2), [sc[6]+'°',sc[3],sc[4],transposeChord(k,-1),sc[5]+'m']); }
    if(t===1){ const k=rnd(['G','D','A','E','C']); const sc=majorScale(k);
      return mc(`${k} Mixolydian is ${k} major with which change?`, `${sc[6]} lowered to ${spell(k,10,6)}`, [`${sc[2]} lowered to ${spell(k,3,2)}`,`${sc[3]} raised to ${spell(k,6,3)}`,`${sc[5]} lowered to ${spell(k,8,5)}`]); }
    const r=rnd(['A','D','E']);
    return mc(`${r} Dorian is ${r} natural minor with which change?`, `6th raised: ${spell(r,8,5)} becomes ${spell(r,9,5)}`, [`7th raised: ${spell(r,10,6)} becomes ${spell(r,11,6)}`,`2nd lowered: ${spell(r,2,1)} becomes ${spell(r,1,1)}`,`3rd raised: ${spell(r,3,2)} becomes ${spell(r,4,2)}`]); },
  borrowed(){ const k=rnd(['C','G','D','A','E']); const sc=majorScale(k);
    if(Math.random()<.5) return mc(`In ${k} major, which chord is the borrowed minor iv?`, sc[3]+'m', [sc[3],sc[1]+'m',sc[4]+'m',sc[5]+'m']);
    return mc(`In ${k} major, which chord is the borrowed ♭VI?`, transposeChord(k,8), [sc[5]+'m',transposeChord(k,10),sc[3],transposeChord(k,3)]); },
  harmony(){ const k=rnd(['C','G','D','F']); const sc=majorScale(k); const i=Math.floor(Math.random()*7); const below=Math.random()<.35;
    return mc(`In ${k} major, which note harmonises ${sc[i]} a diatonic ${below?'6th below':'3rd above'}?`, sc[(i+2)%7], sc); }
});
