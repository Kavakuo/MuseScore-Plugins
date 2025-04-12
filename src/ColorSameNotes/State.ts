import { Chord } from './Chord';
import { ColorMetadata } from './ColorMetadata';

export const COLORS = [
  // "#ff0000",
  "#00ff00",
  "#0000ff",
  "#FF00FF",
  "#FF9E00",
  "#00FFFE"
];
export class State {
  chords: Chord[];
  colors: ColorMetadata[];
  lastAssignedColorIdx: number;

  constructor() {
    this.chords = [];
    this.colors = [];

    this.lastAssignedColorIdx = -1;
  }

  playingChordsAt(tick: number) {
    return this.chords.filter(i => i.isPlayingAt(tick));
  }


  getColor(pitch: number, chords: Chord[]) {
    const start = Math.min.apply(null, chords.map(i => i.startTick));
    const end = Math.max.apply(null, chords.map(i => i.endTick));

    console.log("Colors:");
    this.colors.forEach(i => console.log("\t" + i.toString()));

    const matchingColor = this.colors.filter(i => i.startTick <= start && i.endTick > start);

    console.log(`MatchingColors ${start} - ${end}:`);
    matchingColor.forEach(i => console.log("\t" + i.toString()));

    const samePitch = matchingColor.find(i => pitch % 12 == i.pitch);
    if (samePitch) {
      samePitch.startTick = start;
      samePitch.endTick = end;
      return COLORS[samePitch.colorIdx];
    }


    const usedIdx = matchingColor.map(i => i.colorIdx);
    let colorIdx = 0;
    for (let i = 0; i < COLORS.length; i++) {
      if (usedIdx.indexOf(i) == -1 && i != this.lastAssignedColorIdx) {
        colorIdx = i;
        break;
      }
    }

    const colorStr = COLORS[colorIdx];
    this.colors.push(new ColorMetadata(pitch % 12, start, end, colorIdx));
    this.lastAssignedColorIdx = colorIdx;
    return colorStr;
  }
}
