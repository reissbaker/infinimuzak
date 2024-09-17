import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';

// Define a deep partial type
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Define types for synth options
type SynthOptions = Tone.SynthOptions | Tone.FMSynthOptions | Tone.AMSynthOptions | Tone.MembraneSynthOptions;

interface ExtendedSynth {
  synth: Tone.PolySynth;
  applyPitchBend(bendAmount: number): void;
  triggerAttackRelease(note: string | number, duration: Tone.Unit.Time, time?: Tone.Unit.Time, velocity?: number): void;
}

class BendablePolySynth implements ExtendedSynth {
  synth: Tone.PolySynth;

  constructor(synthType: 'Synth' | 'FMSynth' | 'AMSynth' | 'MembraneSynth' = 'Synth', options: DeepPartial<SynthOptions> = {}) {
    switch (synthType) {
      case 'FMSynth':
        this.synth = new Tone.PolySynth(Tone.FMSynth, options as any).toDestination();
        break;
      case 'AMSynth':
        this.synth = new Tone.PolySynth(Tone.AMSynth, options as any).toDestination();
        break;
      case 'MembraneSynth':
        this.synth = new Tone.PolySynth(Tone.MembraneSynth, options as any).toDestination();
        break;
      default:
        this.synth = new Tone.PolySynth(Tone.Synth, options as any).toDestination();
    }
  }

  applyPitchBend(bendAmount: number) {
    this.synth.set({ detune: bendAmount * 100 }); // detune is in cents
  }

  triggerAttackRelease(note: string | number, duration: Tone.Unit.Time, time?: Tone.Unit.Time, velocity?: number) {
    this.synth.triggerAttackRelease(note, duration, time, velocity);
  }
}

interface DrumMapping {
  [key: number]: {
    type: string;
    pitch?: string;
  };
}

const generalMidiDrumMapping: DrumMapping = {
  35: { type: 'kick' },
  36: { type: 'kick' },
  37: { type: 'snare', pitch: 'C3' },
  38: { type: 'snare' },
  39: { type: 'clap' },
  40: { type: 'snare', pitch: 'A2' },
  41: { type: 'tom', pitch: 'F2' },
  42: { type: 'hihat', pitch: 'F#3' },
  43: { type: 'tom', pitch: 'F2' },
  44: { type: 'hihat', pitch: 'F#3' },
  45: { type: 'tom', pitch: 'A2' },
  46: { type: 'hihat', pitch: 'C#4' },
  47: { type: 'tom', pitch: 'C3' },
  48: { type: 'tom', pitch: 'D3' },
  49: { type: 'crash', pitch: 'C#4' },
  50: { type: 'tom', pitch: 'E3' },
  51: { type: 'ride', pitch: 'D4' },
  52: { type: 'crash', pitch: 'D#4' },
  53: { type: 'ride', pitch: 'D4' },
  54: { type: 'tambourine' },
  55: { type: 'crash', pitch: 'F#4' },
  56: { type: 'cowbell', pitch: 'G#3' },
  57: { type: 'crash', pitch: 'A4' },
  58: { type: 'vibraslap' },
  59: { type: 'ride', pitch: 'A4' },
  60: { type: 'bongo', pitch: 'C4' },
  61: { type: 'bongo', pitch: 'D4' },
  62: { type: 'conga', pitch: 'D#4' },
  63: { type: 'conga', pitch: 'E4' },
  64: { type: 'conga', pitch: 'F#4' },
  65: { type: 'timbale', pitch: 'F4' },
  66: { type: 'timbale', pitch: 'F#4' },
  67: { type: 'agogo', pitch: 'G4' },
  68: { type: 'agogo', pitch: 'A4' },
  69: { type: 'cabasa' },
  70: { type: 'maracas' },
  71: { type: 'whistle', pitch: 'C5' },
  72: { type: 'whistle', pitch: 'D5' },
  73: { type: 'guiro', pitch: 'C#5' },
  74: { type: 'guiro', pitch: 'D5' },
  75: { type: 'claves', pitch: 'G4' },
  76: { type: 'woodblock', pitch: 'C5' },
  77: { type: 'woodblock', pitch: 'D5' },
  78: { type: 'cuica', pitch: 'C5' },
  79: { type: 'cuica', pitch: 'D5' },
  80: { type: 'triangle', pitch: 'F#5' },
  81: { type: 'triangle', pitch: 'G5' },
};

