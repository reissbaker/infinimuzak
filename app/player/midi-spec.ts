import { t } from "structural";

export const ControlChangeSpec = t.subtype({
  number: t.num,           // the cc number
  ticks: t.num,            // time in ticks
  value: t.num,            // normalized 0-1
});

export const MidiSpec = t.subtype({
  // the transport and timing data
  header: t.subtype({
    // The name of the first empty track, which is usually the song name
    name: t.str,

    // the tempo, e.g. 120
    tempos: t.array(t.subtype({
      ticks: t.num,
      bpm: t.num,
      time: t.optional(t.num),
    })),

    // the time signature, e.g. [4, 4],
    timeSignatures: t.array(t.subtype({
      ticks: t.num,
      timeSignature: t.array(t.num),
      measures: t.optional(t.num),
    })),

    // the key signatures
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

    ppq: t.num,                       // the Pulses Per Quarter of the midi file
  }),


  // an array of midi tracks
  tracks: t.array(t.subtype({
    name: t.str,                   // the track name if one was given
    channel: t.num,                // channel
                                   // the ID for this channel; 9 and 10 are
                                   // reserved for percussion

    // The end of track event (if it exists) in ticks
    endOfTrackTicks: t.num,

    instrument: t.subtype({           // and object representing the program change events
      number : t.num,                 // the instrument number 0-127
      family: t.str,                  // the family of instruments, read only.
      name : t.str,                   // the name of the instrument
      percussion: t.optional(t.bool), // if the instrument is a percussion instrument
    }),

    pitchBends: t.array(t.subtype({
      ticks: t.num, // the tick time
      value: t.num, // the pitch value from
    })),

    notes: t.array(t.subtype({
      midi: t.num,               // midi number, e.g. 60
      ticks: t.num,              // time in ticks
      name: t.str,               // note name, e.g. "C4",
      pitch: t.optional(t.str),  // the pitch class, e.g. "C",
      octave: t.optional(t.num), // the octave, e.g. 4
      velocity: t.num,           // normalized 0-1 velocity
      durationTicks: t.num,      // duration in ticks between noteOn and noteOff
    })),

    // midi control changes
    // if there are control changes in the midi file
    controlChanges: t.partial(t.subtype({
      1: t.array(ControlChangeSpec), // modulation wheel
      2: t.array(ControlChangeSpec), // breath
      4: t.array(ControlChangeSpec), // footController
      5: t.array(ControlChangeSpec), // portamentoTime
      7: t.array(ControlChangeSpec), // volume
      8: t.array(ControlChangeSpec), // balance
      10: t.array(ControlChangeSpec), // pan
      64: t.array(ControlChangeSpec), // sustain
      65: t.array(ControlChangeSpec), // portamentoTime
      66: t.array(ControlChangeSpec), // sostenuto
      67: t.array(ControlChangeSpec), // softPedal
      68: t.array(ControlChangeSpec), // legatoFootswitch
      84: t.array(ControlChangeSpec), // portamentoControl
    })),
  }))
});

function anyOf<T extends string>(array: readonly T[]): t.Type<T> {
  if(array.length === 1) return t.value(array[0]);
  return t.value(array[0]).or(anyOf(array.slice(1)));
}
