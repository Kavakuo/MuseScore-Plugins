
export function getFirstSegmentOfMeasure(segment: MuseScore.Segment | null) {
  let cont = true;
  while (cont) {
    let t = segment?.prevInMeasure;
    cont = !!t;
    if (t) {
      segment = t;
    }
  }
  return segment;
}

export function getLastSegmentOfMeasure(segment: MuseScore.Segment | null) {
  let cont = true;
  while (cont) {
    let t = segment?.nextInMeasure;
    cont = !!t;
    if (t) {
      segment = t;
    }
  }
  return segment;
}

export function formatTick(tick: number) {
  return `${tick / division} (${tick / division / 4})`
}
