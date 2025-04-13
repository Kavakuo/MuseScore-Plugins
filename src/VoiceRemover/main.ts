import { getFirstSegmentOfMeasure, getLastSegmentOfMeasure } from '../utils/utils'

class _State {
  public mainVoice: number = 1
  public targetVoice: number = -1  
  public alwaysKeepMainVoice: boolean = true
}

const State = new _State()


// "export" does not work, qml JS Engine does not understand it.
// Therefore, the function is assigned to a global variable
// that is declared by the bundler with the banner feature (see build.mjs).
// If the function is not assigned to a global variable, the bundled output
// would be empty, since no exports are defined.
main = function() {
  let fullScore = curScore.selection.elements.length === 0 || !curScore.selection.isRange
  const startStaff = fullScore ? 0 : curScore.selection.startStaff
  const endStaff = fullScore ? curScore.staves.length - 1 : curScore.selection.endStaff - 1

  const firstSegment = fullScore ? curScore.firstSegment() : getFirstSegmentOfMeasure(curScore.selection.startSegment)
  const lastSegment = fullScore ? curScore.lastSegment : getLastSegmentOfMeasure(curScore.selection.endSegment ?? curScore.lastSegment)


  if (!firstSegment || !lastSegment) {
    console.log("Error, undefined segments", firstSegment?.tick, lastSegment?.tick)
    return
  }

  console.log(`startStaff: ${startStaff}, endStaff: ${endStaff}, firstSegment: ${firstSegment.tick / division / 4}, lastSegment: ${lastSegment.tick / division / 4}`)
  console.log(`mainVoice: ${State.mainVoice}, targetVoice: ${State.targetVoice}`)

  let currentSegment = firstSegment

  let cont = true
  const cursor = curScore.newCursor()
  cursor.rewindToTick(currentSegment?.tick)
  
  curScore.startCmd()

  while (cont && currentSegment.tick < lastSegment.tick) {
    for (let staff = startStaff; staff <= endStaff; staff++) {
      const hasOtherVoice = hasOtherVoiceInMeasure(currentSegment.tick, staff)
      if (hasOtherVoice || !State.alwaysKeepMainVoice) {
        deleteOtherVoices(currentSegment.tick, staff, State.targetVoice)
      }
    }

    cont = cursor.nextMeasure()
    currentSegment = cursor.segment
  }


  curScore.endCmd()
}


function deleteOtherVoices(tick: number, staffIdx: number, keepVoice: number) {
  const cursor = curScore.newCursor()

  for (let track = staffIdx * 4; track < staffIdx * 4 + 4; track++) {
    cursor.rewindToTick(tick)
    let lastMeasureTick = cursor.measure.lastSegment!.tick

    if (track == staffIdx * 4 + keepVoice) continue

    let segment = cursor.segment
    let cont = true
    while (cont && segment.tick < lastMeasureTick) {
      const elem = segment.elementAt(track)
      if (elem && (elem.type == Element.CHORD)) {
        console.log(`Remove element from staff: ${staffIdx} voice: ${track % 4} tick: ${segment.tick / division / 4}`)
        removeElement(elem)
      }

      cont = cursor.next()
      segment = cursor.segment
    }
  }

}


function hasOtherVoiceInMeasure(tick: number, staffIdx: number) {
  const cursor = curScore.newCursor()

  for (let track = staffIdx * 4; track < staffIdx * 4 + 4; track++) {
    if (track === staffIdx * 4 + State.mainVoice) continue

    cursor.rewindToTick(tick)
    let lastMeasureTick = cursor.measure.lastSegment!.tick

    let segment = cursor.segment
    let cont = true
    while (cont && segment.tick < lastMeasureTick) {
      const elem = segment.elementAt(track)
      if (elem && (elem.type == Element.CHORD)) {
        console.log(`Found other voice in: ${track % 4} at: ${tick / division / 4}`)
        return true
      }

      cont = cursor.next()
      segment = cursor.segment
    }
  }

  return false
}


