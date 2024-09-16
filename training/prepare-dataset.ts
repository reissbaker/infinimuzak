import { t, toTypescript } from "structural";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { ControlChangeSpec, MidiSpec } from "@/app/player/midi-spec";
import { allMusic } from "@/app/music/all-music";
import { descriptions } from "./descriptions";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type Message = {
  role: "system" | "user" | "assistant",
  content: string,
};

async function prepare() {
  const musicFiles = await allMusic();
  const midis = await Promise.all(musicFiles.map(async (file) => {
    const contents = await fs.readFile(path.join(__dirname, "../app/music", file), "utf8");
    const json = JSON.parse(contents);
    return {
      file,
      midi: MidiSpec.slice(json),
    };
  }));

  const dataset: Array<{ messages: Message[], file: string }> = [];

  for(let i = 0; i < midis.length; i++) {
    const midiData = midis[i];
    dataset.push({ file: midiData.file, messages: songFromDescription(midiData.file, midiData.midi) });
    dataset.push({ file: midiData.file, messages: describeSong(midiData.file, midiData.midi) });
    dataset.push({ file: midiData.file, messages: finishSong(midiData.midi) });
  }

  const jsonl = dataset.map(convo => {
    const output = JSON.stringify({
      conversations: convo.messages.map(msg => ({ from: msg.role, value: msg.content })),
    });
    return {
      file: convo.file,
      output,
    };
  }).filter(data => {
    if(data.output.length > 100000 * 4) {
      console.log("Filtering", data.file);
      return false;
    }
    return true;
  }).map(data => data.output);

  await fs.writeFile(path.join(__dirname, "dataset.jsonl"), jsonl.join("\n"), "utf8");
  await fs.writeFile(path.join(__dirname, "system-prompt.txt"), systemPrompt(), "utf8");
}

function finishSong(midi: t.GetType<typeof MidiSpec>): Message[] {
  const partialSong: t.GetType<typeof MidiSpec> = {
    header: midi.header,
    tracks: midi.tracks.map(track => {
      return {
        name: track.name,
        channel: track.channel,
        endOfTrackTicks: track.endOfTrackTicks,
        instrument: track.instrument,
        pitchBends: halfArray(track.pitchBends),
        notes: halfArray(track.notes),
        controlChanges: Object.fromEntries(Object.entries(track.controlChanges).map(([ key, value ]) => {
          return [
            key,
            halfArray(value),
          ];
        })),
      };
    }),
  };

  return [
    {
      role: "system",
      content: systemPrompt(),
    },
    {
      role: "user",
      content: `Here's part of a song; finish it for me:\n${JSON.stringify(partialSong)}`
    },
    {
      role: "assistant",
      content: JSON.stringify(midi)
    },
  ];
}

function describeSong(file: string, midi: t.GetType<typeof MidiSpec>): Message[] {
  const basename = file.replace(".json", "");
  const desc = descriptions[basename];
  desc[0] = desc[0].slice(0, 1).toUpperCase() + desc[0].slice(1);

  return [
    {
      role: "system",
      content: systemPrompt(),
    },
    {
      role: "user",
      content: `Describe this song in a few words:\n${JSON.stringify(midi)}`,
    },
    {
      role: "assistant",
      content: desc.join(", ") + ".",
    }
  ];
}

function songFromDescription(file: string, midi: t.GetType<typeof MidiSpec>): Message[] {
  const basename = file.replace(".json", "");
  const desc = descriptions[basename];
  return [
    {
      role: "system",
      content: systemPrompt(),
    },
    {
      role: "user",
      content: `Write a song with these characteristics: ${desc.join(", ")}`,
    },
    {
      role: "assistant",
      content: JSON.stringify(midi),
    },
  ];
}

function systemPrompt() {
return `You're an excellent composer of MIDI-style music. Here is the TypeScript spec for MIDI-like JSON:

${toTypescript({ ControlChangeSpec, MidiSpec })}
`
}

function halfArray<T>(arr: T[]) {
  if(arr.length === 0) return arr.concat([]);
  return arr.slice(0, Math.floor(arr.length / 2));
}

prepare();
