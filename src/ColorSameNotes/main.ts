import { State } from './State'

const state = new State()

// "export" does not work, qml JS Engine does not understand it.
// Therefore, the function is assigned to a global variable
// that is declared by the bundler with the banner feature (see build.mjs).
// If the function is not assigned to a global variable, the bundled output
// would be empty, since no exports are defined.
main = function() {

  const firstSegment = curScore.firstSegment()
  const lastSegment = curScore.lastSegment
  state.resetState()


  if (!firstSegment || !lastSegment) {
    console.log("Error, undefined segments")
    return
  }


  const cursor = curScore.newCursor();
  cursor.rewindToTick(firstSegment.tick);
  let segment = cursor.segment;


  curScore.startCmd()
  curScore.endCmd(true)
  
  while (segment && segment.tick < lastSegment.tick) {

    state.colorMeasureAtTick(segment.tick)

    cursor.nextMeasure()
    segment = cursor.segment
  }
}








