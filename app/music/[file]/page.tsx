import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { MidiSpec } from "@/app/player/midi-spec";
import Player from "@/app/player/player";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type Props = {
  params: {
    file: string,
  },
};
export default async function playPage({ params }: Props) {
  const file = await fs.readFile(path.join(__dirname, "..", params.file), "utf8");
  const parsed = JSON.parse(file);
  const midi = MidiSpec.slice(parsed);
  return <div className="flex items-center justify-center w-full flex-col mt-2">
    <Player midi={midi} />
  </div>
}
