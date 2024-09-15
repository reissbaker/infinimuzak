import { toTypescript } from "structural";
import { MidiSpec, ControlChangeSpec } from "../player/midi-spec";

export default function SpecPage() {
  return <code className="whitespace-pre-wrap flex items-center justify-center w-full">
    { toTypescript({ ControlChangeSpec, MidiSpec }) }
  </code>
}
