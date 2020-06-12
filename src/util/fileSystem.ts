import { writeFile } from "fs-extra";
import { resolve } from "path";
import { canvasEncode } from "./imageUtils";

export type FileToWrite = {
  name: string;
  data: Buffer | string | HTMLCanvasElement;
};

export function* writeFiles(
  files: FileToWrite[],
  root: string,
  imgType = "image/png"
) {
  const length = files.length;
  for (let i = 0; i < length; i++) {
    const file = files[i];
    const path = resolve(root, file.name);
    yield `[${i}/${length}]  Writing ${path}.`;
    yield writeSingleFile(path, file.data, imgType);
  }
}

export async function writeSingleFile(
  path: string,
  data: Buffer | string | HTMLCanvasElement,
  imgType?: string
) {
  if (isCanvas(data)) {
    data = Buffer.from(await canvasEncode(data, imgType));
  }
  await writeFile(path, data);
  return `Successfully created ${path}.`;
}

function isCanvas(data: any): data is HTMLCanvasElement {
  return Object.prototype.toString.call(data) === "[object HTMLCanvasElement]";
}
