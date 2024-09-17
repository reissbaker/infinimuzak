import { toneToTypescript, simpleMidiToTypescript } from "../player/midi-spec";

export default function SpecPage() {
  return <div className="flex items-center justify-center w-full max-w-prose mx-auto flex-col">
    <h1 className="text-xl font-bold my-2">Simple MIDI spec for LLMs:</h1>
    <code className="whitespace-pre-wrap flex items-center justify-center w-full">
      { simpleMidiToTypescript() }
    </code>
    <h1 className="text-xl font-bold my-2">Full ToneJS MIDI JSON spec:</h1>
    <code className="whitespace-pre-wrap flex items-center justify-center w-full">
      { toneToTypescript() }
    </code>
  </div>
}
