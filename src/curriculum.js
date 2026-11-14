// ===== CURRICULUM =====
// Each unit: one concept, worked across theory, guitar, piano, voice, songs.
// voiceTrainers / pianoTrainers / guitarTrainers: specs for the pitch trainer.
//   {kind:'match', count}                       random single notes in vocal range
//   {kind:'seq', label, rel:[semitones], fit:true}   relative pattern, transposed into vocal range
//   {kind:'seq', label, midi:[...], fit:true}        melody (midi), transposed into vocal range
//   {kind:'seq', label, pcs:[...]}                   instrument: note names, any octave counts
//   {kind:'interval', label, intervals:[...], count}
// quiz: generator ids (see theory.js). ear: {intervals:[...]} or {qualities:[...]}
const CURRICULUM = [
{
  id:'u1', stage:'Stage 1 · Foundations', title:'Notes, octaves and pitch',
  concept:`<p>Western music uses <b>12 notes</b>. Seven have letter names (A B C D E F G); the other five sit between them and are named as sharps (#, a half step up) or flats (b, a half step down) of their neighbours. C# and Db are the same key: two spellings of one note.</p>
  <p>A <b>half step</b> (semitone) is the smallest step: one piano key to the very next one (black or white), or one fret on the guitar. Two half steps make a <b>whole step</b>. E–F and B–C are the only white-key pairs with no black key between them, so they are half steps.</p>
  <p>Twelve half steps up brings you back to the same letter one <b>octave</b> higher: double the frequency. That is why A4 (440 Hz) and A3 (220 Hz) sound like "the same note" at different heights, and why you and the piano can sing and play "the same" melody in different octaves.</p>
  <p><b>Landmarks.</b> Piano: C is always the white key just left of each group of <i>two</i> black keys. Guitar: open strings low-to-high are E A D G B E; the 12th fret is the octave of each open string.</p>`,
  chords:['Em','D','G'],
  guitar:{core:'Name all six open strings out loud as you play them. Then find every C on the A and low E strings (A string fret 3, low E string fret 8).',
          stretch:'Two-chord changes Em ↔ D for one minute against the metronome at 60 bpm, one strum per bar. Count clean changes; log the number.'},
  piano:{core:'Find every C on the keyboard. Then play C D E F G F E D C with the right hand, one finger per key (thumb on C), saying each note name.',
         stretch:'Same five-finger pattern starting on G (G A B C D) and on F (F G A Bb C). Notice the black key in F.'},
  voice:{core:'Pitch matching: the app plays one note, you sing the same note back, and the needle shows whether you are too low, too high or on it. Tap Listen to start; each new note plays by itself once you have held the last one in the green band. Sing on "ah" at talking volume, or hum first and then open to "ah". The note name in large letters is only a label; match the sound, not the name. Most "bad singing" is a matching problem, not a voice problem, so this is the foundation.',
         stretch:'Sing Frère Jacques in your range with the trainer checking each note.'},
  voiceTrainers:[{kind:'match',count:8},{kind:'seq',label:'Frère Jacques',fit:true,midi:[60,62,64,60,64,65,67,67,69,67,65,64,60,60,55,60]}],
  pianoTrainers:[{kind:'seq',label:'C five-finger pattern',pcs:['C','D','E','F','G','F','E','D','C']}],
  guitarTrainers:[{kind:'seq',label:'Open strings',pcs:['E','A','D','G','B','E']}],
  quiz:['halfstep','wholestep'], ear:{intervals:[0,12,2]}, earLabel:'Same note, octave, or step?',
  songs:[
    {t:'A Horse with No Name',a:'America',g:'Folk rock',prog:'Em ↔ D6add9/F# (two shapes, one groove)',use:'Guitar: the easiest two-chord groove there is. Voice: the melody barely moves, which makes it ideal pitch practice.'},
    {t:'Jambalaya (On the Bayou)',a:'Hank Williams',g:'Country',prog:'I ↔ V (e.g. G and D)',use:'Guitar: two chords and a steady bass-strum feel. Voice: a lively, easy-range melody.'},
    {t:'Frère Jacques',a:'Traditional',g:'Folk / nursery',prog:'I only (C)',use:'Voice + piano: the melody is built into the trainer. Sing it, then play it with the right hand.',melody:'Frère Jacques'}
  ]
},
{
  id:'u2', stage:'Stage 1 · Foundations', title:'The major scale',
  concept:`<p>A <b>major scale</b> is seven notes chosen by one fixed pattern of steps: <b>W W H W W W H</b> (whole, whole, half, whole, whole, whole, half).</p>
  <p>Start on C and the pattern lands on only white keys: C D E F G A B C. Start on G and you need an F# to keep the pattern (E to F would be a half step where the pattern wants a whole step). That single sharp is the <b>key signature</b> of G major. D major needs two sharps (F#, C#), A major three, and so on; F major needs one flat (Bb).</p>
  <p>The scale notes are numbered as <b>scale degrees</b> 1–7, and singers often name them with solfège: do re mi fa sol la ti do. The numbers matter more than the letters: "the 3rd of the key" means the same job in every key. Everything that follows (chords, keys, progressions) is built from these degrees.</p>`,
  chords:['G','C','D'],
  guitar:{core:'G major scale, one octave: low E string frets 3–5 (G A), A string frets 2–3–5 (B C D), D string frets 2–4–5 (E F# G). Up and down, slowly, one note per click at 60 bpm.',
          stretch:'Two notes per click at 60 bpm, then play it starting from the top. Say the scale degree number of each note.'},
  piano:{core:'C major scale, right hand: fingers 1-2-3 (C D E), tuck the thumb under to F, then 1-2-3-4-5 (F G A B C). Reverse on the way down.',
         stretch:'G major scale, same fingering, with F# on the black key. Then left hand C major: 5-4-3-2-1 (C to G), cross finger 3 over to A, 3-2-1.'},
  voice:{core:'Sing the major scale up and down on solfège (do re mi…) with the trainer checking each note. Go slowly; the half steps (mi–fa, ti–do) are where pitch usually drifts.',
         stretch:'Sing Ode to Joy: it is almost entirely stepwise movement through the scale.'},
  voiceTrainers:[{kind:'seq',label:'Major scale (do to do)',fit:true,rel:[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0]},{kind:'seq',label:'Ode to Joy',fit:true,midi:[64,65,67,65,64,62,60,62,64,62,64,65,67,65,64,62,60,62,64,62,60]}],
  pianoTrainers:[{kind:'seq',label:'C major scale',pcs:['C','D','E','F','G','A','B','C','B','A','G','F','E','D','C']},{kind:'seq',label:'G major scale',pcs:['G','A','B','C','D','E','F#','G']}],
  guitarTrainers:[{kind:'seq',label:'G major scale',pcs:['G','A','B','C','D','E','F#','G']}],
  quiz:['scaledegree','keysig'], ear:{intervals:[2,4,5,7]}, earLabel:'Name the interval (step, 3rd, 4th or 5th)',
  songs:[
    {t:'Ode to Joy',a:'Beethoven',g:'Classical',prog:'I–V (C, G)',use:'Piano right hand + voice: stepwise scale movement. Built into the trainer.',melody:'Ode to Joy'},
    {t:'Joy to the World',a:'Traditional carol',g:'Carol',prog:'I–IV–V',use:'The first line IS a descending major scale (do ti la sol fa mi re do). Sing it, then play it.',melody:'Joy to the World'},
    {t:'Twinkle Twinkle Little Star',a:'Traditional',g:'Folk / nursery',prog:'I–IV–V (C F G)',use:'Piano right hand, then add left-hand roots. Voice: the leap from do to sol is your first perfect 5th.',melody:'Twinkle Twinkle'}
  ]
},
{
  id:'u3', stage:'Stage 1 · Foundations', title:'Primary chords: I, IV and V',
  concept:`<p>A <b>chord</b> is three or more notes sounded together. The simplest is a <b>triad</b>: a root, the note a 3rd above it, and the note a 5th above it. Stack them on scale degree 1 and you get the <b>I chord</b>.</p>
  <p>Build the same kind of chord on degrees 4 and 5 and you have the three <b>primary chords</b>: <b>I, IV and V</b>. In G major these are G, C and D. In C they are C, F and G. In D: D, G and A. In A: A, D and E.</p>
  <p>Together these three chords contain every note of the major scale, which is why thousands of songs (folk, country, early rock'n'roll, hymns) use nothing else. The <b>V chord</b> pulls strongly back to I; that pull, called <b>resolution</b>, is the engine of most music. Learning songs by Roman numeral rather than chord name means you learn them in every key at once.</p>`,
  chords:['G','C','D','A','E'],
  guitar:{core:'G–C–D changes, four down-strums per chord at 70 bpm. Then run the "one-minute changes" drill on G↔C and C↔D: count clean changes in 60 seconds and log the best.',
          stretch:'Same I–IV–V in A (A D E). Play La Bamba\'s I–IV–V–IV loop without stopping for two minutes.'},
  piano:{core:'Right hand: C, F and G triads in root position (C-E-G, F-A-C, G-B-D). Left hand plays the root of each chord as a single note.',
         stretch:'Smooth voice-leading with inversions: C (C-E-G) → F/C (C-F-A) → G/B (B-D-G) → C. The hand barely moves. This is how pianists actually comp.'},
  voice:{core:'Sing the root of each chord as you play it: strum G and sing G, strum C and sing C. Then sing 1-3-5-3-1 over each chord. You are learning to hear where the chord "lives".',
         stretch:'Sing the roots of I–IV–V–I with the trainer, then sing Waltzing Matilda over your own guitar or piano.'},
  voiceTrainers:[{kind:'seq',label:'Roots: I–IV–V–I',fit:true,rel:[0,5,7,0]},{kind:'seq',label:'Arpeggio 1-3-5-8-5-3-1',fit:true,rel:[0,4,7,12,7,4,0]}],
  pianoTrainers:[{kind:'seq',label:'Arpeggios C, F, G',pcs:['C','E','G','F','A','C','G','B','D','C']}],
  guitarTrainers:[],
  quiz:['primary','triad_major'], ear:{intervals:[4,5,7]}, earLabel:'Major 3rd, perfect 4th or perfect 5th?',
  songs:[
    {t:'La Bamba',a:'Ritchie Valens',g:"Rock 'n' roll / Latin",prog:'I–IV–V–IV loop (C F G F)',use:'Guitar: the loop never stops; perfect changes drill. Voice: rhythmic, short phrases.'},
    {t:'Twist and Shout',a:'The Isley Brothers / The Beatles',g:'Rock',prog:'I–IV–V loop (D G A)',use:'Guitar: same loop, faster. Voice: call-and-response, good for confidence.'},
    {t:'Ring of Fire',a:'Johnny Cash',g:'Country',prog:'I–IV–V (G C D)',use:'Guitar: G-C-G changes with the chorus D. Voice: low, comfortable range for most men.'},
    {t:'Wild Thing',a:'The Troggs',g:'Garage rock',prog:'I–IV–V (A D E)',use:'Guitar: open A, D, E, heavy strumming.'},
    {t:'Waltzing Matilda',a:'Traditional (Banjo Paterson)',g:'Australian folk',prog:'I–IV–V',use:'Voice + any instrument: a simple melody over primary chords.'}
  ]
},
{
  id:'u4', stage:'Stage 1 · Foundations', title:'Rhythm, time and strumming',
  concept:`<p>The <b>beat</b> is the steady pulse you tap your foot to. Beats group into <b>bars</b> (measures). The <b>time signature</b> says how many: <b>4/4</b> (four beats per bar, counted "1 2 3 4") covers most pop and rock; <b>3/4</b> (three beats, "1 2 3", strong beat on 1) is the waltz feel.</p>
  <p>Note values divide time: a whole note lasts 4 beats in 4/4, a half note 2, a quarter note 1, an eighth note ½. Count eighth notes as "1 & 2 & 3 & 4 &".</p>
  <p><b>The strumming rule:</b> your strumming hand moves down on every number and up on every "&", <i>all the time</i>, like a pendulum. A pattern is just choosing which of those movements touch the strings. The workhorse 4/4 pattern is <b>D · D U · U D U</b> (down on 1, down-up on 2&, miss beat 3, up on 3&, down-up on 4&). Keep the hand moving through the gaps; that's what keeps time.</p>`,
  chords:['G','C','D','Em'],
  guitar:{core:'Constant-motion strumming on a G chord at 70 bpm: D · D U · U D U. Keep the hand moving through the misses. Then switch chords every bar: G C G D.',
          stretch:'3/4 pattern for waltzes: D · D U D U, over G–C–D. Then raise the tempo 5 bpm at a time until it breaks; log the highest clean tempo.'},
  piano:{core:'Waltz accompaniment in 3/4: left hand plays the chord root on beat 1, right hand plays the triad on beats 2 and 3 ("oom-pah-pah"). Use C, F and G.',
         stretch:'4/4 pop accompaniment: left-hand root on beats 1 and 3, right-hand chord on every beat, then on every eighth note.'},
  voice:{core:'Tap the beat with your foot and sing Amazing Grace in 3/4. Feel the strong beat on 1 of each bar. Use the trainer for pitch first, then sing with the metronome.',
         stretch:'Count aloud "1 & 2 & 3 & 4 &" while strumming, then speak lyrics of a song in rhythm over the strum: the first step to singing while playing.'},
  voiceTrainers:[{kind:'seq',label:'Amazing Grace',fit:true,midi:[62,67,71,67,71,69,67,64,62,62,67,71,67,71,69,74,71,74,71,67,62,64,67,64,62,62,67,71,67,71,69,67]}],
  pianoTrainers:[{kind:'seq',label:'Amazing Grace (key of G)',pcs:['D','G','B','G','B','A','G','E','D','D','G','B','G','B','A','D']}],
  guitarTrainers:[],
  quiz:['rhythm'], ear:{intervals:[2,4,5,7,12]}, earLabel:'Interval review',
  songs:[
    {t:'Amazing Grace',a:'Traditional hymn',g:'Hymn / gospel',prog:'I–IV–V in 3/4',use:'Voice: built into the trainer. Guitar: the 3/4 strum. Piano: oom-pah-pah.',melody:'Amazing Grace'},
    {t:'Brown Eyed Girl',a:'Van Morrison',g:'Pop / soul',prog:'I–IV–I–V (G C G D)',use:'Guitar: the D·DU·UDU pattern fits the verses. Voice: a bright, mid-range melody.'},
    {t:'Edelweiss',a:'Rodgers & Hammerstein',g:'Musical theatre',prog:'I–IV–V in 3/4',use:'Piano: the waltz accompaniment. Voice: slow, sustained notes test pitch steadiness.'},
    {t:'Piano Man',a:'Billy Joel',g:'Piano rock',prog:'Waltz in 3/4, I–V–IV–I with a walking bass',use:'Stretch song. Piano: 3/4 accompaniment with a moving bass line. Guitar: 3/4 strum.'}
  ]
},
{
  id:'u5', stage:'Stage 2 · Harmony', title:'Intervals and power chords',
  concept:`<p>An <b>interval</b> is the distance between two notes, counted in half steps. The ones you will use constantly:</p>
  <p>minor 2nd = 1 · major 2nd = 2 · minor 3rd = 3 · major 3rd = 4 · perfect 4th = 5 · perfect 5th = 7 · major 6th = 9 · minor 7th = 10 · major 7th = 11 · octave = 12.</p>
  <p>Ear anchors (the first two notes of a familiar tune): perfect 4th, <i>Here Comes the Bride</i>; perfect 5th, <i>Twinkle Twinkle</i> ("twin-kle → twin-kle"); major 6th, <i>My Bonnie Lies Over the Ocean</i>; octave, <i>Somewhere Over the Rainbow</i>.</p>
  <p>A <b>power chord</b> is just root + perfect 5th (often with the octave on top). With no 3rd it is neither major nor minor, so it sounds strong and works under distortion. Labelled with a 5: E5, A5, G5. Because it is a fixed shape, you can slide it anywhere: the root note names the chord.</p>`,
  chords:['E5','A5','G5','D5'],
  guitar:{core:'Power chords with the root on the low E string: index on the root, ring finger two frets up on the A string. Play G5 (fret 3), A5 (fret 5), C5 (fret 8). Then the A-string-root version: D5 (A string fret 5).',
          stretch:'Palm-muted eighth notes on power chords at 90 bpm: rest the side of your strumming hand on the strings by the bridge.'},
  piano:{core:'From middle C, play each interval: C–D (M2), C–E (M3), C–F (P4), C–G (P5), C–A (M6), C–C (octave). Name each one aloud and hear its character.',
         stretch:'Left-hand "power chords": root + 5th (C–G, F–C, G–D) in the low register under right-hand melody.'},
  voice:{core:'Interval singing: the app plays a root, you sing a perfect 5th or an octave above it. Use the song anchors above to find the sound.',
         stretch:'Perfect 4ths and 5ths mixed. Sing the Seven Nation Army riff (5 notes) and name the intervals in it.'},
  voiceTrainers:[{kind:'interval',label:'Sing a 5th or octave above',intervals:[7,12],count:8},{kind:'interval',label:'Sing a 4th or 5th above',intervals:[5,7],count:8}],
  pianoTrainers:[{kind:'seq',label:'Intervals up from C',pcs:['C','D','C','E','C','F','C','G','C','A','C']}],
  guitarTrainers:[{kind:'seq',label:'Power-chord roots on low E: G A C',pcs:['G','A','C']}],
  quiz:['interval_name','interval_semitones'], ear:{intervals:[3,4,5,7,9,12]}, earLabel:'Name the interval',
  songs:[
    {t:'Smoke on the Water',a:'Deep Purple',g:'Hard rock',prog:'Riff in parallel 4ths / power chords (G minor)',use:'Guitar: the riff is two-note intervals moving together. Name them.'},
    {t:'You Really Got Me',a:'The Kinks',g:'Rock',prog:'Power-chord riff, moved up a whole step for the chorus',use:'Guitar: sliding a fixed power-chord shape. Shows transposition in action.'},
    {t:'Seven Nation Army',a:'The White Stripes',g:'Alt rock',prog:'Single-note riff over a minor key',use:'Voice: sing the riff and name each interval. Guitar: play it on one string.'},
    {t:'Smells Like Teen Spirit',a:'Nirvana',g:'Grunge',prog:'F5–Bb5–Ab5–Db5 power chords',use:'Stretch. Guitar: four power chords, quick shifts, palm-muted verses.'}
  ]
},
{
  id:'u6', stage:'Stage 2 · Harmony', title:'Major and minor triads',
  concept:`<p>A <b>major triad</b> is root + major 3rd (4 half steps) + another minor 3rd on top (3 half steps): C–E–G. A <b>minor triad</b> swaps the order: minor 3rd then major 3rd: C–Eb–G.</p>
  <p>Only <b>one note</b> differs: the 3rd. The root and 5th are identical. That single half step is the difference between "bright" and "sad". On guitar, compare E and Em: lifting one finger lowers the G# to G. On piano, lower the middle note of any major triad by one key.</p>
  <p>Naming: a capital letter alone means major (A). Add "m" for minor (Am). <b>Diminished</b> triads (two minor 3rds: B–D–F) sound tense and unstable; you'll meet one in the next unit.</p>`,
  chords:['E','Em','A','Am','D','Dm'],
  guitar:{core:'Major ↔ minor pairs, alternating each bar: E ↔ Em, A ↔ Am, D ↔ Dm. Identify which finger moves; that finger is holding the 3rd.',
          stretch:'Jolene\'s Am–C–G–Am loop with a fingerpicked pattern (thumb on the root, then fingers on strings 3-2-1).'},
  piano:{core:'Play C major (C-E-G), then lower E to Eb for C minor. Do this for every white-key triad: D, E, F, G, A. Some are already minor in the key of C. Note which.',
         stretch:'Play the triads in all three positions (root, 1st inversion, 2nd inversion) for C, Am and F.'},
  voice:{core:'Sing 1-3-5-3-1 in major, then the same in minor, with the trainer. Feel the 3rd drop. Then just listen: the ear trainer plays chords and you call major or minor.',
         stretch:'Sing the root, 3rd and 5th of a chord you are playing, one after another, without the reference.'},
  voiceTrainers:[{kind:'seq',label:'Major then minor arpeggio',fit:true,rel:[0,4,7,4,0,3,7,3,0]}],
  pianoTrainers:[{kind:'seq',label:'C major vs C minor, A minor vs A major',pcs:['C','E','G','C','Eb','G','A','C','E','A','C#','E']}],
  guitarTrainers:[],
  quiz:['triad','triad_quality'], ear:{qualities:['maj','min']}, earLabel:'Major or minor chord?',
  songs:[
    {t:'Jolene',a:'Dolly Parton',g:'Country',prog:'vi–I–V–vi (Am C G Am)',use:'Guitar: fingerpicked minor-key loop. Voice: a minor melody with a strong pulse.'},
    {t:'Zombie',a:'The Cranberries',g:'Alt rock',prog:'vi–IV–I–V (Em C G D)',use:'Guitar: four chords, mixing minor and major. Voice: big chorus; good range stretch.'},
    {t:'Stand By Me',a:'Ben E. King',g:'Soul',prog:'I–vi–IV–V (A F#m D E)',use:'Piano: the bass line outlines the chords. Voice: easy, soulful melody.'}
  ]
},
{
  id:'u7', stage:'Stage 2 · Harmony', title:'Chords in a key: the four-chord song',
  concept:`<p>Build a triad on each degree of the major scale using only notes from that scale and you get the <b>diatonic chords</b>. The pattern is the same in every key:</p>
  <p><b>I · ii · iii · IV · V · vi · vii°</b>: capital = major, lower-case = minor, ° = diminished. In C: C, Dm, Em, F, G, Am, B°. In G: G, Am, Bm, C, D, Em, F#°.</p>
  <p>The minor chords are the colour. Add <b>vi</b> to I, IV and V and you get the most-used progression in pop: <b>I–V–vi–IV</b> (C G Am F). Start it from a different chord and the mood changes: <b>vi–IV–I–V</b> (Am F C G) sounds darker; <b>I–vi–IV–V</b> (C Am F G) is the 1950s doo-wop sound.</p>
  <p>Practical upshot: when you know a song's key and its numerals, you know its chords in any key, and you can predict chords by ear.</p>`,
  chords:['C','G','Am','F','Em'],
  guitar:{core:'I–V–vi–IV in C (C G Am F, using the small F shape) and in G (G D Em C), one bar each with the D·DU·UDU strum at 75 bpm.',
          stretch:'Play I–V–vi–IV, then rotate it to vi–IV–I–V and I–vi–IV–V. Same four chords, different songs.'},
  piano:{core:'I–V–vi–IV in C with smooth voicings: C (C-E-G) → G (B-D-G) → Am (A-C-E) → F (A-C-F). Keep common tones held. Left hand plays roots.',
         stretch:'Same in G major. Then sing the root while playing each chord.'},
  voice:{core:'Interval drill: major vs minor 3rds (the interval that makes a chord major or minor). Then sing the first line of Joy to the World over C–G–Am–F.',
         stretch:'Play a four-chord loop and sing any melody you know over it. If it clashes, find which chord and why.'},
  voiceTrainers:[{kind:'interval',label:'Sing a minor or major 3rd above',intervals:[3,4],count:8},{kind:'seq',label:'Joy to the World (line 1)',fit:true,midi:[72,71,69,67,65,64,62,60]}],
  pianoTrainers:[{kind:'seq',label:'Roots of I–V–vi–IV in C',pcs:['C','G','A','F']}],
  guitarTrainers:[],
  quiz:['diatonic','roman'], ear:{qualities:['maj','min']}, earLabel:'Major or minor chord?',
  songs:[
    {t:'Let It Be',a:'The Beatles',g:'Pop / rock',prog:'I–V–vi–IV (C G Am F)',use:'Piano: the classic piano ballad pattern. Guitar: same chords. Voice: sing over either.'},
    {t:'Someone Like You',a:'Adele',g:'Pop ballad',prog:'I–V–vi–IV (A E F#m D)',use:'Piano: broken-chord accompaniment. Voice: sustained notes, wide-ish range.'},
    {t:"Don't Stop Believin'",a:'Journey',g:'Arena rock',prog:'I–V–vi–IV (E B C#m A)',use:'Piano: the famous intro riff is this progression broken into eighth notes.'},
    {t:'Riptide',a:'Vance Joy',g:'Indie pop (Australian)',prog:'vi–V–I (Am G C)',use:'Guitar (or uke-style strum): quick changes. Voice: fast lyric delivery.'},
    {t:'Wagon Wheel',a:'Old Crow Medicine Show / Darius Rucker',g:'Country / folk',prog:'I–V–vi–IV (G D Em C)',use:'Guitar + voice: the ideal first "play and sing" song.'}
  ]
},
{
  id:'u8', stage:'Stage 2 · Harmony', title:'Minor keys and the pentatonic scale',
  concept:`<p>Every major key has a <b>relative minor</b> starting on its 6th degree, using exactly the same notes. C major ↔ A minor; G major ↔ E minor; D major ↔ B minor. The <b>natural minor scale</b> is the major scale started from degree 6: A B C D E F G A.</p>
  <p>A minor-key song centres on the vi chord instead of I: the same chords, a different home.</p>
  <p>The <b>minor pentatonic</b> keeps five notes of the minor scale: <b>1 ♭3 4 5 ♭7</b>. A minor pentatonic = A C D E G. It has no half steps, so no note clashes hard over the chords of the key; it is the default scale for rock and blues soloing and for vocal riffing. The same five notes started from C are the <b>C major pentatonic</b>.</p>`,
  chords:['Am','Em','Dm','C','G','F'],
  guitar:{core:'A minor pentatonic, "box 1" at the 5th fret: frets 5–8 on both E strings, 5–7 on A, D and G, 5–8 on B. Up and down with the metronome at 60 bpm.',
          stretch:'Loop Am–G–F–G (record it on the iPad or play the piano) and improvise with the box over it. Aim to end phrases on A.'},
  piano:{core:'A natural minor scale, right hand (same fingering as C major). Then improvise with only A C D E G over a left-hand Am–G–F–G.',
         stretch:'E minor pentatonic (E G A B D) over Em–C–G–D: the Zombie progression.'},
  voice:{core:'Sing the minor pentatonic up and down with the trainer. Then call-and-response: play a 3-note phrase from the pentatonic and sing it back.',
         stretch:'Improvise a sung melody over your own Am–G–F–G loop using only pentatonic notes.'},
  voiceTrainers:[{kind:'seq',label:'Minor pentatonic up and down',fit:true,rel:[0,3,5,7,10,12,10,7,5,3,0]},{kind:'seq',label:'Natural minor scale',fit:true,rel:[0,2,3,5,7,8,10,12]}],
  pianoTrainers:[{kind:'seq',label:'A natural minor scale',pcs:['A','B','C','D','E','F','G','A']},{kind:'seq',label:'A minor pentatonic',pcs:['A','C','D','E','G','A']}],
  guitarTrainers:[{kind:'seq',label:'A minor pentatonic',pcs:['A','C','D','E','G','A']}],
  quiz:['relative','pentatonic'], ear:{qualities:['maj','min']}, earLabel:'Major or minor chord?',
  songs:[
    {t:'House of the Rising Sun',a:'Traditional / The Animals',g:'Folk rock',prog:'Am–C–D–F / Am–C–E in 6/8',use:'Guitar: arpeggio picking in 6/8. Piano: broken chords. Voice: minor melody with a big range.'},
    {t:'Losing My Religion',a:'R.E.M.',g:'Alt rock',prog:'Am–Em, F–G–Am (A minor)',use:'Guitar: the minor-key alternation. Voice: conversational, mid-range.'},
    {t:'Mad World',a:'Tears for Fears / Gary Jules',g:'New wave / ballad',prog:'Em–G–D–A (E minor / Dorian)',use:'Piano: slow, sparse chords. Voice: very narrow range: a good accuracy test.'},
    {t:'Rolling in the Deep',a:'Adele',g:'Pop / soul',prog:'Minor key, i–v–♭VII (Cm Gm Bb)',use:'Voice: powerful minor-pentatonic melody. Guitar: driving eighth-note strum.'}
  ]
},
{
  id:'u9', stage:'Stage 3 · Colour and groove', title:'The blues',
  concept:`<p>The <b>12-bar blues</b> is a fixed 12-bar form built on I, IV and V:</p>
  <p><b>| I | I | I | I | IV | IV | I | I | V | IV | I | V |</b> (the last V is the "turnaround" back to the top). In A: A A A A, D D A A, E D A E.</p>
  <p>Blues uses <b>dominant 7th</b> chords (A7, D7, E7): a major triad plus a minor 7th (10 half steps above the root). The added note creates tension that wants to resolve, giving the restless blues sound, even on the I chord.</p>
  <p>The <b>blues scale</b> is the minor pentatonic plus the ♭5 "blue note": A C D Eb E G. Singing or playing the minor 3rd over a major chord is the essential blues clash.</p>`,
  chords:['A7','D7','E7','E','A'],
  guitar:{core:'12-bar in A with open A7, D7, E7, four strums per bar at 80 bpm. Count the bars aloud the first few times.',
          stretch:'The shuffle "boogie" riff: on the A string, alternate fret 2 and fret 4 with the open A, two hits each, shuffle feel. Move it to the D and E strings for IV and V.'},
  piano:{core:'Left-hand boogie bass: A–C#–E–F#–G–F#–E–C# over each bar (move it to D and E). Right hand plays the 7th chord on beats 2 and 4.',
         stretch:'Right hand improvises with the A blues scale (A C D Eb E G) while the left hand holds the boogie.'},
  voice:{core:'Sing the blues scale up and down with the trainer. Then sing the root of each bar through a full 12-bar as you play it: it locks the form into your ear.',
         stretch:'Call-and-response blues: sing a short phrase in bars 1–2, answer it on guitar or piano in bars 3–4.'},
  voiceTrainers:[{kind:'seq',label:'Blues scale',fit:true,rel:[0,3,5,6,7,10,12,10,7,6,5,3,0]},{kind:'seq',label:'12-bar roots',fit:true,rel:[0,0,5,0,7,5,0,7]}],
  pianoTrainers:[{kind:'seq',label:'A blues scale',pcs:['A','C','D','Eb','E','G','A']},{kind:'seq',label:'Boogie bass in A',pcs:['A','C#','E','F#','G','F#','E','C#']}],
  guitarTrainers:[{kind:'seq',label:'A blues scale',pcs:['A','C','D','Eb','E','G','A']}],
  quiz:['twelvebar','seventh_dom'], ear:{qualities:['maj','min','dom7']}, earLabel:'Major, minor or dominant 7th?',
  songs:[
    {t:'Johnny B. Goode',a:'Chuck Berry',g:"Rock 'n' roll",prog:'12-bar blues',use:'Guitar: the shuffle riff drives the whole song. Voice: fast storytelling over the form.'},
    {t:'Hound Dog',a:'Big Mama Thornton / Elvis Presley',g:'Blues / rock',prog:'12-bar blues',use:'Voice: the essential blues vocal; lean on the minor 3rd.'},
    {t:'Folsom Prison Blues',a:'Johnny Cash',g:'Country blues',prog:'Blues form, I–IV–V with 7ths',use:'Guitar: boom-chicka bass-strum. Voice: low and steady.'},
    {t:'Sweet Home Chicago',a:'Robert Johnson / The Blues Brothers',g:'Blues',prog:'12-bar shuffle',use:'Guitar + piano: shuffle in E or F. Improvise in the gaps.'}
  ]
},
{
  id:'u10', stage:'Stage 3 · Colour and groove', title:'Seventh chords and jazz colour',
  concept:`<p>Add a 4th note (a 7th above the root) to a triad and you get three main seventh-chord colours:</p>
  <p><b>Major 7</b> (maj7) = major triad + major 7th: C–E–G–B. Dreamy, soft. <b>Minor 7</b> (m7) = minor triad + minor 7th: A–C–E–G. Mellow. <b>Dominant 7</b> (7) = major triad + minor 7th: G–B–D–F. Restless; wants to resolve.</p>
  <p>In a major key, the diatonic sevenths are Imaj7, ii7, iii7, IVmaj7, V7, vi7, viiø7. The <b>ii–V–I</b> (Dm7–G7–Cmaj7 in C) is the core move of jazz and much of soul and pop: each chord root falls a 5th to the next, and the V7 resolves to I.</p>`,
  chords:['Cmaj7','Fmaj7','Am7','Em7','Dm7','G7','D7'],
  guitar:{core:'Open seventh shapes: Cmaj7, Fmaj7, Am7, Em7, Dm7, G7. Then ii–V–I in C: Dm7 → G7 → Cmaj7, two bars each at 70 bpm.',
          stretch:'Ain\'t No Sunshine\'s Am7–Em7–G loop with a soft fingerpicked pattern.'},
  piano:{core:'Play Cmaj7, Dm7, G7 in root position. Then "shell voicings": left hand root + 7th, right hand the 3rd. ii–V–I in C, then in F (Gm7–C7–Fmaj7).',
         stretch:'Voice-led ii–V–I: Dm7 (F-A-C) → G7 (F-B-D) → Cmaj7 (E-G-B). Only one or two notes move each time.'},
  voice:{core:'Sing seventh-chord arpeggios (1-3-5-7 and back) with the trainer: major 7 then minor 7. The 7th is the note that strains; aim for it deliberately.',
         stretch:'Sing the 3rd and 7th of each chord in a ii–V–I as you play it. These are the "guide tones" jazz singers follow.'},
  voiceTrainers:[{kind:'seq',label:'Major 7 arpeggio',fit:true,rel:[0,4,7,11,7,4,0]},{kind:'seq',label:'Minor 7 arpeggio',fit:true,rel:[0,3,7,10,7,3,0]}],
  pianoTrainers:[{kind:'seq',label:'Cmaj7, Dm7, G7 arpeggios',pcs:['C','E','G','B','D','F','A','C','G','B','D','F']}],
  guitarTrainers:[],
  quiz:['seventh','iivi'], ear:{qualities:['maj7','min7','dom7']}, earLabel:'Major 7, minor 7 or dominant 7?',
  songs:[
    {t:"Ain't No Sunshine",a:'Bill Withers',g:'Soul',prog:'Am7–Em7–G7 (A minor)',use:'Guitar: soft minor-7 colours. Voice: narrow range and sustained notes; great for control.'},
    {t:"Isn't She Lovely",a:'Stevie Wonder',g:'Soul / funk',prog:'C#m7–F#7–B–E loop (ii–V-style motion)',use:'Piano: seventh-chord loop. Voice: rhythmic, joyful melody.'},
    {t:'Fly Me to the Moon',a:'Bart Howard / Frank Sinatra',g:'Jazz standard',prog:'Chain of ii–V–I moves around the circle of fifths',use:'Stretch. Piano: shell voicings. Voice: classic crooner range.'},
    {t:'Autumn Leaves',a:'Joseph Kosma',g:'Jazz standard',prog:'ii–V–I in major then in the relative minor',use:'Piano: the best ii–V–I workout there is. Voice: slow, singable melody.'}
  ]
},
{
  id:'u11', stage:'Stage 3 · Colour and groove', title:'Capo, transposing and finding your key',
  concept:`<p>A <b>capo</b> raises every open string by one half step per fret. You keep playing the same <i>shapes</i>, but the <i>sounding</i> chords move up: a G shape with capo 2 sounds as A. Guitarists use capos to put a song in a singer's key while keeping easy open shapes.</p>
  <p><b>Transposing</b> means moving every note or chord by the same interval. Because you now think in Roman numerals, it is mechanical: I–V–vi–IV in C (C G Am F) up 2 half steps is D A Bm G.</p>
  <p><b>Finding your key:</b> most songs' original keys suit the original singer, not you. Measure your comfortable range (use the range finder in Tools), find the song's highest and lowest notes, and transpose until they fit. If the chorus strains, move down 2–3 half steps; if the verse growls, move up.</p>`,
  chords:['G','C','D','Em','Em7','Dsus4'],
  guitar:{core:'Play a G–C–D–G loop with no capo, then capo 2 (sounds A–D–E–A), capo 4, capo 7. Say the sounding chord each time.',
          stretch:'Wonderwall shapes (Em7 G Dsus4 A7sus4) at capo 2; Here Comes the Sun with D-shapes at capo 7.'},
  piano:{core:'Pick any song from earlier units and play its chords in two different keys. Work out the second key from the Roman numerals, not by trial and error.',
         stretch:'Accompany yourself on piano in the key the range finder says suits you best.'},
  voice:{core:'Use the range finder: slide down to your lowest comfortable note, then up to your highest. Record both. Then pitch-match across the whole range.',
         stretch:'Take one song you struggle with, find its highest note, and transpose it until that note sits 2 half steps below your top.'},
  voiceTrainers:[{kind:'range',label:'Range finder'},{kind:'match',count:10}],
  pianoTrainers:[{kind:'seq',label:'Ode to Joy in G',pcs:['B','C','D','C','B','A','G','A','B','A','B','C','D','C','B','A','G','A','B','A','G']}],
  guitarTrainers:[],
  quiz:['capo','transpose'], ear:{intervals:[1,2,3,4,5,7,9,10,12]}, earLabel:'Interval review (all)',
  songs:[
    {t:'Here Comes the Sun',a:'The Beatles',g:'Pop / folk',prog:'I–IV–V with a few extras; D shapes at capo 7 (sounds A)',use:'Guitar: capo and fingerpicked melody. Voice: bright, mid-high range; transpose if needed.'},
    {t:'Wonderwall',a:'Oasis',g:'Britpop',prog:'Em7–G–Dsus4–A7sus4, capo 2',use:'Guitar: the capo-and-drone-strings sound. Voice: narrow, steady melody.'},
    {t:'Fast Car',a:'Tracy Chapman',g:'Folk / pop',prog:'Repeating riff over C–G–Em–D shapes, capo 2',use:'Guitar: fingerpicked riff. Voice: a low-to-high climb into the chorus.'},
    {t:"Free Fallin'",a:'Tom Petty',g:'Rock',prog:'I–IV with sus chords, capo 3',use:'Guitar: sus4 colour over a simple I–IV. Voice: falsetto chorus; know your range.'}
  ]
},
{
  id:'u12', stage:'Stage 3 · Colour and groove', title:'Song form and accompanying yourself',
  concept:`<p>Most songs are built from a few labelled sections: <b>intro</b>, <b>verse</b> (story, same music with different words), <b>pre-chorus</b> (build), <b>chorus</b> (the hook; same words each time), <b>bridge</b> (contrast, usually once), <b>outro</b>. Map a song's sections and chords before learning it; most are 2–3 short loops.</p>
  <p><b>Singing while playing</b> is a coordination skill, learned in stages:</p>
  <p>1. Automate the instrument part until you can play it while talking. 2. Speak the lyrics in rhythm over it. 3. Sing over it with a simplified strum (one down-strum per bar). 4. Restore the full pattern. If singing breaks your playing, go back a stage; this is normal.</p>
  <p>Arranging for two instruments: guitar gives rhythm and drive; piano gives sustain, bass lines and broken chords. With voice on top, leave space: neither instrument should play the melody.</p>`,
  chords:['C','Am','F','G','A','D','E'],
  guitar:{core:'Pick one song below. Map its sections. Play the full song through with a simplified strum while speaking the lyrics, then singing them.',
          stretch:'Full strum pattern while singing. Record yourself on the iPad and listen back for timing drift.'},
  piano:{core:'Broken-chord accompaniment (left hand root, right hand 1-5-8-5 pattern) for a four-chord song while you sing.',
         stretch:'Arrange one song: verse on guitar, chorus on piano, same key.'},
  voice:{core:'Mixed interval drill, then sing a complete song with your own accompaniment. Record it. Compare pitch against the trainer on the hardest phrase.',
         stretch:'Harmony: sing a 3rd above a melody you know (start with Twinkle Twinkle).'},
  voiceTrainers:[{kind:'interval',label:'Mixed intervals',intervals:[3,4,5,7,12],count:10},{kind:'seq',label:'Twinkle Twinkle',fit:true,midi:[60,60,67,67,69,69,67,65,65,64,64,62,62,60]}],
  pianoTrainers:[{kind:'seq',label:'Twinkle Twinkle',pcs:['C','G','A','G','F','E','D','C','G','F','E','D','G','F','E','D']}],
  guitarTrainers:[],
  quiz:['diatonic','transpose','twelvebar'], ear:{intervals:[3,4,5,7,9,12]}, earLabel:'Interval review',
  songs:[
    {t:'Hallelujah',a:'Leonard Cohen / Jeff Buckley',g:'Folk / ballad',prog:'C–Am–C–Am–F–G–C–G in 12/8; the lyric describes the chords',use:'Guitar fingerpicked or piano broken chords while singing. Map verse vs chorus.'},
    {t:'Take Me Home, Country Roads',a:'John Denver',g:'Country / folk',prog:'I–vi–V–IV verse, I–V–vi–IV chorus (G Em D C / G D Em C)',use:'Guitar + voice: the full sing-and-strum song.'},
    {t:'Hey Jude',a:'The Beatles',g:'Pop / rock',prog:'Verse I–V–V7–I then IV–I–V–I (F C C7 F, Bb F C F); long I–♭VII–IV–I coda',use:'Piano: the classic accompaniment. Voice: a long song; pacing and stamina.'},
    {t:'Three Little Birds',a:'Bob Marley',g:'Reggae',prog:'I–IV–V (A D E)',use:'Guitar: reggae off-beat "skank" (strum only on the &s). Voice: relaxed, easy range.'}
  ]
}
];

