import { t } from "structural";
import { MidiSpec } from "./midi-spec";
import { Midi } from "@tonejs/midi";

export function hydrateMidi(midi: t.GetType<typeof MidiSpec>) {
  const hydrated = new Midi();
  hydrated.fromJSON({
    header: {
      ...midi.header,
      meta: [],
    },
    tracks: midi.tracks.map(track => {
      return {
        ...track,

        pitchBends: track.pitchBends.map(bend => {
          return {
            ...bend,
            time: ticksToSeconds(midi, bend.ticks),
          };
        }),
        notes: track.notes.map(note => {
          return {
            ...note,
            time: ticksToSeconds(midi, note.ticks),
            duration: durationTicksToSeconds(midi, note.ticks, note.durationTicks),
          };
        }),

        controlChanges: Object.fromEntries(Object.entries(track.controlChanges).map(([ key, ctrls ]) => {
          return [
            key,
            ctrls.map(ctrl => {
              return {
                ...ctrl,
                time: ticksToSeconds(midi, ctrl.ticks),
              };
            }),
          ];
        })),
      };
    }),
  });
  return hydrated;
}

function ticksToSeconds(midi: t.GetType<typeof MidiSpec>, ticks: number) {
  		// Find the relevant position.
		const index = search(midi.header.tempos, ticks);

		if (index !== -1) {
			const tempo = midi.header.tempos[index];
			const tempoTime = tempo.time;
      if(tempoTime) {
        const elapsedBeats = (ticks - tempo.ticks) / midi.header.ppq;
        return tempoTime + (60 / tempo.bpm) * elapsedBeats;
      }
		}

    // Assume 120.
    const beats = ticks / midi.header.ppq;
    return (60 / 120) * beats;
}

function search(array: Array<{ ticks: number }>, value: any): number {
	let beginning = 0;
	const len = array.length;
	let end = len;
	if (len > 0 && array[len - 1].ticks <= value) {
		return len - 1;
	}
	while (beginning < end) {
		// calculate the midpoint for roughly equal partition
		let midPoint = Math.floor(beginning + (end - beginning) / 2);
		const event = array[midPoint];
		const nextEvent = array[midPoint + 1];
		if (event.ticks === value) {
			// choose the last one that has the same value
			for (let i = midPoint; i < array.length; i++) {
				const testEvent = array[i];
				if (testEvent.ticks === value) {
					midPoint = i;
				}
			}
			return midPoint;
		} else if (event.ticks < value && nextEvent.ticks > value) {
			return midPoint;
		} else if (event.ticks > value) {
			// search lower
			end = midPoint;
		} else if (event.ticks < value) {
			// search upper
			beginning = midPoint + 1;
		}
	}

	return -1;
}

function durationTicksToSeconds(midi: t.GetType<typeof MidiSpec>, startTick: number, durationTicks: number) {
  const start = ticksToSeconds(midi, startTick);
  return ticksToSeconds(midi, startTick + durationTicks) - start;
}
