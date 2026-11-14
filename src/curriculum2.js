// ===== CURRICULUM PART 2: rhythm patterns, backing loops, diagrams, voice technique, Stage 4 =====
const RHYTHMS = {
  quarters:{label:'Quarter notes: one per beat',beats:4,spb:1,slots:[1,1,1,1],bpm:60},
  eighths:{label:'Eighth notes: down-up, all eight',beats:4,spb:2,slots:[1,1,1,1,1,1,1,1],bpm:60},
  ddu:{label:'D · D U D · D U',beats:4,spb:2,slots:[1,0,1,1,1,0,1,1],bpm:66},
  main:{label:'D · D U · U D U (the workhorse)',beats:4,spb:2,slots:[1,0,1,1,0,1,1,1],bpm:70},
  waltz:{label:'Waltz: D · D U D U',beats:3,spb:2,slots:[1,0,1,1,1,1],bpm:80},
  shuffle:{label:'Shuffle: swung eighths',beats:4,spb:2,slots:[1,1,1,1,1,1,1,1],swing:true,bpm:80},
  offbeat:{label:'Reggae skank: only the "&"s',beats:4,spb:2,slots:[0,1,0,1,0,1,0,1],bpm:72},
  sixteen:{label:'Straight sixteenths',beats:4,spb:4,slots:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],bpm:50},
  sync16:{label:'Sixteenth groove',beats:4,spb:4,slots:[1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,1],bpm:50},
  tresillo:{label:'3 + 3 + 2',beats:4,spb:2,slots:[1,0,0,1,0,0,1,0],bpm:80,strum:false},
  backbeat:{label:'Backbeat: 2 and 4',beats:4,spb:1,slots:[0,1,0,1],bpm:80,strum:false}
};
const WARMUP = ['Breath: in through the nose for 4, out on a steady "sss" for 12. Twice.',
  'Siren: slide on a lip trill or "ng" from your lowest easy note to your highest and back. Three times, no pushing.',
  'Hum a five-note scale up and down in the middle of your range, then open it to "ah".'];

