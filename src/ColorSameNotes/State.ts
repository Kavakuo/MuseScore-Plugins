import { formatTick, getFirstSegmentOfMeasure, getLastSegmentOfMeasure } from '../lib/utils/utils';
import { Chord } from './Chord';
import { ColorMetadata } from './ColorMetadata';

export const COLORS = [
  // "#ff0000",
  // "#00ff00",
  // "#0000ff",
  // "#FF00FF",
  // "#FF9E00",
  // "#00FFFE"

  "#00D64D",
  "#D000E5",
  "#16CBCB",
  "#DDA100",
  "#0563e0",
  "#A5C51B",
  "#a2a2a2",
  "#c5001b"
];
export class State {
  chords: Chord[];
  colors: ColorMetadata[];
  resetColor: boolean = false
  updateStateOnly: boolean = false
  private selectionTick: number = -1
  private synchedCursor: MuseScore.Cursor | undefined = undefined


  constructor() {
    this.chords = [];
    this.colors = [];
  }
  
  enableAutoUpdate() {
    console.log("Enable Auto Update")
    this.synchedCursor = curScore.newCursor()
    this.synchedCursor.inputStateMode = 1
  }

  triggerScan() {
    const nSelectionTick = this.synchedCursor!.tick
    if (nSelectionTick != this.selectionTick) {
      console.log(`SynchedCursor changed. Old: ${formatTick(this.selectionTick)}, New: ${formatTick(nSelectionTick)}`)
    }
    this.selectionTick = nSelectionTick
  }

  triggerColor() {
    if (curScore.selection.elements.length == 0) return

    // Dummy start/end-cmd, otherwise automatic coloring
    // does not work correctly when the pitch of a note is changed.
    curScore.startCmd()
    curScore.endCmd(true)
    
    this.colorMeasureAtTick(this.selectionTick)
  }

  
  playingChordsAt(tick: number) {
    return this.chords.filter(i => i.isPlayingAt(tick));
  }

  resetState() {
    this.chords = []
    this.colors = []
  }


  clearState(fromTick: number, toTick: number) {
    this.chords = this.chords.filter(i => !(i.startTick >= fromTick && i.endTick <= toTick))
    this.colors = this.colors.filter(i => !(i.startTick >= fromTick && i.endTick <= toTick))
    // console.log("Clear State", fromTick, toTick)
    // console.log("Chords")
    // this.chords.forEach(i => console.log("\t" + i.toString()));
    // console.log("Colors")
    // this.colors.forEach(i => console.log("\t" + i.toString()));
  }


  getColor(pitch: number, chords: Chord[]) {
    const start = Math.min.apply(null, chords.map(i => i.startTick));
    const end = Math.max.apply(null, chords.map(i => i.endTick));

    
    this.colors.sort((a, b) => a.endTick - b.endTick)
    
    // console.log("Colors:");
    // this.colors.forEach(i => console.log("\t" + i.toString()));

    const matchingColor = this.colors.filter(i => i.startTick <= start && i.endTick > start);

    // console.log(`MatchingColors ${formatTick(start)} - ${formatTick(end)}:`);
    // matchingColor.forEach(i => console.log("\t" + i.toString()));

    const samePitch = matchingColor.find(i => pitch % 12 == i.pitch);
    if (samePitch) {
      samePitch.startTick = start;
      samePitch.endTick = end;
      //console.log("Same pitch == Same color")
      return COLORS[samePitch.colorIdx];
    }

    // find colors used immediately before
    const colorReversed = this.colors.slice(0).reverse()
    const colorBeforeIdx = this.colors.slice(0).reverse().findIndex(i => i.endTick <= start)
    const colorRIdx = this.colors.length - 1 - colorBeforeIdx

    // console.log(`colorReverseIdx = ${colorBeforeIdx}`)
    // console.log(`colorBeforeIdx = ${colorRIdx}`)

    const colorsBefore: number[] = []
    if (colorBeforeIdx > -1) {
      const colorBefore = colorReversed[colorBeforeIdx]
      colorsBefore.push(...colorReversed.filter((col, idx) => idx > colorBeforeIdx && col.startTick <= colorBefore.startTick && col.endTick == colorBefore.endTick).map(i => i.colorIdx).concat(colorBefore.colorIdx))
    }

    const usedIdx = matchingColor.map(i => i.colorIdx).concat(colorsBefore);
    let colorIdx = 0;
    let f = false
    for (let i = 0; i < COLORS.length; i++) {
      if (usedIdx.indexOf(i) == -1) {
        colorIdx = i;
        f = true
        break;
      }
    }

    if (!f) console.log("too few colors...")

    const colorStr = COLORS[colorIdx];
    this.colors.push(new ColorMetadata(pitch % 12, start, end, colorIdx));
    return colorStr;
  }


