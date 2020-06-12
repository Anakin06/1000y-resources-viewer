import { basename, resolve, extname } from "path";

import { useEffect, useRef } from "react";
import Loader, { ATZFile } from "./Loader";
import { browserFolder } from "../../util/dialog";
import { imageBitmapEncode } from "../../util/imageUtils";
import { writeFile, emptyDir } from "fs-extra";

export interface Column {
  id: string;
  label: string;
  width?: number;
  align?: "right" | "center";
  format?: (value: number) => string;
}

export interface FileData {
  name: string;
  path: string;
  size: string;
  state: string;
  count: number;
  id: number;
}

export const columns: Column[] = [
  { id: "name", label: "Name" },
  { id: "size", label: "File\u00a0Size", width: 150 },
  {
    id: "state",
    label: "State",
    width: 150,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "count",
    label: "Image\u00a0Count",
    align: "right",
    width: 80,
    format: (value: number) => {
      if (value <= 0) return "N/A";
      return value.toString();
    },
  },
];

export function useLoader(
  file: string[] | string | undefined,
  checkFn: (file?: string | string[]) => file is string[],
  onLoad: (files: FileData[]) => void
) {
  const onLoadRef = useRef(onLoad);
  const internalOnLoad = (files: FileData[]) => onLoadRef.current(files);
  useEffect(() => {
    if (!checkFn(file)) return;
    const files = file.map((name, i) => newData(name, i));
    internalOnLoad(files);
  }, [file, checkFn]);
}

export function useListener(loader: Loader, callback: (file: ATZFile) => void) {
  const ref = useRef(callback);
  useEffect(() => {
    const listener = (file: ATZFile) => ref.current(file);
    loader.on("load", listener);
    return () => {
      loader.off("load", listener);
    };
  }, [loader]);
}

export function newData(path: string, id: number): FileData {
  return {
    id,
    path: path,
    name: basename(path),
    size: "",
    state: "Waiting",
    count: -1,
  };
}

export async function exportATZ(
  loader: Loader,
  files: FileData[],
  callback: (msg: string) => void
) {
  if (files.length === 0) return;
  let root = await browserFolder({ title: "Select the folder to save" });
  if (!root) return;

  let foldername = "";
  switch (loader.type) {
    case "eft":
      foldername = "effect";
      break;
    default:
      foldername = "sprite";
  }
  root = resolve(root, foldername);
  emptyDir(root);
  let index = 0;
  let count = files.length;
  let success = 0;
  for (let file of files) {
    callback(`[${++index}/${count}] Processing ${file.name}`);
    const name = basename(file.name, extname(file.name));
    try {
      const { image, caption } = await loader.load(file, false);
      const imageBuf = Buffer.from(await imageBitmapEncode(image));
      const captionBuffer = JSON.stringify(caption);
      const imagePath = resolve(root, name + ".png");
      const captionPath = resolve(root, name + "_caption.json");
      await writeFile(imagePath, imageBuf);
      await writeFile(captionPath, captionBuffer);
      success++;
    } catch (_) {
      console.error(_);
      callback(`Failed to export ${file.name}`);
    }
    callback(`Succeed: ${success}, Failed: ${count - success}`);
  }
}
