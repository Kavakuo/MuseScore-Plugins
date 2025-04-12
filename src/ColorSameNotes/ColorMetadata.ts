export class ColorMetadata {
  pitch: number;
  startTick: any;
  endTick: any;
  colorIdx: any;
  constructor(pitch: number, startTick: number, endTick: number, colorIdx: number) {
    this.pitch = pitch % 12;
    this.startTick = startTick;
    this.endTick = endTick;

    this.colorIdx = colorIdx;
  }

  toString() {
    return `Color: ${this.colorIdx},  pitch: ${this.pitch}, start: ${this.startTick} (${this.startTick / (4 * 480)}), end: ${this.endTick} (${this.endTick / (4 * 480)})`;
  }
}
