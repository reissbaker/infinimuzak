import { t, toTypescript } from "structural";

export function toneToSimple(tone: t.GetType<typeof MidiSpec>): t.GetType<typeof SimpleMidiSpec> {
  return {
    header: tone.header,
    trackDefinitions: tone.tracks.map((track, id) => {
      return {
        id,
        name: track.name,
        channel: track.channel,
        instrument: track.instrument,
      };
    }),
    stream: tone.tracks.flatMap((track, id) => {
      return [
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
      return 0;
    }),
  };
}

export function simpleToTone(simple: t.GetType<typeof SimpleMidiSpec>): t.GetType<typeof MidiSpec> {
  function trackFilter<T extends { track: number }>(id: number, items: T[]) {
    return items.filter(item => item.track === id);
  }

  return {
    header: simple.header,
    tracks: simple.trackDefinitions.map(td => {
      const id = td.id;
      const pitchBends = trackFilter(id, simple.stream).filter(item => PitchBend.guard(item));
      const notes = trackFilter(id, simple.stream).filter(item => Note.guard(item));
      const ccs = trackFilter(id, simple.stream).filter(item => ControlChangeSpec.guard(item));
      const ccNumSet = new Set<t.GetType<typeof ControlChangeNum>>();
      for(const cc of ccs) {
        ccNumSet.add(cc.number);
      }
      const ccNums = Array.from(ccNumSet);
      return {
        name: td.name,
        channel: td.channel,
        instrument: td.instrument,
        pitchBends, notes,
        controlChanges: Object.fromEntries(ccNums.map(num => {
          return [
            num,
            ccs.filter(cc => cc.number === num),
          ];
        })),
      };
    }),
  };
}

export const Instrument = t.subtype({
  number : t.num.comment("Instrument number 0-127"),
  family: t.str.comment("The family of the instruments, read-only"),
  name : t.str,
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
`)

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
  header: t.subtype({
    name: t.str.comment("The name of the first track, which is usually the song name"),

    // the tempo, e.g. 120
    tempos: t.array(t.subtype({
      ticks: t.num,
      bpm: t.num,
      time: t.optional(t.num),
    })).comment("the tempo, e.g. 120"),

    timeSignatures: t.array(t.subtype({
      ticks: t.num,
      timeSignature: t.array(t.num),
      measures: t.optional(t.num),
    })).comment("the time signature, e.g. [4, 4]"),

    keySignatures: t.array(t.subtype({
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
    })),

    ppq: t.num.comment("the Pulses Per Quarter of the midi file"),
  }),


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

export const SimpleMidiSpec = t.subtype({
  // the transport and timing data
  header: t.subtype({
    name: t.str.comment("The name of the first track, which is usually the song name"),

    // the tempo, e.g. 120
    tempos: t.array(t.subtype({
      ticks: t.num,
      bpm: t.num,
      time: t.optional(t.num),
    })).comment("the tempo, e.g. 120"),

    timeSignatures: t.array(t.subtype({
      ticks: t.num,
      timeSignature: t.array(t.num),
      measures: t.optional(t.num),
    })).comment("the time signature, e.g. [4, 4]"),

    keySignatures: t.array(t.subtype({
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
    })),

    ppq: t.num.comment("the Pulses Per Quarter of the midi file"),
  }),

  trackDefinitions: t.array(t.subtype({
    id: t.num,
    name: t.str,
    channel: t.num.comment("the channel; channels 9 and 10 are reserved for percussion"),
    instrument: Instrument,
  })),

  stream: t.array(ControlChangeSpec.or(PitchBend).or(Note)),
});

function anyOf<T extends string | number>(array: readonly T[]): t.Type<T> {
  if(array.length === 1) return t.value(array[0]);
  return t.value(array[0]).or(anyOf(array.slice(1)));
}
