import { t, toTypescript } from "structural";

function fixInstrument(channel: number, instrument: t.GetType<typeof Instrument>) {
  return {
    ...instrument,
    percussion: channel === 9 || channel === 10,
  };
}

function simplifyTempos(tempos: t.GetType<typeof Tempo>[]) {
  tempos.sort((a, b) => {
    if(a.ticks < b.ticks) return -1;
    if(b.ticks < a.ticks) return 1;
    return 0;
  });

  const simplified: t.GetType<typeof Tempo>[] = [];
  let lastTempo: t.GetType<typeof Tempo> | null = null;

  for(const tempo of tempos) {
    if(lastTempo && lastTempo.bpm === tempo.bpm) continue;
    if(lastTempo && lastTempo.ticks === tempo.ticks) continue;

    simplified.push(tempo);
    lastTempo = tempo;
  }

  return simplified;
}

export function toneToSimple(tone: t.GetType<typeof MidiSpec>): t.GetType<typeof SimpleMidiSpec> {
  return SimpleMidiSpec.slice({
    header: {
      name: tone.header.name,
      ppq: tone.header.ppq,
    },
    trackDefinitions: tone.tracks.filter(t => t.notes.length !== 0).map((track, id) => {
      return {
        id,
        name: track.name,
        channel: track.channel,
        instrument: fixInstrument(track.channel, track.instrument),
      };
    }),
    stream: tone.tracks.flatMap((track, id) => {
      return [
        ...tone.header.keySignatures.map(k => ({ ...k, type: "key" as const })),
        ...tone.header.timeSignatures.map(t => ({ ...t, type: "time" as const })),
        ...simplifyTempos(tone.header.tempos).map(t => ({ ...t, type: "tempo" as const })),

        ...Object.values(track.controlChanges || {}).flatMap(ccs => {
          return ccs.map(cc => {
            return {
              type: "cc" as const,
              track: id,
              number: cc.number,
              ticks: cc.ticks,
              value: cc.value,
            } satisfies t.GetType<typeof ControlChangeSpec>;
          });
        }),

        ...track.pitchBends.map(pb => {
          return {
            type: "pb" as const,
            track: id,
            ticks: pb.ticks,
            value: pb.value,
          };
        }),

        ...track.notes.map(note => {
          return {
            type: "note" as const,
            track: id,
            ...note,
          };
        }),
      ];
    }).sort((a, b) => {
      if(a.ticks < b.ticks) return -1;
      if(a.ticks > b.ticks) return 1;
      if(a.type === b.type) return 0;
      if(a.type === "time") return -1;
      if(b.type === "time") return 1;
      if(a.type === "tempo") return -1;
      if(b.type === "tempo") return 1;
      if(a.type === "key") return -1;
      if(b.type === "key") return 1;
      if(a.type === "cc") return -1;
      if(b.type === "cc") return 1;
      if(a.type === "pb") return -1;
      if(b.type === "pb") return 1;
      // tsc checks we handled all types above
      const _1: "note" = a.type;
      const _2: "note" = b.type;

      return 0;
    }),
  } satisfies t.GetType<typeof SimpleMidiSpec>);
}

