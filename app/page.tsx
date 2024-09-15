"use client";

import Link from "next/link";
import { useState } from "react";
import Player from "./player/player"
import { MidiSpec } from "./player/midi-spec";
import { t } from "structural";

export default function Home() {
  const [ json, setJson ] = useState("");

  let parsed: any = {};
  try {
    parsed = JSON.parse(json);
  } catch {
    console.log(json, "is not json");
  }

  const midi = MidiSpec.sliceResult(parsed);
  if(midi instanceof t.Err) console.log(midi.message);

  return <div className="max-w-prose mx-auto w-full h-full">
    <div className="flex grow items-center justify-between w-full h-full flex-col">
      <h1 className="font-bold text-2xl mt-2">MIDI JSON Player</h1>
      <div className="flex grow items-center justify-center flex-col w-full">
        <Link href="/spec" className="text-sky-500 underline hover:text-sky-300 cursor-pointer">
          TypeScript spec
        </Link>
        <textarea onChange={e => setJson(e.target.value)} value={json} className="border border-slate-900 rounded block p-2 w-full" rows={20}/>
        {
          (midi instanceof t.Err) ? <div>error</div> : <Player midi={midi} />
        }
      </div>
    </div>
  </div>
}
