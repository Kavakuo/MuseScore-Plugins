namespace MuseScore {


    // Base class for score elements
    export interface ScoreElement {
        name: string;
        userName(): string;
        is(other: ScoreElement): boolean;
    }

    // Core element base class
    export interface EngravingItem extends ScoreElement {
        parent: EngravingItem | null;
        staff: Staff | null; 
        offsetX: number;
        offsetY: number;
        posX: number;
        posY: number;
        pagePos: Point;
        bbox: Rect;
        color: string;
        visible: boolean;
        z: number;
        type: ElementType
        
        clone(): EngravingItem;
        subtypeName(): string;
    }

    export interface Point {
        x: number;
        y: number;
    }

    export interface Rect {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    export interface Note extends EngravingItem {
        accidental: EngravingItem | null;
        accidentalType: AccidentalType;
        dots: EngravingItem[];
        elements: EngravingItem[];
        playEvents: PlayEvent[];
        tieBack: Tie | null;
        tieForward: Tie | null;
        firstTiedNote: Note | null;
        lastTiedNote: Note | null;
        noteType: NoteType;
        pitch: number;
        tpc1: number;
        tpc2: number;
        tpc: number;

        add(item: EngravingItem): void;
        remove(item: EngravingItem): void;
        createPlayEvent(): PlayEvent;
    }

    export interface Fraction {
        numerator: number;
        denominator: number;
        ticks: number;
        str: string;
    }

    export interface Chord extends EngravingItem {
        /** Nominal duration of this element as a fraction of whole note length */
        duration: Fraction;
        /** Global duration taking into account parent tuplets */
        globalDuration: Fraction;
        /** Actual duration taking into account tuplets and time signatures */
        actualDuration: Fraction;
        /** Parent tuplet if any */
        tuplet: Tuplet | null;
        
        graceNotes: Chord[];
        notes: Note[];
        stem: EngravingItem | null;
        stemSlash: EngravingItem | null;
        hook: EngravingItem | null;
        noteType: NoteType;
        playEventType: PlayEventType;
        lyrics: EngravingItem[];
        beam: EngravingItem | null;

        add(item: EngravingItem): void;
        remove(item: EngravingItem): void;
    }

    export interface ChordRest extends EngravingItem {
        /** Nominal duration of this element as a fraction of whole note length */
        duration: Fraction;
        /** Global duration taking into account parent tuplets */
        globalDuration: Fraction;
        /** Actual duration taking into account tuplets and time signatures */
        actualDuration: Fraction;
        /** Parent tuplet if any */
        tuplet: Tuplet | null;

        lyrics: EngravingItem[];
        beam: EngravingItem | null;
    }

    export interface Cursor {
        track: number;
        staffIdx: number;
        voice: number;
        filter: number;
        tick: number;
        time: number;
        tempo: number;
        keySignature: number;
        score: Score;
        element: EngravingItem | null;
        segment: Segment;
        measure: Measure;
        stringNumber: number;

        rewind(mode: RewindMode): void;
        rewindToTick(tick: number): void;
        next(): boolean;
        nextMeasure(): boolean;
        prev(): boolean;
        add(item: EngravingItem): void;
        addNote(pitch: number, addToChord?: boolean): void;
        addRest(): void; 
        setDuration(numerator: number, denominator: number): void;
    }

    export enum RewindMode {
        SCORE_START,
        SELECTION_START, 
        SELECTION_END
    }

    export interface Score extends ScoreElement {
        composer: string;
        title: string;
        duration: number;
        excerpts: Excerpt[];
        firstMeasure: Measure | null;
        firstMeasureMM: Measure | null;
        harmonyCount: number;
        hasHarmonies: boolean;
        hasLyrics: boolean;
        keysig: number;
        lastMeasure: Measure | null;
        lastMeasureMM: Measure | null;
        lastSegment: Segment | null;
        lyricCount: number;
        nmeasures: number;
        npages: number;
        nstaves: number;
        ntracks: number;
        parts: Part[];
        selection: Selection;
        pageNumberOffset: number;
        staves: Staff[];
        lyricist: string;
        mscoreVersion: string;
        mscoreRevision: string;
        scoreName: string;
        style: any; // Style object

        newCursor(): Cursor;
        appendPart(instrumentId: string): void;
        appendPartByMusicXmlId(instrumentMusicXmlId: string): void;
        appendMeasures(n: number): void;
        addText(type: string, text: string): void;
        extractLyrics(): string;
        startCmd(actionName?: string): void;
        endCmd(rollback?: boolean): void;
        createPlayEvents(): void;
        
        /**
         * Returns the value of the metadata tag with the given name
         * @param tag The name of the metadata tag to retrieve
         * @returns The value of the metadata tag
         */
        metaTag(tag: string): string;
        
        /**
         * Sets the value of the metadata tag with the given name
         * @param tag The name of the metadata tag to set
         * @param val The value to set for the metadata tag
         */
        setMetaTag(tag: string, val: string): void;
        
        /**
         * Returns the first segment in the score
         * @returns The first segment
         */
        firstSegment(): Segment;
    }

    export interface PlayEvent {
        pitch: number;
    }

    export interface Part extends ScoreElement {
        startTrack: number;
        endTrack: number;
        instrumentId: string;
        harmonyCount: number;
        hasDrumStaff: boolean;
        hasPitchedStaff: boolean;
        hasTabStaff: boolean;
        lyricCount: number;
        midiChannel: number;
        midiProgram: number;
        longName: string;
        shortName: string;
        partName: string;
        show: boolean;
        instruments: Instrument[];
    }

    export interface Measure extends EngravingItem {
        firstSegment: Segment | null;
        lastSegment: Segment | null;
        nextMeasure: Measure | null;
        nextMeasureMM: Measure | null;
        prevMeasure: Measure | null;
        prevMeasureMM: Measure | null;
        elements: EngravingItem[];
    }

    export interface Segment extends EngravingItem {
        /**
         * The list of annotations for this segment. Includes articulations, 
         * staff/system/expression text and other annotation elements.
         */
        annotations: EngravingItem[];

        /**
         * Next segment in this measure. Returns null if there is no such segment.
         */
        nextInMeasure: Segment | null;

        /**
         * Next segment in the score. Does not stop at measure borders.
         * Returns null if this is the last segment in the score.
         */
        next: Segment | null;

        /**
         * Previous segment in this measure. Returns null if there is no such segment.
         */
        prevInMeasure: Segment | null;

        /**
         * Previous segment in the score. Does not stop at measure borders.
         * Returns null if this is the first segment in the score.
         */
        prev: Segment | null;

        /**
         * Type of this segment, a value from SegmentType enum.
         * Read-only property that cannot be modified by plugins.
         */
        readonly segmentType: SegmentType;

        /**
         * Current tick position for this segment, i.e. number of ticks 
         * from the beginning of the score to this segment.
         * Read-only property.
         */
        readonly tick: number;

        /**
         * Returns the element at the given track number.
         * @param track The track number to look up (0 is the first track in the first staff)
         * @returns The element at the specified track, or null if there is no such element
         */
        elementAt(track: number): EngravingItem | null;
    }

    export interface Staff extends ScoreElement {
        small: boolean;
        mag: number;
        color: string;
        playbackVoice1: boolean;
        playbackVoice2: boolean;
        playbackVoice3: boolean;
        playbackVoice4: boolean;
        staffBarlineSpan: number;
        staffBarlineSpanFrom: number;
        staffBarlineSpanTo: number;
        staffUserdist: number;
        part: Part;
    }

    export interface Instrument {
        instrumentId: string;
        longName: string;
        shortName: string;
        stringData: StringData | null;
        channels: Channel[];
        is(other: Instrument): boolean;
    }

    export interface StringData {
        strings: {pitch: number, open: boolean}[];
        frets: number;
    }

    export interface Channel {
        name: string;
        volume: number;
        pan: number;
        chorus: number; 
        reverb: number;
        mute: boolean;
        midiProgram: number;
        midiBank: number;
    }

    export interface Selection {
        /** All selected elements */
        elements: EngravingItem[];
        
        /**
         * Whether this selection covers a range of a score, as opposed to
         * a list of distinct elements.
         */
        isRange: boolean;
        
        /**
         * Start segment of selection, included. This property is valid
         * only for range selection.
         */
        startSegment: Segment | null;
        
        /**
         * End segment of selection, excluded. This property is valid
         * only for range selection.
         */
        endSegment: Segment | null;
        
        /**
         * First staff of selection, included. This property is valid
         * only for range selection.
         */
        startStaff: number;
        
        /**
         * End staff of selection, included. This property is valid
         * only for range selection.
         */
        endStaff: number;
        
        /**
         * Adds an element to the selection
         * @param element The element to select
         * @param add If true, adds to the existing selection; if false, replaces the selection
         * @returns true if successful
         */
        select(element: EngravingItem, add?: boolean): boolean;
        
        /**
         * Selects a range of the score
         * @param startTick Start tick of the selection
         * @param endTick End tick of the selection
         * @param startStaff First staff of the selection (inclusive)
         * @param endStaff Last staff of the selection (inclusive)
         * @returns true if successful
         */
        selectRange(startTick: number, endTick: number, startStaff: number, endStaff: number): boolean;
        
        /**
         * Removes an element from the selection
         * @param element The element to deselect
         * @returns true if successful
         */
        deselect(element: EngravingItem): boolean;
        
        /**
         * Clears the entire selection
         * @returns true if successful
         */
        clear(): boolean;
    }

    export interface Excerpt {
        partScore: Score;
        title: string;
        is(other: Excerpt): boolean;
    }

    export interface Tuplet extends EngravingItem {
        numberType: any;  // TODO: define enum
        bracketType: any; // TODO: define enum
        actualNotes: number;
        normalNotes: number;
        p1: any;  // TODO: define type
        p2: any;  // TODO: define type
        elements: EngravingItem[];
    }

    export interface Tie extends EngravingItem {
        // Base tie properties inherited from EngravingItem
    }
}

/** Current score, if any (read only) */
declare var curScore: MuseScore.Score;
declare function removeElement(element: MuseScore.EngravingItem): void
declare var main: any
declare module console {
  function log(...args: any[])
}

/** Number of MIDI ticks for 1/4 note (read only) */
declare const division: number

declare enum Element {
      INVALID,
      BRACKET_ITEM,
      PART,
      STAFF,
      SCORE,
      TEXT,
      LAYOUT_BREAK,
      MEASURE_NUMBER,
      MMREST_RANGE,
      INSTRUMENT_NAME,
      SLUR_SEGMENT,
      TIE_SEGMENT,
      LAISSEZ_VIB_SEGMENT,
      PARTIAL_TIE_SEGMENT,
      BAR_LINE,
      STAFF_LINES,
      SYSTEM_DIVIDER,
      STEM_SLASH,
      ARPEGGIO,
      ACCIDENTAL,
      LEDGER_LINE,
      STEM,
      HOOK,
      NOTE,
      SYMBOL,
      CLEF,
      KEYSIG,
      AMBITUS,
      TIMESIG,
      REST,
      MMREST,
      DEAD_SLAPPED,
      BREATH,
      MEASURE_REPEAT,
      TIE,
      LAISSEZ_VIB,
      PARTIAL_TIE,
      ARTICULATION,
      ORNAMENT,
      FERMATA,
      CHORDLINE,
      DYNAMIC,
      EXPRESSION,
      BEAM,
      LYRICS,
      FIGURED_BASS,
      FIGURED_BASS_ITEM,
      MARKER,
      JUMP,
      FINGERING,
      TUPLET,
      TEMPO_TEXT,
      STAFF_TEXT,
      SYSTEM_TEXT,
      SOUND_FLAG,
      PLAYTECH_ANNOTATION,
      CAPO,
      STRING_TUNINGS,
      TRIPLET_FEEL,
      REHEARSAL_MARK,
      INSTRUMENT_CHANGE,
      STAFFTYPE_CHANGE,
      HARMONY,
      FRET_DIAGRAM,
      HARP_DIAGRAM,
      BEND,
      STRETCHED_BEND,
      TREMOLOBAR,
      VOLTA,
      HAIRPIN_SEGMENT,
      OTTAVA_SEGMENT,
      TRILL_SEGMENT,
      LET_RING_SEGMENT,
      GRADUAL_TEMPO_CHANGE_SEGMENT,
      VIBRATO_SEGMENT,
      PALM_MUTE_SEGMENT,
      WHAMMY_BAR_SEGMENT,
      RASGUEADO_SEGMENT,
      HARMONIC_MARK_SEGMENT,
      PICK_SCRAPE_SEGMENT,
      TEXTLINE_SEGMENT,
      VOLTA_SEGMENT,
      PEDAL_SEGMENT,
      LYRICSLINE_SEGMENT,
      PARTIAL_LYRICSLINE_SEGMENT,
      GLISSANDO_SEGMENT,
      NOTELINE_SEGMENT,
      SYSTEM_LOCK_INDICATOR,
      SPACER,
      STAFF_STATE,
      NOTEHEAD,
      NOTEDOT,
      IMAGE,
      MEASURE,
      SELECTION,
      LASSO,
      SHADOW_NOTE,
      TAB_DURATION_SYMBOL,
      FSYMBOL,
      PAGE,
      HAIRPIN,
      OTTAVA,
      PEDAL,
      TRILL,
      LET_RING,
      GRADUAL_TEMPO_CHANGE,
      VIBRATO,
      PALM_MUTE,
      WHAMMY_BAR,
      RASGUEADO,
      HARMONIC_MARK,
      PICK_SCRAPE,
      TEXTLINE,
      TEXTLINE_BASE,
      NOTELINE,
      LYRICSLINE,
      PARTIAL_LYRICSLINE,
      GLISSANDO,
      BRACKET,
      SEGMENT,
      SYSTEM,
      CHORD,
      SLUR,
      HBOX,
      VBOX,
      TBOX,
      FBOX,
      ACTION_ICON,
      BAGPIPE_EMBELLISHMENT,
      STICKING,
      GRACE_NOTES_GROUP,
      FRET_CIRCLE,
      GUITAR_BEND,
      GUITAR_BEND_SEGMENT,
      GUITAR_BEND_HOLD,
      GUITAR_BEND_HOLD_SEGMENT,
      GUITAR_BEND_TEXT,
      TREMOLO_TWOCHORD,
      TREMOLO_SINGLECHORD,
      TIME_TICK_ANCHOR,
      PARENTHESIS,
      ROOT_ITEM,
      DUMMY,
      MAXTYPE
}

declare enum Segment {
  Invalid,
  BeginBarLine,
  HeaderClef,
  KeySig,
  Ambitus,
  TimeSig,
  StartRepeatBarLine,
  ClefStartRepeatAnnounce,
  KeySigStartRepeatAnnounce,
  TimeSigStartRepeatAnnounce,
  Clef,
  BarLine,
  Breath,
  TimeTick,
  ChordRest,
  ClefRepeatAnnounce,
  KeySigRepeatAnnounce,
  TimeSigRepeatAnnounce,
  EndBarLine,
  KeySigAnnounce,
  TimeSigAnnounce,
  All,
  BarLineType,
  CourtesyTimeSigType,
  CourtesyKeySigType,
  CourtesyClefType,
  TimeSigType,
  KeySigType,
  ClefType
}