export function simpleToTone(simple: t.GetType<typeof SimpleMidiSpec>): t.GetType<typeof MidiSpec> {
  function trackFilter<T extends { track: number }>(id: number, items: any[], type: t.Type<T>): T[] {
    return items.filter(item => item.track === id && type.guard(item));
  }

  const keySignatures = simple.stream.filter(item => KeySignature.guard(item));
  const tempos = simplifyTempos(simple.stream.filter(item => Tempo.guard(item)));
  const timeSignatures = simple.stream.filter(item => TimeSignature.guard(item));

  return MidiSpec.slice({
    header: {
      ...simple.header,
      keySignatures, tempos, timeSignatures,
    },
    tracks: simple.trackDefinitions.map(td => {
      const id = td.id;
      const pitchBends = trackFilter(id, simple.stream, PitchBend);
      const notes = trackFilter(id, simple.stream, Note);
      const ccs = trackFilter(id, simple.stream, ControlChangeSpec);
      const ccNumSet = new Set<t.GetType<typeof ControlChangeNum>>();
      for(const cc of ccs) {
        ccNumSet.add(cc.number);
      }
      const ccNums = Array.from(ccNumSet);
      return {
        name: "",
        channel: td.channel,
        instrument: fixInstrument(td.channel, td.instrument),
        pitchBends, notes,
        controlChanges: Object.fromEntries(ccNums.map(num => {
          return [
            num,
            ccs.filter(cc => cc.number === num),
          ];
        })),
      };
    }),
  } satisfies t.GetType<typeof MidiSpec>);
}

export const instrumentNames = [
  "acoustic grand piano",
	"bright acoustic piano",
	"electric grand piano",
	"honky-tonk piano",
	"electric piano 1",
	"electric piano 2",
	"harpsichord",
	"clavi",
	"celesta",
	"glockenspiel",
	"music box",
	"vibraphone",
	"marimba",
	"xylophone",
	"tubular bells",
	"dulcimer",
	"drawbar organ",
	"percussive organ",
	"rock organ",
	"church organ",
	"reed organ",
	"accordion",
	"harmonica",
	"tango accordion",
	"acoustic guitar (nylon)",
	"acoustic guitar (steel)",
	"electric guitar (jazz)",
	"electric guitar (clean)",
	"electric guitar (muted)",
	"overdriven guitar",
	"distortion guitar",
	"guitar harmonics",
	"acoustic bass",
	"electric bass (finger)",
	"electric bass (pick)",
	"fretless bass",
	"slap bass 1",
	"slap bass 2",
	"synth bass 1",
	"synth bass 2",
	"violin",
	"viola",
	"cello",
	"contrabass",
	"tremolo strings",
	"pizzicato strings",
	"orchestral harp",
	"timpani",
	"string ensemble 1",
	"string ensemble 2",
	"synthstrings 1",
	"synthstrings 2",
	"choir aahs",
	"voice oohs",
	"synth voice",
	"orchestra hit",
	"trumpet",
	"trombone",
	"tuba",
	"muted trumpet",
	"french horn",
	"brass section",
	"synthbrass 1",
	"synthbrass 2",
	"soprano sax",
	"alto sax",
	"tenor sax",
	"baritone sax",
	"oboe",
	"english horn",
	"bassoon",
	"clarinet",
	"piccolo",
	"flute",
	"recorder",
	"pan flute",
	"blown bottle",
	"shakuhachi",
	"whistle",
	"ocarina",
	"lead 1 (square)",
	"lead 2 (sawtooth)",
	"lead 3 (calliope)",
	"lead 4 (chiff)",
	"lead 5 (charang)",
	"lead 6 (voice)",
	"lead 7 (fifths)",
	"lead 8 (bass + lead)",
	"pad 1 (new age)",
	"pad 2 (warm)",
	"pad 3 (polysynth)",
	"pad 4 (choir)",
	"pad 5 (bowed)",
	"pad 6 (metallic)",
	"pad 7 (halo)",
	"pad 8 (sweep)",
	"fx 1 (rain)",
	"fx 2 (soundtrack)",
	"fx 3 (crystal)",
	"fx 4 (atmosphere)",
	"fx 5 (brightness)",
	"fx 6 (goblins)",
	"fx 7 (echoes)",
	"fx 8 (sci-fi)",
	"sitar",
	"banjo",
	"shamisen",
	"koto",
	"kalimba",
	"bag pipe",
	"fiddle",
	"shanai",
	"tinkle bell",
	"agogo",
	"steel drums",
	"woodblock",
	"taiko drum",
	"melodic tom",
	"synth drum",
	"reverse cymbal",
	"guitar fret noise",
	"breath noise",
	"seashore",
	"bird tweet",
	"telephone ring",
	"helicopter",
	"applause",
	"gunshot",
] as const;

