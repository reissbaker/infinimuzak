import Link from "next/link";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function MusicIndex() {
  const dir = await fs.readdir(__dirname);
  const jsonFiles = dir.filter(file => file.endsWith(".json"));
  return <div className="flex items-center justify-center w-full flex-col mt-2">
    {
      jsonFiles.map(file => {
        return <Link className="text-sky-500 underline hover:text-sky-300 cursor-pointer" href={`/music/${file}`} key={file}>
          { file }
        </Link>
      })
    }
  </div>
}