  colorSelection() {
    const firstSegment = getFirstSegmentOfMeasure(curScore.selection.startSegment)!
    const lastSegment = getLastSegmentOfMeasure(curScore.selection.endSegment)!
  
    const cursor = curScore.newCursor();
    cursor.rewindToTick(firstSegment.tick);
    let segment = cursor.segment;
  
  
    curScore.startCmd()
    
    while (segment && segment.tick < lastSegment.tick) {
      this.colorMeasureAtTick(segment.tick)
  
      cursor.nextMeasure()
      segment = cursor.segment
    }
  
    curScore.endCmd(false)
  }


  colorMeasureAtTick(tick: number) {    
    const cursor = curScore.newCursor()
    cursor.rewindToTick(tick)

    let measure: MuseScore.Measure | null = cursor.measure
    while (measure?.firstSegment && measure.firstSegment.tick > tick) {
      measure = measure.prevMeasure;
    }

    let segment = measure?.firstSegment ? measure.firstSegment : curScore.firstSegment()
    const lastSegment = measure?.lastSegment ? measure.lastSegment : curScore.lastSegment!

    this.clearState(segment.tick, lastSegment.tick)
    console.log(`Process from ${formatTick(segment.tick)} to ${formatTick(lastSegment.tick)}; input ${formatTick(tick)}`)

  
    while (segment && segment.tick < lastSegment.tick) {
      //console.log("----------")
      //console.log(`Process segment at tick: ${formatTick(segment.tick)}`)
      for (var track = 0; track < curScore.nstaves * 4; track++) {
        var elem = segment.elementAt(track)
        var staff = Math.floor(track / 4)
        var voice = track % 4
  
        if (!elem || elem.type != Element.CHORD) {
          continue
        }
  
        const chord = <MuseScore.Chord>elem
  
        const playingChords = this.playingChordsAt(segment.tick)
        //console.log(`Process staff ${staff} voice ${voice}`)
        // console.log("PlayingChords: " + playingChords.length + "/" + m.chords.length)
        // playingChords.forEach(i => console.log("\t" + i.toString()))
  
        for (let noteIdx=0; noteIdx < chord.notes.length; noteIdx++) {
          const note = chord.notes[noteIdx]
          if (!this.updateStateOnly) {
            note.color = "#000000"
            if (this.resetColor) continue
          }
          
          //console.log(`${formatTick(segment.tick)} Note ${note.pitch % 12} ${staff}.${voice}`) 
  
          const matchingChords = playingChords.filter(i => i.isNoteInChord(note.pitch) && i.staff != staff)
  
          if (matchingChords.length == 0 ) {
            //console.log("Skip, no matching notes")
            continue
          }
  
          //console.log("MatchingChords: " + matchingChords.length + "/" + playingChords.length)
          //matchingChords.forEach(i => console.log("\t" + i.toString()))
  
          const colorNotes = matchingChords.map(i => i.note(note.pitch)).concat(note)
          const color = this.getColor(note.pitch, matchingChords.concat(new Chord(segment.tick, staff, chord)))
          
          //console.log(`Set color ${COLORS.findIndex(i => i == color)} (Pitch: ${note.pitch % 12}, Segement ${staff}.${voice}.${formatTick(segment.tick)})`)

          if (this.updateStateOnly) {
            continue
          }

          for (let i=0; i<colorNotes.length; i++) {
            const colorNote = colorNotes[i]!  
            colorNote.color = color            
          }
        }
  
        this.chords.push(new Chord(segment.tick, staff, chord))
      }
      
      segment = segment.next!;
    }

  }
}