export const drumKitByPatchID = {
	0: "standard kit" as const,
	8: "room kit" as const,
	16: "power kit" as const,
	24: "electronic kit" as const,
	25: "tr-808 kit" as const,
	32: "jazz kit" as const,
	40: "brush kit" as const,
	48: "orchestra kit" as const,
	56: "sound fx kit" as const,
};

export const InstrumentName = anyOf([
  ...instrumentNames,
  ...Object.values(drumKitByPatchID)
]);

const instrumentFamily = [
  "piano",
	"chromatic percussion",
	"organ",
	"guitar",
	"bass",
	"strings",
	"ensemble",
	"brass",
	"reed",
	"pipe",
	"synth lead",
	"synth pad",
	"synth effects",
	"world",
	"percussive",
	"sound effects",
  "drums",
] as const;
export const InstrumentFamily = anyOf(instrumentFamily);

export const Instrument = t.subtype({
  family: InstrumentFamily,
  name : InstrumentName,
  percussion: t.optional(t.bool),
});
const ControlChangeNum = anyOf([
    1,
    2,
    4,
    5,
    7,
    8,
    10,
    64,
    65,
    66,
    67,
    68,
    84,
  ]).comment(`The cc number:
1: modulation wheel
2: breath
4: footController
5: portamentoTime
7: volume
8: balance
10: pan
64: sustain
65: portamentoOnOff
66: sostenuto
67: softPedal
68: legatoFootswitch
84: portamentoControl
`);

const TimeSignature = t.subtype({
  ticks: t.num,
  timeSignature: t.array(t.num).comment("the time signature, e.g. [4, 4]"),
  measures: t.optional(t.num),
});

const Tempo = t.subtype({
  ticks: t.num,
  bpm: t.num.comment("the tempo, e.g. 120"),
  time: t.optional(t.num),
});

const KeySignature = t.subtype({
  ticks: t.num,
  key: anyOf([
    "Cb",
    "Gb",
    "Db",
    "Ab",
    "Eb",
    "Bb",
    "F",
    "C",
    "G",
    "D",
    "A",
    "E",
    "B",
    "F#",
    "C#",
    "Ab",
    "Eb",
    "Bb",
    "F",
    "C",
    "G",
    "D",
    "A",
    "E",
    "B",
    "F#",
    "C#",
    "G#",
    "D#",
    "A#",
  ]),
  scale: t.str,
});

const HeaderTimingSpec = t.subtype({
  tempos: t.array(Tempo),
  timeSignatures: t.array(TimeSignature),
  keySignatures: t.array(KeySignature),
});

const HeaderSpec = t.subtype({
  name: t.str.comment("The song name"),
  ppq: t.num.comment("the Pulses Per Quarter of the midi file"),
});

/*
 * The actual MIDI JSON spec used by ToneJS, enforced to use ticks rather than seconds
 */
export function toneToTypescript() {
  return toTypescript({ ControlChangeValueSpec, MidiSpec });
}

export const ControlChangeValueSpec = t.subtype({
  number: ControlChangeNum,
  ticks: t.num,
  value: t.num.comment("normalized 0-1"),
});

