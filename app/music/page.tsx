import Link from "next/link";
import { allTrainingMusic } from "./all-music";

export default async function MusicIndex() {
  const jsonFiles = await allTrainingMusic();
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