function createInstrument(instrumentName: string): ExtendedSynth {
  let synthType: 'Synth' | 'FMSynth' | 'AMSynth' | 'MembraneSynth' = 'Synth';
  let options: DeepPartial<SynthOptions> = {};

  switch (instrumentName.toLowerCase()) {
    case 'acoustic grand piano':
    case 'bright acoustic piano':
    case 'electric grand piano':
      synthType = 'Synth';
      options = {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.002,
          decay: 0.1,
          sustain: 0.5,
          release: 0.5,
        },
      };
      break;
    case 'honky-tonk piano':
      synthType = 'AMSynth';
      options = {
        harmonicity: 2,
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.002,
          decay: 0.3,
          sustain: 0.5,
          release: 0.3
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.002,
          decay: 0.1,
          sustain: 0.2,
          release: 0.3
        }
      };
      break;

    case 'violin':
    case 'viola':
    case 'cello':
      synthType = 'FMSynth';
      options = {
        modulationIndex: 3,
        envelope: {
          attack: 0.1,
          decay: 0.3,
          sustain: 0.8,
          release: 0.8,
        },
      };
      break;
    case 'trumpet':
    case 'trombone':
    case 'tuba':
      synthType = 'AMSynth';
      options = {
        harmonicity: 3,
        envelope: {
          attack: 0.05,
          decay: 0.1,
          sustain: 0.7,
          release: 0.2,
        },
      };
      break;
    case 'alto sax':
      synthType = 'AMSynth';
      options = {
        harmonicity: 1,
        modulationIndex: 3,
        oscillator: { type: 'square' },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.5,
          release: 0.4,
        },
        modulation: { type: 'triangle' },
        modulationEnvelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 0.3,
        },
      };
      break;

    case 'muted trumpet':
      synthType = 'FMSynth';
      options = {
        harmonicity: 2,
        modulationIndex: 3,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.03,
          decay: 0.1,
          sustain: 0.7,
          release: 0.2
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.02,
          decay: 0.05,
          sustain: 0.1,
          release: 0.1
        }
      };
      break;
    case 'flute':
      synthType = 'FMSynth';
      options = {
        harmonicity: 1.5,
        modulationIndex: 2,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.7,
          release: 0.6,
        },
        modulation: { type: 'triangle' },
        modulationEnvelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.3,
          release: 0.3,
        },
      };
      break;

    case 'acoustic guitar (nylon)':
      synthType = 'FMSynth';
      options = {
        harmonicity: 1,
        modulationIndex: 1.2,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.8,
          release: 1.5,
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.5,
          decay: 0,
          sustain: 1,
          release: 0.5,
        },
      };
      break;
    case 'acoustic guitar (steel)':
      synthType = 'AMSynth';
      options = {
        harmonicity: 3.5,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.9,
          release: 1,
        },
        modulation: { type: 'square6' },
        modulationEnvelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.5,
          release: 0.5,
        },
      };
      break;
    case 'electric guitar (jazz)':
      synthType = 'FMSynth';
      options = {
        harmonicity: 1,
        modulationIndex: 3.5,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.8,
          release: 1.5,
        },
        modulation: { type: 'triangle' },
        modulationEnvelope: {
          attack: 0.02,
          decay: 0.2,
          sustain: 0.3,
          release: 0.5,
        },
      };
      break;
    case 'electric guitar (clean)':
      synthType = 'AMSynth';
      options = {
        harmonicity: 3,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.9,
          release: 1,
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.5,
          release: 0.5,
        },
      };
      break;
    case 'electric guitar (muted)':
      synthType = 'AMSynth';
      options = {
        harmonicity: 1,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 0.5,
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.05,
          decay: 0.1,
          sustain: 0.2,
          release: 0.2,
        },
      };
      break;
    case 'overdriven guitar':
    case 'distortion guitar':
      synthType = 'FMSynth';
      options = {
        harmonicity: 2,
        modulationIndex: 5,
        oscillator: { type: 'square' },
        envelope: {
          attack: 0.001,
          decay: 0.1,
          sustain: 0.6,
          release: 0.5,
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.5,
          release: 0.5,
        },
      };
      break;

    case 'electric bass (finger)':
    case 'electric bass (pick)':
      synthType = 'FMSynth';
      options = {
        harmonicity: 1,
        modulationIndex: 3.5,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.08,
          decay: 0.3,
          sustain: 0.7,
          release: 0.8,
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.5,
          sustain: 0.2,
          release: 0.5,
        },
      };
      break;

    case 'fretless bass':
      synthType = 'AMSynth';
      options = {
        harmonicity: 1.5,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.8,
          release: 1,
        },
        modulation: { type: 'sine' },
        modulationEnvelope: {
          attack: 0.05,
          decay: 0.4,
          sustain: 0.2,
          release: 0.5,
        },
      };
      break;

    case 'slap bass 1':
    case 'slap bass 2':
      synthType = 'AMSynth';
      options = {
        harmonicity: 2,
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.4,
          release: 0.4,
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.002,
          decay: 0.2,
          sustain: 0.1,
          release: 0.3,
        },
      };
      break;
    case 'synthbrass 1':
      synthType = 'FMSynth';
      options = {
        harmonicity: 3.5,
        modulationIndex: 10,
        oscillator: { type: 'square' },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.8,
          release: 0.5,
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.5,
          decay: 0,
          sustain: 1,
          release: 0.5,
        },
      };
      break;

    case 'synthbrass 2':
      synthType = 'AMSynth';
      options = {
        harmonicity: 2,
        oscillator: { type: 'sawtooth' },
        envelope: {
          attack: 0.03,
          decay: 0.3,
          sustain: 0.7,
          release: 0.8,
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.5,
          decay: 0.1,
          sustain: 0.2,
          release: 0.5,
        },
      };
      break;
    case 'clarinet':
      synthType = 'AMSynth';
      options = {
        harmonicity: 1.5,
        detune: 0,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.06,
          decay: 0.1,
          sustain: 0.9,
          release: 0.5
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.2,
          decay: 0.1,
          sustain: 0.8,
          release: 0.3
        }
      };
      break;

    case 'synthesizer':
    case 'lead 1 (square)':
    case 'lead 2 (sawtooth)':
      synthType = 'Synth';
      options = {
        oscillator: { type: 'sawtooth' },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.6,
          release: 0.3,
        },
      };
      break;
    case 'lead 6 (voice)':
      synthType = 'FMSynth';
      options = {
        harmonicity: 0.5,
        modulationIndex: 10,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.8,
          release: 0.8
        },
        modulation: { type: 'triangle' },
        modulationEnvelope: {
          attack: 0.05,
          decay: 0.5,
          sustain: 0.2,
          release: 0.5
        }
      };
      break;
     case 'lead 8 (bass + lead)':
      synthType = 'FMSynth';
      options = {
        harmonicity: 1,
        modulationIndex: 5,
        oscillator: { type: 'sawtooth' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.8,
          release: 0.4,
        },
        modulation: { type: 'square' },
        modulationEnvelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.5,
          release: 0.5,
        },
      };
      break;
    case 'drums':
      synthType = 'MembraneSynth';
      options = {
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.001,
          decay: 0.4,
          sustain: 0.01,
          release: 1.4,
        },
      };
      break;
    case 'string ensemble 1':
    case 'string ensemble 2':
    case 'synth strings 1':
    case 'synth strings 2':
      synthType = 'FMSynth';
      options = {
        harmonicity: 3.01,
        modulationIndex: 14,
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.2,
          decay: 0.3,
          sustain: 0.9,
          release: 0.8,
        },
        modulation: { type: 'sine' },
        modulationEnvelope: {
          attack: 0.5,
          decay: 0.5,
          sustain: 0.7,
          release: 0.8,
        },
      };
      break;
    default:
      synthType = 'Synth';
      options = {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 1,
        },
      };
  }

  return new BendablePolySynth(synthType, options);
}

