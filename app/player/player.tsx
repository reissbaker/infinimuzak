"use client";
import { t } from "structural";
import { useState, useMemo, useEffect } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { MidiSpec } from "./midi-spec";
import { hydrateMidi } from "./hydrate-midi";


type Props = {
  midi: t.GetType<typeof MidiSpec>,
};

export default function Player(props: Props) {
  const [ playing, setPlaying ] = useState(false);
  const [ synths, setSynths ] = useState<Tone.PolySynth[]>([]);
  const midi = useMemo(() => {
    return hydrateMidi(props.midi);
  }, [ props.midi ]);
  const [ timer, setTimer ] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if(playing) {
      if(timer == null) {
        setTimer(setTimeout(() => {
          stop(synths, setSynths);
          setPlaying(false);
        }, midi.duration * 1000));
      }
    }
    return () => {
      if(playing) stop(synths, setSynths);
    }
  }, [ playing, synths ]);

  return <>
    <a className="bg-sky-500 text-white hover:bg-sky-300 transition-colors rounded p-4 my-2 cursor-pointer" onClick={e => {
      e.preventDefault();
      if(timer) clearTimeout(timer);
      if(playing) stop(synths, setSynths);
      else play(midi, synths, setSynths);
      setPlaying(!playing);
    }}>
      { playing ? "Stop" : "Play" }
    </a>
    <p>{ Math.round(midi.duration) } seconds</p>
  </>
}

function stop(synths: Tone.PolySynth[], setSynths: (synths: Tone.PolySynth[]) => any) {
  for(const synth of synths) {
    synth.disconnect();
  }
  setSynths([]);
}
function play(midi: Midi, ogSynths: Tone.PolySynth[], setSynths: (synths: Tone.PolySynth[]) => any) {
  const now = Tone.now() + 0.5;
  const synths = ogSynths.concat([]);
  midi.tracks.forEach((track) => {
    //create a synth for each track
    const synth = new Tone.PolySynth(Tone.Synth, {
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();
    synths.push(synth);
    //schedule all of the events
    track.notes.forEach((note) => {
      synth.triggerAttackRelease(
        note.name,
        note.duration,
        note.time + now,
        note.velocity
      );
    });
  });
  setSynths(synths);
}