export const MidiSpec = t.subtype({
  // the transport and timing data
  header: HeaderSpec.and(HeaderTimingSpec),

  // an array of midi tracks
  tracks: t.array(t.subtype({
    name: t.str,
    channel: t.num.comment("the channel; channels 9 and 10 are reserved for percussion"),

    endOfTrackTicks: t.optional(t.num.comment("The end of track event if it exists, in ticks")),

    instrument: Instrument,

    pitchBends: t.array(t.subtype({
      ticks: t.num,
      value: t.num.comment("the pitch value from"),
    })),

    notes: t.array(t.subtype({
      midi: t.num,
      ticks: t.num,
      name: t.str.comment("Note name, e.g. C4"),
      pitch: t.optional(t.str.comment("Pitch class, e.g C")),
      octave: t.optional(t.num.comment("Octave, e.g. 4")),
      velocity: t.num.comment("Normalized 0-1 velocity"),
      durationTicks: t.num.comment("Duration between noteOn and noteOff"),
    })),

    // midi control changes
    // if there are control changes in the midi file
    controlChanges: t.optional(t.partial(t.subtype({
      1: t.array(ControlChangeValueSpec).comment("modulation wheel"),
      2: t.array(ControlChangeValueSpec).comment("breath"),
      4: t.array(ControlChangeValueSpec).comment("footController"),
      5: t.array(ControlChangeValueSpec).comment("portamentoTime"),
      7: t.array(ControlChangeValueSpec).comment("volume"),
      8: t.array(ControlChangeValueSpec).comment("balance"),
      10: t.array(ControlChangeValueSpec).comment("pan"),
      64: t.array(ControlChangeValueSpec).comment("sustain"),
      65: t.array(ControlChangeValueSpec).comment("portamentoOnOff"),
      66: t.array(ControlChangeValueSpec).comment("sostenuto"),
      67: t.array(ControlChangeValueSpec).comment("softPedal"),
      68: t.array(ControlChangeValueSpec).comment("legatoFootswitch"),
      84: t.array(ControlChangeValueSpec).comment("portamentoControl"),
    }))),
  }))
});

/*
 * The simplified MIDI spec we allow LLMs to use
 */
export function simpleMidiToTypescript() {
  return toTypescript({ ControlChangeSpec, PitchBend, Note, SimpleMidiSpec });
}

export const ControlChangeSpec = t.subtype({
  type: t.value("cc"),
  track: t.num.comment("Track ID"),
  number: anyOf([
    1,
    2,
    4,
    5,
    7,
    8,
    10,
    64,
    65,
    66,
    67,
    68,
    84,
  ]).comment(`The cc number:
1: modulation wheel
2: breath
4: footController
5: portamentoTime
7: volume
8: balance
10: pan
64: sustain
65: portamentoOnOff
66: sostenuto
67: softPedal
68: legatoFootswitch
84: portamentoControl
`),
  ticks: t.num,
  value: t.num.comment("normalized 0-1"),
});

export const PitchBend = t.subtype({
  type: t.value("pb"),
  track: t.num.comment("Track ID"),
  ticks: t.num,
  value: t.num.comment("the pitch value from"),
});

export const Note = t.subtype({
  type: t.value("note"),
  track: t.num.comment("Track ID"),
  midi: t.num,
  ticks: t.num,
  name: t.str.comment("Note name, e.g. C4"),
  pitch: t.optional(t.str.comment("Pitch class, e.g C")),
  octave: t.optional(t.num.comment("Octave, e.g. 4")),
  velocity: t.num.comment("Normalized 0-1 velocity"),
  durationTicks: t.num.comment("Duration between noteOn and noteOff"),
});

function withType<Name extends string, T>(name: Name, check: t.Type<T>): t.Type<T & { type: Name }> {
  return t.subtype({
    type: t.value(name),
  }).and(check);
}

export const SimpleMidiSpec = t.subtype({
  // the transport and timing data
  header: HeaderSpec,
  trackDefinitions: t.array(t.subtype({
    id: t.num,
    channel: t.num.comment("the channel; channels 9 and 10 are reserved for percussion"),
    instrument: Instrument,
  })),
  stream: t.array(
    withType("time", TimeSignature)
    .or(withType("key", KeySignature))
    .or(withType("tempo", Tempo))
    .or(ControlChangeSpec)
    .or(PitchBend)
    .or(Note)
  ),
});

function anyOf<T extends string | number>(array: readonly T[]): t.Type<T> {
  if(array.length === 1) return t.value(array[0]);
  return t.value(array[0]).or(anyOf(array.slice(1)));
}
