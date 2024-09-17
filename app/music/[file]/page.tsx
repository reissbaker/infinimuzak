import path from "path";
import fs from "fs/promises";
import { MidiSpec } from "@/app/player/midi-spec";
import Player from "@/app/player/player";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    file: string,
  },
};

export default async function playPage({ params }: Props) {
  const file = await fs.readFile(path.join(process.cwd(), "app/music", params.file), "utf8");
  const parsed = JSON.parse(file);
  const midi = MidiSpec.slice(parsed);
  return <div className="flex items-center justify-center w-full flex-col mt-2">
    <Player midi={midi} />
  </div>
}