// Melodies (midi, C-based where relevant) for song melody practice
const MELODIES = {
  'Frère Jacques':[60,62,64,60,64,65,67,67,69,67,65,64,60,60,55,60],
  'Ode to Joy':[64,65,67,65,64,62,60,62,64,62,64,65,67,65,64,62,60,62,64,62,60],
  'Joy to the World':[72,71,69,67,65,64,62,60],
  'Twinkle Twinkle':[60,67,69,67,65,64,62,60,67,65,64,62,67,65,64,62,60,67,69,67,65,64,62,60],
  'Amazing Grace':[62,67,71,67,71,69,67,64,62,62,67,71,67,71,69,74,71,74,71,67,62,64,67,64,62,62,67,71,67,71,69,67]
};

// Guitar chord shapes: strings low E → high e. -1 = muted, 0 = open.
const GUITAR_SHAPES = {
  'G':[3,2,0,0,0,3],'C':[-1,3,2,0,1,0],'D':[-1,-1,0,2,3,2],'Em':[0,2,2,0,0,0],'Am':[-1,0,2,2,1,0],
  'E':[0,2,2,1,0,0],'A':[-1,0,2,2,2,0],'Dm':[-1,-1,0,2,3,1],'F':[-1,-1,3,2,1,1],
  'E7':[0,2,0,1,0,0],'A7':[-1,0,2,0,2,0],'D7':[-1,-1,0,2,1,2],'G7':[3,2,0,0,0,1],'B7':[-1,2,1,2,0,2],
  'Am7':[-1,0,2,0,1,0],'Em7':[0,2,0,0,0,0],'Dm7':[-1,-1,0,2,1,1],'Cmaj7':[-1,3,2,0,0,0],'Fmaj7':[-1,-1,3,2,1,0],
  'Dsus4':[-1,-1,0,2,3,3],'E5':[0,2,2,-1,-1,-1],'A5':[-1,0,2,2,-1,-1],'D5':[-1,-1,0,2,3,-1],'G5':[3,5,5,-1,-1,-1]
};
