import { t } from "structural";

export const ControlChangeSpec = t.subtype({
  number: t.num.comment("the cc number"),
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

    instrument: t.subtype({           // and object representing the program change events
      number : t.num.comment("Instrument number 0-127"),
      family: t.str.comment("The family of the instruments, read-only"),
      name : t.str,
      percussion: t.optional(t.bool),
    }),

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
      1: t.array(ControlChangeSpec).comment("modulation wheel"),
      2: t.array(ControlChangeSpec).comment("breath"),
      4: t.array(ControlChangeSpec).comment("footController"),
      5: t.array(ControlChangeSpec).comment("portamentoTime"),
      7: t.array(ControlChangeSpec).comment("volume"),
      8: t.array(ControlChangeSpec).comment("balance"),
      10: t.array(ControlChangeSpec).comment("pan"),
      64: t.array(ControlChangeSpec).comment("sustain"),
      65: t.array(ControlChangeSpec).comment("portamentoOnOff"),
      66: t.array(ControlChangeSpec).comment("sostenuto"),
      67: t.array(ControlChangeSpec).comment("softPedal"),
      68: t.array(ControlChangeSpec).comment("legatoFootswitch"),
      84: t.array(ControlChangeSpec).comment("portamentoControl"),
    }))),
  }))
});

function anyOf<T extends string>(array: readonly T[]): t.Type<T> {
  if(array.length === 1) return t.value(array[0]);
  return t.value(array[0]).or(anyOf(array.slice(1)));
}
