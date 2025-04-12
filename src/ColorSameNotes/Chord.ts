
export class Chord {
  chord: MuseScore.Chord
  startTick: number
  staff: number
  endTick: number
  notes: MuseScore.Note[]


  constructor(startTick: number, staff: number, chord: MuseScore.Chord) {
    this.chord = chord
    this.startTick = startTick
    this.staff = staff
    this.endTick = startTick + chord.actualDuration.ticks
    this.notes = []

    for (const i in chord.notes) {
      this.notes.push(chord.notes[i])
    }

  }


  isNoteInChord(pitch: number) {
    for (const i of this.notes) {
      if (i.pitch % 12 === pitch % 12) return true
    }
    return false
  }

  note(pitch: number) {
    for (const i of this.notes) {
      if (i.pitch % 12 === pitch % 12) return i
    }
    return null
  }

  isPlayingAt(tick: number) {
    return tick >= this.startTick && tick < this.endTick
  }

  toString() {
    let a = this.notes.map(i => `${i.pitch % 12}`).join(",")
    return `staff: ${this.staff}, pitch: ${a}, start: ${this.startTick} (${this.startTick / (4 * 480)}), end: ${this.endTick} (${this.endTick / (4 * 480)})`
  }
}
