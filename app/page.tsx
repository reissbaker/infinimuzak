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
    if(json !== "") console.log(json, "is not json");
  }
  const stringified = parsed ? JSON.stringify(parsed) : json;

  const midi = MidiSpec.sliceResult(parsed);
  if(midi instanceof t.Err) console.log(midi.message);

  return <div className="max-w-prose mx-auto w-full h-full">
    <div className="flex grow items-center justify-between w-full h-full flex-col">
      <h1 className="font-bold text-2xl mt-2">MIDI JSON Player</h1>
      <div className="flex grow items-center justify-center flex-col w-full">
        <Link href="/spec" className="text-sky-500 underline hover:text-sky-300 cursor-pointer">
          TypeScript spec
        </Link>
        <Link href="/music" className="text-sky-500 underline hover:text-sky-300 cursor-pointer">
          Training data
        </Link>
        <Link href="/generated" className="text-sky-500 underline hover:text-sky-300 cursor-pointer">
          Generated files
        </Link>
        <textarea onChange={e => setJson(e.target.value)} value={json} className="border border-slate-900 rounded block p-2 w-full" rows={20}/>
        { json.length === 0 ? "" : <p>
          { stringified.length.toLocaleString() } characters (est. { Math.ceil(stringified.length / 4).toLocaleString() } tokens)
          </p>
        }
        {
          (midi instanceof t.Err) ? json === "" ? "" : <div>Invalid JSON</div> : <Player midi={midi} />
        }
      </div>
    </div>
  </div>
}
