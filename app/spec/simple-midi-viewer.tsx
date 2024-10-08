import { t } from "structural";
import { MidiSpec, SimpleMidiSpec, toneToSimple, simpleToTone } from "@/app/player/midi-spec";

type Props = {
  midi: t.GetType<typeof MidiSpec> | t.GetType<typeof SimpleMidiSpec>,
};
export default function SimpleMidiViewer({midi}: Props) {
  const simpleMidi = SimpleMidiSpec.guard(midi) ? toneToSimple(simpleToTone(midi)) : toneToSimple(midi);
  return <code className="max-w-prose whitespace-pre-wrap">
    { JSON.stringify(simpleMidi, null, 2) }
  </code>
}