const EXTRAS = {
u1:{ rhythm:['quarters'],
  loops:[{label:'Em – D',chords:['Em','D'],bpm:66}],
  kbd:{label:'C five-finger position, right hand',midis:[60,62,64,65,67],fingers:[1,2,3,4,5]},
  fretboard:{label:'Natural notes on the two lowest strings',pcs:['C','D','E','F','G','A','B'],root:'C',from:0,to:8,strings:[0,1]},
  voiceTech:'Posture and breath. Stand or sit tall with loose shoulders. Breathe low: the belly and lower ribs move out, the shoulders stay down. Sing at speaking volume. Pitch accuracy does not need loudness, and pushing makes it worse.',
  voiceTrainers:[{kind:'match',count:8},{kind:'hold',label:'Hold a note steady (4 s)',seconds:4,count:3},{kind:'seq',label:'Frère Jacques',fit:true,midi:[60,62,64,60,64,65,67,67,69,67,65,64,60,60,55,60]}]},
u2:{ rhythm:['eighths'],
  loops:[{label:'G – C – D – G',chords:['G','C','D','G'],bpm:66}],
  kbd:{label:'C major scale, right hand (thumb tucks under after 3)',midis:[60,62,64,65,67,69,71,72],fingers:[1,2,3,1,2,3,4,5]},
  fretboard:{label:'G major scale, open position (frets 2–5)',pcs:['G','A','B','C','D','E','F#'],root:'G',from:2,to:5},
  voiceTech:'Sirens. Slide on "ng" (as in "sing") or a lip trill from low to high and back, slowly. The aim is one smooth line. Where the voice cracks or flips is your register break; note where it is, do not fight it.'},
u3:{ rhythm:['ddu'],
  loops:[{label:'G – C – D – C (I–IV–V–IV)',chords:['G','C','D','C'],bpm:72,per:2},{label:'A – D – E – D',chords:['A','D','E','D'],bpm:72,per:2},{label:'C – F – G – F (La Bamba)',chords:['C','F','G','F'],bpm:80,per:2}],
  voiceTech:'Steady air. Hiss "sss" evenly for 15–20 seconds, then sustain one sung note with the same even flow. Running out early means you took a shallow breath or let air leak at the start of the note.'},
u4:{ rhythm:['main','waltz'],
  loops:[{label:'G – C – G – D in 4/4',chords:['G','C','G','D'],bpm:72},{label:'Waltz: C – F – G – C in 3/4',chords:['C','F','G','C'],bpm:84,beats:3}],
  voiceTech:'Clean onsets. Start each note on the beat without a breathy "h" in front and without a hard click in the throat. Practise "ah, ah, ah" on one note in time with the metronome.'},
u5:{ rhythm:['eighths'],
  loops:[{label:'E5 – G5 – A5 – E5',chords:['E5','G5','A5','E5'],bpm:84},{label:'G5 – A5 – C5 (two beats each)',chords:['G5','A5','C5','A5'],bpm:88,per:2}],
  fretboard:{label:'Power-chord roots on the low E and A strings',pcs:['C','D','E','F','G','A','B'],root:'G',from:0,to:8,strings:[0,1]},
  voiceTech:'Hear it first. Before singing an interval, imagine the target note for a second, then land on it directly. Sliding up into the note ("scooping") hides whether you actually knew where it was.'},
u6:{ rhythm:['main'],
  loops:[{label:'Am – C – G – Am (Jolene)',chords:['Am','C','G','Am'],bpm:96,per:2},{label:'Em – C – G – D',chords:['Em','C','G','D'],bpm:80},{label:'A – F#m – D – E (Stand By Me)',chords:['A','F#m','D','E'],bpm:84}],
  voiceTech:'Vowels carry the pitch. Sing a phrase on its vowels only, jaw loose. Then hold one note through "ah – eh – ee – oh – oo" without the pitch or volume changing; "ee" and "oo" tend to drift sharp.'},
u7:{ rhythm:['main'],
  loops:[{label:'C – G – Am – F (I–V–vi–IV)',chords:['C','G','Am','F'],bpm:76},{label:'G – D – Em – C',chords:['G','D','Em','C'],bpm:80},{label:'Am – F – C – G (vi–IV–I–V)',chords:['Am','F','C','G'],bpm:76},{label:'C – Am – F – G (I–vi–IV–V)',chords:['C','Am','F','G'],bpm:84}],
  voiceTech:'Registers. Chest voice is your speaking-range sound; head voice (or falsetto) is the lighter sound above the break. Siren through the break daily. Do not drag chest voice upward by getting louder; let it flip, and the join strengthens over weeks.'},
u8:{ rhythm:['main'],
  loops:[{label:'Am – G – F – G (improvise here)',chords:['Am','G','F','G'],bpm:84},{label:'Em – C – G – D',chords:['Em','C','G','D'],bpm:84},{label:'Am – C – D – F (Rising Sun, 3/4 feel)',chords:['Am','C','D','F'],bpm:92,beats:3}],
  kbd:{label:'A natural minor, right hand',midis:[57,59,60,62,64,65,67,69],fingers:[1,2,3,1,2,3,4,5]},
  fretboard:{label:'A minor pentatonic, box 1 (5th fret)',pcs:['A','C','D','E','G'],root:'A',from:5,to:8},
  voiceTech:'Dynamics. Hold one note and go soft → loud → soft without the pitch moving. Most people go sharp as they get louder and flat as they fade; watch the trace while you do it.'},
u9:{ rhythm:['shuffle'],
  loops:[{label:'12-bar blues in A (shuffle)',chords:['A7','A7','A7','A7','D7','D7','A7','A7','E7','D7','A7','E7'],bpm:92,swing:true},{label:'12-bar blues in E (shuffle)',chords:['E7','E7','E7','E7','A7','A7','E7','E7','B7','A7','E7','B7'],bpm:92,swing:true}],
  kbd:{label:'A blues scale',midis:[57,60,62,63,64,67,69]},
  fretboard:{label:'A blues scale, box 1 (the ♭5 added)',pcs:['A','C','D','Eb','E','G'],root:'A',from:5,to:8},
  voiceTech:'Bending on purpose. Slide deliberately from the minor 3rd up toward the major 3rd and back. A scoop you choose is style; a scoop you cannot avoid is a pitch problem. You should be able to do both versions of a phrase.'},
u10:{ rhythm:['main'],
  loops:[{label:'ii–V–I in C: Dm7 – G7 – Cmaj7',chords:['Dm7','G7','Cmaj7','Cmaj7'],bpm:88},{label:'Am7 – Em7 (Ain\'t No Sunshine)',chords:['Am7','Em7','G7','Am7'],bpm:76,per:2},{label:'Cmaj7 – Fmaj7',chords:['Cmaj7','Fmaj7'],bpm:72}],
  voiceTech:'Sustain. Hold notes dead straight first; use the hold trainer. Vibrato arrives on its own once the breath is steady and the throat relaxed. Do not manufacture it by wobbling the jaw or pulsing the belly.',
  voiceTrainers:[{kind:'seq',label:'Major 7 arpeggio',fit:true,rel:[0,4,7,11,7,4,0]},{kind:'seq',label:'Minor 7 arpeggio',fit:true,rel:[0,3,7,10,7,3,0]},{kind:'hold',label:'Hold a note steady (6 s)',seconds:6,count:3}]},
u11:{ rhythm:['main'],
  loops:[{label:'G – C – D – G',chords:['G','C','D','G'],bpm:80},{label:'Em7 – G – Dsus4 – A7 (Wonderwall shapes)',chords:['Em7','G','Dsus4','A7'],bpm:84,per:2}],
  voiceTech:'Signs of the wrong key: chin lifting for high notes, neck tension, needing volume to reach a note. Transpose down rather than push. Drink water, and stop for the day if you go hoarse.'},
u12:{ rhythm:['offbeat','main'],
  loops:[{label:'C – Am – F – G',chords:['C','Am','F','G'],bpm:76},{label:'A – D – E (Three Little Birds)',chords:['A','A','D','A','A','E','D','A'],bpm:76},{label:'G – Em – D – C',chords:['G','Em','D','C'],bpm:80}],
  voiceTech:'Phrasing. Decide where you breathe before you sing: ends of lines, never mid-word. Mark the breaths on the lyric sheet and take them even when you feel you do not need to.'}
};

