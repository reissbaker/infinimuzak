import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function allMusic() {
  const dir = await fs.readdir(__dirname);
  return dir.filter(file => file.endsWith(".json"));
}
