"use client";
import { t } from "structural";
import { useState, useMemo, useEffect } from "react";
import { MidiSpec, SimpleMidiSpec } from "./midi-spec";
import { hydrateMidi } from "./hydrate-midi";
import { setupMidiPlayer } from "./claude-midi";

type Props = {
  midi: t.GetType<typeof MidiSpec> | t.GetType<typeof SimpleMidiSpec>,
};

export default function Player(props: Props) {
  const [ playing, setPlaying ] = useState(false);
  const midi = useMemo(() => {
    return hydrateMidi(props.midi);
  }, [ props.midi ]);
  const playbackControls = useMemo(() => {
    return setupMidiPlayer(midi);
  }, [ midi ]);
  const [ timer, setTimer ] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if(playing) {
      if(timer == null) {
        setTimer(setTimeout(() => {
          playbackControls.stop();
          setPlaying(false);
        }, (midi.duration * 1000) + 2000));
      }
    }
    return () => {
      playbackControls.cleanup();
    }
  }, [ playing, playbackControls ]);

  return <>
    <a className="bg-sky-500 text-white hover:bg-sky-300 transition-colors rounded p-4 my-2 cursor-pointer" onClick={e => {
      e.preventDefault();
      if(timer) clearTimeout(timer);
      if(playing) playbackControls.stop();
      else playbackControls.start().then(() => playbackControls.play());
      setPlaying(!playing);
    }}>
      { playing ? "Stop" : "Play" }
    </a>
    <p>{ Math.round(midi.duration) } seconds</p>
  </>
}