const STAGE4 = [
{
  id:'u13', stage:'Stage 4 · Fluency', title:'Barre chords and movable shapes',
  concept:`<p>A <b>barre chord</b> is an open chord shape moved up the neck, with your index finger laid flat across the strings acting as a movable nut.</p>
  <p><b>E shape (root on the low E string).</b> Play an open E chord with fingers 2-3-4, slide it up one fret and barre fret 1 with the index: that is <b>F</b>. Fret 3 is G, fret 5 is A, fret 7 is B. Lift the middle finger (the Em shape) and each becomes minor: fret 2 is F#m, fret 3 is Gm.</p>
  <p><b>A shape (root on the A string).</b> The same idea with the open A chord: barre at fret 2 is <b>B</b>, fret 3 is C, fret 5 is D. Using the Am shape gives Bm (fret 2) and Cm (fret 3).</p>
  <p>So two shapes plus knowing the notes along the two lowest strings gives you every major and minor chord. On piano the equivalent is that a triad is the same structure in all 12 keys; only the mix of black and white keys changes.</p>`,
  chords:['F (barre)','Bm','F#m','B','Gm','Cm'],
  guitar:{core:'Build the F barre in stages: lay the index across fret 1, close to the fret wire and rolled slightly onto its bony edge, thumb behind the neck. Add the E shape with fingers 2-3-4. Pick each string one at a time and fix the dead ones. Then ten slow squeeze-and-release reps. Two minutes a day beats twenty once a week; this takes weeks to sound clean.',
          stretch:'Bm and F#m, then timed changes: F ↔ C, Bm ↔ G, and the Creep loop G–B–C–Cm.'},
  piano:{core:'Right hand: play the major triad on every one of the 12 notes, moving up by half steps from C, naming each chord aloud. Notice the families: all white (C F G), black in the middle (D E A), and so on.',
         stretch:'The same with minor triads, then with both hands.'},
  voice:{core:'Half steps are the hardest interval to sing accurately; most people sing them too wide. Sing the five-note chromatic pattern with the trainer, slowly, checking every note.',
         stretch:'Hold test at 6 seconds, then sing the chromatic pattern without the reference note.'},
  voiceTech:'Chromatic accuracy. Check half steps against the piano: play C, sing C#, then play C# to check. Keep the volume low so you can hear the difference between your note and the piano\'s.',
  voiceTrainers:[{kind:'seq',label:'Chromatic five-note pattern',fit:true,rel:[0,1,2,3,4,3,2,1,0]},{kind:'hold',label:'Hold a note steady (6 s)',seconds:6,count:3}],
  pianoTrainers:[{kind:'seq',label:'Roots moving up by half steps',pcs:['C','C#','D','Eb','E','F','F#','G']}],
  guitarTrainers:[{kind:'seq',label:'Notes on the low E string, frets 1–8',pcs:['F','F#','G','G#','A','Bb','B','C']},{kind:'seq',label:'Notes on the A string, frets 1–8',pcs:['Bb','B','C','C#','D','Eb','E','F']}],
  fretboard:{label:'Root notes for E-shape and A-shape barres',pcs:['C','D','E','F','G','A','B'],root:'F',from:0,to:8,strings:[0,1]},
  rhythm:['main'],
  loops:[{label:'G – B – C – Cm (Creep)',chords:['G','B','C','Cm'],bpm:92},{label:'Am – F – C – G',chords:['Am','F','C','G'],bpm:80},{label:'Bm – G – D – A',chords:['Bm','G','D','A'],bpm:84}],
  quiz:['barre','fretnote'], ear:{qualities:['maj','min','dom7']}, earLabel:'Major, minor or dominant 7th?',
  songs:[
    {t:'Have You Ever Seen the Rain',a:'Creedence Clearwater Revival',g:'Country rock',prog:'C, G, F and Am',use:'Guitar: the F chord in a real song at a forgiving tempo. Voice: mid-range, strong chorus.'},
    {t:"(Sittin' On) The Dock of the Bay",a:'Otis Redding',g:'Soul',prog:'G–B–C–A, all major (I–III–IV–II)',use:'Guitar: the B barre (A shape, fret 2). Theory: major chords that are not in the key.'},
    {t:'Creep',a:'Radiohead',g:'Alt rock',prog:'G–B–C–Cm throughout',use:'Guitar: B and Cm barres, four bars each, so there is time to set up. Voice: quiet verse to a big chorus.'},
    {t:'Hotel California',a:'Eagles',g:'Rock',prog:'Bm–F#–A–E–G–D–Em–F#',use:'Stretch. Guitar: barres in almost every bar. Piano: a long minor-key progression with left-hand roots.'}
  ]
},
{
  id:'u14', stage:'Stage 4 · Fluency', title:'Sus, add and slash chords',
  concept:`<p>These are the small alterations that make plain chords sound like records.</p>
  <p><b>Suspended chords</b> replace the 3rd. <b>sus4</b> uses the 4th instead (Dsus4 = D–G–A); <b>sus2</b> uses the 2nd (Dsus2 = D–E–A). With no 3rd they are neither major nor minor, and they pull back toward the plain chord. D → Dsus4 → D → Dsus2 is the most-used guitar embellishment there is.</p>
  <p><b>add9</b> keeps the 3rd and adds the 9th (the 2nd, an octave up): Cadd9 = C–E–G–D. Richer, not tense.</p>
  <p><b>Slash chords</b> name the bass note after the slash: <b>C/E</b> is a C chord with E as the lowest note. When the bass is the chord's 3rd it is called first inversion; the 5th in the bass is second inversion. Their main job is to make the bass line move by step: C – G/B – Am gives a bass of C, B, A. G – D/F# – Em gives G, F#, E.</p>`,
  chords:['Dsus4','Dsus2','Asus4','Asus2','Esus4','Cadd9','G/B','D/F#','C/G'],
  guitar:{core:'Embellish while strumming: D – Dsus4 – D – Dsus2, one bar each, then two beats each. Same with A – Asus4 – A – Asus2. Then the walk-downs: C – G/B – Am and G – D/F# – Em, listening to the bass string.',
          stretch:'Keep the ring finger and little finger planted on fret 3 of the top two strings and move only the other fingers through G – Cadd9 – Dsus4 – Em7.'},
  piano:{core:'Play C major in root position, first inversion (E–G–C) and second inversion (G–C–E), up and back. Then left hand walks C – B – A – G while the right hand plays C, G, Am, C.',
         stretch:'Csus4 (C–F–G) resolving to C, in three keys. Then A Whiter Shade of Pale\'s descending bass under held chords.'},
  voice:{core:'Sing the suspension resolving: 1–4–3, then 1–2–3. Major 3rds are usually sung sharp; land the 3rd and check it on the trace.',
         stretch:'Sing a descending bass line (do–ti–la–sol) while you play the chords above it.'},
  voiceTech:'Tuning the 3rd. When a 4 resolves down to a 3, aim slightly lower than feels natural. If the trace sits above the centre line every time, that is your habit; correct it deliberately.',
  voiceTrainers:[{kind:'seq',label:'Resolutions: 1–4–3 and 1–2–3',fit:true,rel:[0,5,4,0,2,4]},{kind:'seq',label:'Descending bass: do–ti–la–sol',fit:true,rel:[12,11,9,7]}],
  pianoTrainers:[{kind:'seq',label:'Bass walk under C – G/B – Am – C/G',pcs:['C','B','A','G']},{kind:'seq',label:'C major inversions (lowest notes)',pcs:['C','E','G','C']}],
  guitarTrainers:[{kind:'seq',label:'Bass walk G – F# – E',pcs:['G','F#','E']}],
  rhythm:['ddu'],
  loops:[{label:'D – Dsus4 – D – Dsus2',chords:['D','Dsus4','D','Dsus2'],bpm:80,per:2},{label:'C – G/B – Am – C/G',chords:['C','G/B','Am','C/G'],bpm:72},{label:'G – Cadd9 – Dsus4 – G',chords:['G','Cadd9','Dsus4','G'],bpm:84}],
  quiz:['sus','slash'], ear:{intervals:[2,4,5]}, earLabel:'2nd, 3rd or 4th above the root? (sus2, major, sus4)',
  songs:[
    {t:'Crazy Little Thing Called Love',a:'Queen',g:'Rockabilly',prog:'D – Dsus4 – D riff, then G–C–G',use:'Guitar: the sus4 embellishment at speed. Voice: low, relaxed, rhythmic.'},
    {t:'Good Riddance (Time of Your Life)',a:'Green Day',g:'Acoustic punk',prog:'G – Cadd9 – D with anchored fingers',use:'Guitar: the anchored-finger shapes, picked then strummed.'},
    {t:'Landslide',a:'Fleetwood Mac',g:'Folk rock',prog:'C – G/B – Am7 – G/B, capo 3',use:'Guitar: fingerpicked slash-chord walk. Voice: gentle and exposed; pitch has nowhere to hide.'},
    {t:'A Whiter Shade of Pale',a:'Procol Harum',g:'Baroque pop',prog:'C – C/B – Am – Am/G – F – F/E – Dm – Dm/C',use:'Piano: a bass line descending by step under changing chords.'}
  ]
},
{
  id:'u15', stage:'Stage 4 · Fluency', title:'Sixteenth notes and syncopation',
  concept:`<p><b>Sixteenth notes</b> split each beat into four, counted <b>"1 e & a, 2 e & a…"</b>. The strumming pendulum doubles: down on the numbers and the "&"s, up on the "e"s and "a"s. The hand never stops; the pattern is which swings touch the strings.</p>
  <p><b>Syncopation</b> is accenting what falls <i>off</i> the main beats, or leaving a strong beat empty so the ear leans forward. Three kinds you will meet everywhere:</p>
  <p><b>Backbeat:</b> the snare on 2 and 4. Clap there, not on 1 and 3. <b>Off-beats:</b> playing only the "&"s, as in reggae and ska. <b>3+3+2:</b> eight eighth notes grouped as three, three, two, so accents land on 1, the "&" of 2, and 4. It sits under a huge amount of pop, Latin and piano-driven rock.</p>
  <p>A <b>push</b> (anticipation) is changing chord an eighth note early, on the "&" of 4 instead of on 1. Most strummed pop does this constantly.</p>`,
  chords:['Bm','D','F#m','E','Em','A'],
  guitar:{core:'Mute the strings with the fretting hand and strum straight sixteenths at 50 bpm, accenting beats 2 and 4. Then the sixteenth groove in the rhythm trainer over Em – A.',
          stretch:'Push the chord change: move to the next chord on the "&" of 4. Then the Get Lucky loop Bm – D – F#m – E with the sixteenth groove.'},
  piano:{core:'Left hand plays the root on every beat. Right hand plays the chord only on the "&"s. Then the 3+3+2 comp: right-hand chord on 1, the "&" of 2, and 4.',
         stretch:'Break the chord into a 3+3+2 arpeggio (the Clocks pattern): top note, middle, bottom, grouped 3+3+2 across the bar.'},
  voice:{core:'Count "1 e & a" aloud while tapping quarter notes with your foot. Then speak a lyric in strict rhythm on a monotone before you sing it. Use the rhythm trainer\'s tap test on each pattern.',
         stretch:'Sing a scale in the 3+3+2 rhythm with the metronome.'},
  voiceTech:'Diction and time. Consonants land on the beat and the vowel follows. If your singing drags behind the strum, the consonants are late. Speak the line in rhythm first.',
  voiceTrainers:[{kind:'seq',label:'Major scale (do to do)',fit:true,rel:[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0]},{kind:'match',count:8}],
  pianoTrainers:[{kind:'seq',label:'Clocks-style broken chord in D: A – F# – D',pcs:['A','F#','D','A','F#','D','A','F#']}],
  guitarTrainers:[],
  rhythm:['backbeat','tresillo','sixteen','sync16'],
  loops:[{label:'Bm – D – F#m – E (Get Lucky)',chords:['Bm','D','F#m','E'],bpm:96},{label:'Em – A',chords:['Em','A'],bpm:88},{label:'G – D – Em – C',chords:['G','D','Em','C'],bpm:84}],
  quiz:['sixteenth','rhythm'], ear:{intervals:[2,3,4,5,7,9,12]}, earLabel:'Interval review',
  songs:[
    {t:"I'm Yours",a:'Jason Mraz',g:'Acoustic pop',prog:'I–V–vi–IV (B F# G#m E; G shapes with capo 4)',use:'Guitar: muted off-beat strum. Voice: fast, syncopated lyric delivery.'},
    {t:'Clocks',a:'Coldplay',g:'Piano rock',prog:'Eb – Bbm – Fm, each as a 3+3+2 arpeggio',use:'Piano: the 3+3+2 pattern is the whole song. Start in D – Am – Em to stay on easier keys.'},
    {t:'Get Lucky',a:'Daft Punk',g:'Funk / disco',prog:'Bm – D – F#m – E loop',use:'Guitar: sixteenth-note funk strum with muted ghost strokes, plus barre practice.'},
    {t:'Faith',a:'George Michael',g:'Pop / rockabilly',prog:'Mostly I and IV (B and E)',use:'Guitar: percussive sixteenth strum on two chords, so all attention goes to the right hand.'}
  ]
},
{
  id:'u16', stage:'Stage 4 · Fluency', title:'The circle of fifths and secondary dominants',
  concept:`<p>Put the 12 keys in a circle so each is a 5th above the last: <b>C – G – D – A – E – B …</b> going clockwise, and <b>C – F – Bb – Eb – Ab …</b> anticlockwise. Each clockwise step adds one sharp; each anticlockwise step adds one flat.</p>
  <p>Neighbours on the circle share six of their seven notes, so they are the easiest keys to move between. A key's IV chord is its anticlockwise neighbour and its V chord is its clockwise neighbour: around C you find F and G.</p>
  <p>A <b>secondary dominant</b> is a dominant 7th chord borrowed to point at a chord other than I. In C: <b>D7</b> leads to G (V of V), <b>E7</b> leads to Am (V of vi), <b>A7</b> leads to Dm (V of ii). Each contains one note from outside the key, and that note is what creates the pull. Chain them and you travel round the circle: E7 – A7 – D7 – G7 – C.</p>
  <p><b>Key changes</b> use the same idea: play the new key's V7 and you have arrived. The classic final-chorus lift moves everything up a whole step.</p>`,
  chords:['C','A7','D7','G7','E7','Am','B7'],
  guitar:{core:'C – A7 – D7 – G7, one bar each, then the longer chain E7 – A7 – D7 – G7 – C. Listen for the pull at each change.',
          stretch:'Play I – IV – V – I in C, then G, D, A and E, moving clockwise round the circle without stopping.'},
  piano:{core:'Left hand roots, right hand dominant 7ths: G7 → C, C7 → F, F7 → Bb, moving anticlockwise. Keep the right hand close: only two notes need to move at each change.',
         stretch:'Take a four-chord song you know and move it up a whole step for the last chorus, using the new key\'s V7 as the pivot.'},
  voice:{core:'Sing the roots of the chain E – A – D – G – C with the trainer, then against your own chords. Then the raised 4th leading up to 5: do – mi – fi – sol.',
         stretch:'Sing a chorus you know, then again a whole step higher. Check the first note of the new key with the pitch meter.'},
  voiceTech:'Notes outside the key. An accidental feels wrong for a moment, so singers flatten it back toward the scale. Sing it as a leading note: hear where it is going and it will sit in tune.',
  voiceTrainers:[{kind:'seq',label:'Roots round the circle: E – A – D – G – C',fit:true,rel:[4,9,2,7,0]},{kind:'seq',label:'do – mi – fi – sol',fit:true,rel:[0,4,6,7]}],
  pianoTrainers:[{kind:'seq',label:'Roots anticlockwise: C – F – Bb – Eb',pcs:['C','F','Bb','Eb']},{kind:'seq',label:'Roots of E7 – A7 – D7 – G7 – C',pcs:['E','A','D','G','C']}],
  guitarTrainers:[{kind:'seq',label:'Roots of E7 – A7 – D7 – G7 – C',pcs:['E','A','D','G','C']}],
  rhythm:['shuffle'],
  loops:[{label:'C – A7 – D7 – G7',chords:['C','A7','D7','G7'],bpm:92,swing:true},{label:'C – E7 – Am – F (V of vi)',chords:['C','E7','Am','F'],bpm:80},{label:'E7 – A7 – D7 – G7 – C – C',chords:['E7','A7','D7','G7','C','C'],bpm:96,swing:true}],
  quiz:['circle','secdom'], ear:{qualities:['maj','min','dom7']}, earLabel:'Major, minor or dominant 7th?',
  songs:[
    {t:"Hey, Good Lookin'",a:'Hank Williams',g:'Country',prog:'C, then D7 – G7 – C (II7–V7–I)',use:'Guitar: the D7 that is not in the key, resolving round the circle.'},
    {t:'Imagine',a:'John Lennon',g:'Piano ballad',prog:'C – Cmaj7 – F verse; E7 appears at the end of the chorus',use:'Piano: the classic part, with one secondary dominant to spot by ear.'},
    {t:"Don't Look Back in Anger",a:'Oasis',g:'Britpop',prog:'C – G – Am – E7 – F – G – C',use:'Guitar + voice: E7 pulling to F instead of Am. Sing the chorus; it sits high.'},
    {t:'Yesterday',a:'The Beatles',g:'Pop ballad',prog:'F – Em7 – A7 – Dm (a ii–V into the relative minor)',use:'Stretch. Guitar fingerstyle or piano: a secondary ii–V in the second bar.'},
    {t:'My Girl',a:'The Temptations',g:'Motown',prog:'I–IV vamp in C, then the whole song lifts to D',use:'Voice: a key change up a whole step. Guitar: the pentatonic bass riff.'}
  ]
},
{
  id:'u17', stage:'Stage 4 · Fluency', title:'Modes and borrowed chords',
  concept:`<p>A <b>mode</b> is the major scale's set of notes with a different note treated as home. Two are worth knowing first, because they explain chords that otherwise look "wrong".</p>
  <p><b>Mixolydian</b> is a major scale with a lowered 7th: G A B C D E <b>F</b>. That lowered note gives you a major chord a whole step below the tonic, the <b>♭VII</b> (F in the key of G). I – ♭VII – IV is the sound of a great deal of rock.</p>
  <p><b>Dorian</b> is a natural minor scale with a raised 6th: A B C D E <b>F#</b> G. It gives a minor key a <i>major</i> IV chord (Am – D). Brighter than plain minor; common in funk, folk and Latin rock.</p>
  <p><b>Borrowed chords</b> are chords taken from the parallel minor into a major key. The usual three: <b>♭VII</b> (Bb in C), <b>♭VI</b> (Ab in C) and the <b>minor iv</b> (Fm in C). IV → iv → I is the bittersweet move you have heard in hundreds of ballads.</p>`,
  chords:['D','C','G','Am','F','Fm','Bb'],
  guitar:{core:'D – C – G – G (I – ♭VII – IV in D), then the Dorian vamp Am – D, two bars each. Over Am – D, play A minor pentatonic and add F# (D string fret 4, high E string fret 2).',
          stretch:'C – F – Fm – C, listening for the single note that drops (A to Ab).'},
  piano:{core:'D Mixolydian in the right hand (D E F# G A B C D) over left-hand D – C – G. Then A Dorian (A B C D E F# G) over Am – D.',
         stretch:'C – F – Fm – C with voice leading: only one note changes between F and Fm.'},
  voice:{core:'Sing the Mixolydian scale with the trainer and feel the lowered 7th; untrained singers drift up to the major 7th. Then the Dorian scale.',
         stretch:'Sing either scale over a drone on the home note (Tools → Drone), then Scarborough Fair with the trainer.'},
  voiceTech:'Singing against a drone. Hold the home note sounding and sing the scale slowly over it. Each scale degree has a distinct amount of tension against the drone; learning those feelings is what makes a singer accurate without a reference.',
  voiceTrainers:[{kind:'seq',label:'Mixolydian scale',fit:true,rel:[0,2,4,5,7,9,10,12,10,9,7,5,4,2,0]},{kind:'seq',label:'Dorian scale',fit:true,rel:[0,2,3,5,7,9,10,12]},{kind:'seq',label:'Scarborough Fair (first two lines)',fit:true,midi:[62,62,69,69,69,64,65,64,62,69,72,74,72,69,71,67,69]}],
  pianoTrainers:[{kind:'seq',label:'D Mixolydian',pcs:['D','E','F#','G','A','B','C','D']},{kind:'seq',label:'A Dorian',pcs:['A','B','C','D','E','F#','G','A']}],
  guitarTrainers:[{kind:'seq',label:'A Dorian',pcs:['A','B','C','D','E','F#','G','A']}],
  kbd:{label:'D Mixolydian: D major with C natural',midis:[62,64,66,67,69,71,72,74]},
  fretboard:{label:'A Dorian around the 5th fret: pentatonic box plus B and F#',pcs:['A','B','C','D','E','F#','G'],root:'A',from:4,to:8},
  rhythm:['tresillo','main'],
  loops:[{label:'D – C – G – G (Mixolydian)',chords:['D','C','G','G'],bpm:96},{label:'Am – D (Dorian vamp)',chords:['Am','D'],bpm:92},{label:'C – F – Fm – C (minor iv)',chords:['C','F','Fm','C'],bpm:72},{label:'Bm – A – E (Wicked Game)',chords:['Bm','A','E','E'],bpm:100}],
  quiz:['modes','borrowed'], ear:{intervals:[9,10,11]}, earLabel:'Major 6th, minor 7th or major 7th?',
  songs:[
    {t:'Sweet Home Alabama',a:'Lynyrd Skynyrd',g:'Southern rock',prog:'D – C – G (I – ♭VII – IV; people argue about whether home is D or G)',use:'Guitar: the picked riff across three chords. Theory: decide which chord sounds like home to you.'},
    {t:'Scarborough Fair',a:'Traditional',g:'English folk',prog:'Dorian: Am – G – Am, with a major D chord',use:'Voice: the melody is in the trainer; listen for the raised 6th. Guitar: fingerpicked in 3/4.',melody:'Scarborough Fair'},
    {t:'Oye Como Va',a:'Tito Puente / Santana',g:'Latin rock',prog:'Am7 – D9 vamp (Dorian)',use:'Piano: the two-chord montuno rhythm. Guitar: improvise with A Dorian.'},
    {t:'Wicked Game',a:'Chris Isaak',g:'Rock ballad',prog:'Bm – A – E throughout',use:'Guitar: three chords, all atmosphere. Voice: chest voice to falsetto in the chorus.'},
    {t:'Royals',a:'Lorde',g:'Pop',prog:'D – C – G (I – ♭VII – IV)',use:'Voice: sparse backing, so pitch is exposed. Piano: just bass notes and the vocal.'}
  ]
},
{
  id:'u18', stage:'Stage 4 · Fluency', title:'Harmony singing and arranging',
  concept:`<p>A <b>harmony line</b> is a second melody that shadows the tune. The default is a <b>diatonic 3rd above</b>: for each melody note, sing the note two scale steps higher, staying inside the key. Some of those 3rds come out major and some minor; you do not choose, the key does. A <b>6th below</b> uses exactly the same note names an octave lower, which is often easier for a lower voice.</p>
  <p>Parallel 3rds work most of the time. Where the harmony note clashes with the chord underneath, move it to the nearest chord tone.</p>
  <p><b>Arranging</b> is deciding who plays what, when:</p>
  <p><b>Space:</b> guitar gives rhythm, piano gives bass and sustain, and neither should double the vocal melody. <b>Shape:</b> start sparse, add something in each section, and save the fullest texture for the last chorus. <b>Register:</b> if the guitar strums in the middle, play the piano low or high, not on top of it. <b>Endings:</b> slow the last bar, or repeat the final line ("tag") and stop on the I chord.</p>`,
  chords:['C','Am','F','G','Em','Dm'],
  guitar:{core:'Fingerpicking pattern: thumb on the root, then index, middle and ring on strings 3, 2 and 1 (p–i–m–a–m–i), over C – Am – F – G. Thumb keeps time.',
          stretch:'The G major scale in 3rds on the top two strings: play each scale note on the high E string with the note a 3rd below it on the B string.'},
  piano:{core:'C major scale in 3rds: left hand plays the scale, right hand plays the same shape starting on E. Then both notes in the right hand (fingers 1+3, 2+4, 3+5).',
         stretch:'Arrange one song from the course: an intro from the last line of the chorus, a sparse verse, a fuller chorus, and a planned ending.'},
  voice:{core:'Learn the harmony to Twinkle Twinkle as its own tune with the trainer. Then play the melody on the piano while you sing the harmony. Cover one ear if the melody pulls you off.',
         stretch:'Record yourself singing a melody (Voice Memos), play it back and sing a 3rd above it. Then try a 6th below.'},
  voiceTech:'Holding a part. Learn the harmony alone until it is a tune in its own right, then add the melody quietly, then at full volume. If you get pulled onto the melody, go back a step; that is the normal route.',
  voiceTrainers:[{kind:'seq',label:'Twinkle harmony (a 3rd above)',fit:true,midi:[64,71,72,71,69,67,65,64]},{kind:'seq',label:'Major scale in 3rds',fit:true,rel:[0,4,2,5,4,7,5,9,7,11,9,12]},{kind:'interval',label:'Sing a 3rd above',intervals:[3,4],count:8}],
  pianoTrainers:[{kind:'seq',label:'Twinkle melody, then its harmony',pcs:['C','G','A','G','F','E','D','C','E','B','C','B','A','G','F','E']}],
  guitarTrainers:[],
  rhythm:['main'],
  loops:[{label:'C – Am – F – G',chords:['C','Am','F','G'],bpm:72},{label:'Am – G – Am – G',chords:['Am','G'],bpm:84},{label:'C – F – C – G',chords:['C','F','C','G'],bpm:76}],
  quiz:['harmony','diatonic','secdom'], ear:{intervals:[3,4,8,9]}, earLabel:'3rds and 6ths: which one?',
  songs:[
    {t:'The Sound of Silence',a:'Simon & Garfunkel',g:'Folk',prog:'Am – G, then C – F – C',use:'Voice: two-part harmony in 3rds throughout. Guitar: fingerpicked.'},
    {t:'Bye Bye Love',a:'The Everly Brothers',g:"Country / rock 'n' roll",prog:'I – IV – V (A D E)',use:'Voice: parallel 3rds over three chords; the easiest real harmony song.'},
    {t:'Lean on Me',a:'Bill Withers',g:'Soul / gospel',prog:'C stepping up through Dm, Em to F and back',use:'Piano: chords moving in parallel steps. Voice: built for group harmony.'},
    {t:'Down to the River to Pray',a:'Traditional',g:'Gospel / a cappella',prog:'Mostly I, IV and V; often sung unaccompanied',use:'Voice: sing it with no instrument, then check your final note against the piano.'},
    {t:'Blackbird',a:'The Beatles',g:'Folk / fingerstyle',prog:'G-based; bass and melody move in parallel 10ths',use:'Stretch. Guitar: fingerstyle with two moving voices.'}
  ]
}
];
CURRICULUM.forEach(u=>Object.assign(u, EXTRAS[u.id]||{}));
STAGE4.forEach(u=>CURRICULUM.push(u));
MELODIES['Scarborough Fair']=[62,62,69,69,69,64,65,64,62,69,72,74,72,69,71,67,69];

Object.assign(GUITAR_SHAPES, {
  'F (barre)':[1,3,3,2,1,1],'Bm':[-1,2,4,4,3,2],'F#m':[2,4,4,2,2,2],'B':[-1,2,4,4,4,2],'Gm':[3,5,5,3,3,3],'Cm':[-1,3,5,5,4,3],
  'Fm':[1,3,3,1,1,1],'Bb':[-1,1,3,3,3,1],'C5':[-1,3,5,5,-1,-1],
  'Dsus2':[-1,-1,0,2,3,0],'Asus4':[-1,0,2,2,3,0],'Asus2':[-1,0,2,2,0,0],'Esus4':[0,2,2,2,0,0],
  'Cadd9':[-1,3,2,0,3,3],'G/B':[-1,2,0,0,0,3],'D/F#':[2,0,0,2,3,2],'C/G':[3,3,2,0,1,0]
});
