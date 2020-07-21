import * as fs from "fs";

export function safeMkDir(path: string): void {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}