interface PlaybackControls {
  play: () => void;
  stop: () => void;
  cleanup: () => void;
  start: () => Promise<void>;
}

function createMidiPlayer(midi: Midi): PlaybackControls {
  let instruments: ExtendedSynth[] = [];
  let isPlaying = false;

  const play = () => {
    if (isPlaying) return;

    const now = Tone.now() + 0.5;
    instruments = midi.tracks.map(track => createInstrument(track.instrument.name));

    midi.tracks.forEach((track, trackIndex) => {
      const instrument = instruments[trackIndex];

      // Schedule notes
      track.notes.forEach((note) => {
        instrument.triggerAttackRelease(
          note.name,
          note.duration,
          note.time + now,
          note.velocity
        );
      });

      // Handle pitch bends
      if (track.pitchBends) {
        track.pitchBends.forEach((bend) => {
          Tone.Draw.schedule(() => {
            instrument.applyPitchBend(bend.value * 2);// Assuming a pitch bend range of 2 semitones
          }, bend.time + now);
        });
      }

      // Handle control changes
      if (track.controlChanges) {
        if (track.controlChanges[7]) { // Volume
          track.controlChanges[7].forEach((vol) => {
            Tone.Draw.schedule(() => {
              instrument.synth.volume.value = Tone.gainToDb(vol.value);
            }, vol.time + now);
          });
        }
        // Add more control change handlers as needed
      }
    });

    isPlaying = true;
  };

  const stop = () => {
    if (!isPlaying) return;

    instruments.forEach(instrument => {
      instrument.synth.dispose();
    });
    instruments = [];
    isPlaying = false;
  };

  const cleanup = () => {
    stop();
  };

  const start = async () => {
    await Tone.start();
  };

  return { play, stop, cleanup, start };
}

export function setupMidiPlayer(midiData: Midi): PlaybackControls {
  return createMidiPlayer(midiData);
}
