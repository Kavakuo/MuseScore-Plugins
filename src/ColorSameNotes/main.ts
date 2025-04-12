import { Chord } from './Chord'
import { State, COLORS } from './State'


// "export" does not work, qml JS Engine does not understand it.
// Therefore, the function is assigned to a global variable
// that is declared by the bundler with the banner feature (see build.mjs).
// If the function is not assigned to a global variable, the bundled output
// would be empty, since no exports are defined.
main = function(reset=false) {
  var fullScore = !curScore.selection.elements.length;
  var cursor = curScore.newCursor();
  cursor.rewind(0);
  
  curScore.startCmd();
  
  var cont = true;
  const state = new State()
  while (cont) {
    var segment = cursor.segment;
    console.log("----------")
    console.log("Process segment at tick: " + segment.tick + " (" + segment.tick / (4*480) + ")")
    for (var track = 0; track < curScore.ntracks; track++) {
      var elem = segment.elementAt(track)
      var staff = Math.floor(track / 4)
      var voice = track % 4

      if (elem && elem.type == Element.CHORD) {
        const chord = <MuseScore.Chord>elem

        const playingChords = state.playingChordsAt(segment.tick)
        console.log(`Process staff ${staff} voice ${voice}`)
        // console.log("PlayingChords: " + playingChords.length + "/" + m.chords.length)
        // playingChords.forEach(i => console.log("\t" + i.toString()))

        for (let noteIdx=0; noteIdx < chord.notes.length; noteIdx++) {
          const note = chord.notes[noteIdx]
          note.color = "#000000"
          if (reset) continue

          const matchingChords = playingChords.filter(i => i.isNoteInChord(note.pitch) && i.staff != staff)

          if (matchingChords.length > 0 ) {
            console.log("MatchingChords: " + matchingChords.length + "/" + playingChords.length)
            matchingChords.forEach(i => console.log("\t" + i.toString()))

            const colorNotes = matchingChords.map(i => i.note(note.pitch)).concat(note)
            const color = state.getColor(note.pitch, matchingChords.concat(new Chord(segment.tick, staff, chord)))
            console.log(`Set color ${COLORS.findIndex(i => i == color)} (Pitch: ${note.pitch % 12})`)

            for (let i=0; i<colorNotes.length; i++) {
              const colorNote = colorNotes[i]!  
              colorNote.color = color
            }
          } else {
            console.log("Skip, no matching notes")
          }
          
        }

        state.chords.push(new Chord(segment.tick, staff, chord))
      }
    }
    
    cont = cursor.next();
  }
  
  curScore.endCmd();
}

