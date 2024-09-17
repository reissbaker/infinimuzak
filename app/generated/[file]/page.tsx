import path from "path";
import fs from "fs/promises";
import { MidiSpec, SimpleMidiSpec } from "@/app/player/midi-spec";
import Player from "@/app/player/player";
import { allGeneratedMusic } from "../all-generated-music";
import SimpleMidiViewer from "@/app/spec/simple-midi-viewer";

type Props = {
  params: {
    file: string,
  },
};

// Export filenames for prerendering in production
export async function generateStaticParams() {
  const music = await allGeneratedMusic()
  return music.map(file => ({ file }));
}

export default async function playPage({ params }: Props) {
  const file = await fs.readFile(path.join(process.cwd(), "app/generated", params.file), "utf8");
  const parsed = JSON.parse(file);
  const midi = MidiSpec.or(SimpleMidiSpec).slice(parsed);
  return <div className="flex items-center justify-center w-full flex-col mt-2">
    <Player midi={midi} />
    <SimpleMidiViewer midi={midi} />
  </div>
}
