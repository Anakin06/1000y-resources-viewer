import { EventEmitter } from "events";
import prettyBytes from "pretty-bytes";
import { browserFolder } from "../../util/dialog";
import { resolve, basename, extname } from "path";
import { emptyDir, writeFile } from "fs-extra";
import codec from "../../codec";
import { ATZCaption } from "../../codec/ATZDecoder";
import { imageBitmapEncode } from "../../util/imageUtils";

export type ATD = "atd";
export type ATZ = "atz";
export type EFT = "eft";

export type ATDFile = {
  id: number;
  size: string;
  jsonString: string;
};

export type ATZFile = {
  id: number;
  image: ImageBitmap;
  caption: ATZCaption;
  count: number;
  size: string;
};

type EventMaps = {
  atd: {
    load: ATDFile;
  };
  atz: {
    load: ATZFile;
  };
  eft: {
    load: ATZFile;
  };
};

export type BaseRecord = {
  id: number;
  name: string;
  path: string;
};

export interface ATDRecord extends BaseRecord {
  size: string;
  state: string;
}

export interface ATZRecord extends BaseRecord {
  size: string;
  state: string;
  count: number;
}

export type ALLTYPES = ATD | ATZ | EFT;

export function isATD(type: ALLTYPES): type is ATD {
  return type === "atd";
}

export function isATZ(type: ALLTYPES): type is ATZ {
  return type === "atz";
}

export function isEFT(type: ALLTYPES): type is EFT {
  return type === "eft";
}

type deocdeFn = (
  file: string
) => Promise<{
  image: ImageBitmap;
  count: number;
  caption: ATZCaption;
  size: number;
}>;

export default class Loader<
  T extends ALLTYPES,
  U extends BaseRecord = BaseRecord
> {
  type: ALLTYPES;
  constructor(type: T) {
    this.type = type;
  }
  event: EventEmitter = new EventEmitter();
  caches: { [index: number]: EventMaps[T]["load"] } = {};

  async load(file: U, cache: boolean = false) {
    if (this.caches[file.id]) {
      this.emit("load", this.caches[file.id]);
      return this.caches[file.id];
    }

    if (isATD(this.type)) {
      const { size, jsonString } = await codec.decodeATD(file.path);
      const result: EventMaps[T]["load"] = {
        id: file.id,
        size: prettyBytes(size),
        jsonString,
      };
      if (cache) {
        this.caches[file.id] = result;
      }
      this.emit("load", result);
      return result;
    } else if (isATZ(this.type) || isEFT(this.type)) {
      let decode: deocdeFn = codec.decodeATZ;
      if (isEFT(this.type)) decode = codec.decodeEFT;
      const { image, count, caption, size } = await decode.call(
        codec,
        file.path
      );
      const result: EventMaps[T]["load"] = {
        id: file.id,
        image: image,
        caption,
        count,
        size: prettyBytes(size),
      };
      if (cache) {
        this.caches[file.id] = result;
      }
      this.emit("load", result);
      return result;
    }
  }

  async exportData(files: U[], notice: (msg: string) => void) {
    if (files.length === 0) return;
    let root = await browserFolder({ title: "Select the folder to save" });
    if (!root) return;

    const folder = await this.initDestFolderName(root);
    switch (this.type) {
      case "atd":
        await this.exportATD(files, notice, folder);
        break;
      case "atz":
      case "eft":
        await this.exportATZ(files, notice, folder);
        break;
    }
  }

  async exportATZ(files: U[], notice: (msg: string) => void, root: string) {
    let index = 0;
    let count = files.length;
    let success = 0;
    for (let file of files) {
      notice(`[${++index}/${count}] Processing ${file.name}`);
      const name = basename(file.name, extname(file.name));
      try {
        const { image, caption } = (await this.load(file)) as ATZFile;
        const imageBuf = Buffer.from(await imageBitmapEncode(image));
        const captionBuffer = JSON.stringify(caption);
        const imagePath = resolve(root, name + ".png");
        const captionPath = resolve(root, name + "_caption.json");
        await writeFile(imagePath, imageBuf);
        await writeFile(captionPath, captionBuffer);
        success++;
      } catch (_) {
        console.error(_);
        notice(`Failed to export ${file.name}`);
      }
      notice(`Succeed: ${success}, Failed: ${count - success}`);
    }
  }

  async exportATD(files: U[], notice: (msg: string) => void, root: string) {
    let index = 0;
    let count = files.length;
    let success = 0;
    for (let file of files) {
      notice(`[${++index}/${count}] Processing ${file.name}`);
      const name = basename(file.name, extname(file.name));
      try {
        const { jsonString } = (await this.load(file)) as ATDFile;
        const atdPath = resolve(root, name + ".json");
        await writeFile(atdPath, jsonString);
        success++;
      } catch (_) {
        console.error(_);
        notice(`Failed to export ${file.name}`);
      }
      notice(`Succeed: ${success}, Failed: ${count - success}`);
    }
  }

  async initDestFolderName(root: string) {
    let foldername = "";
    switch (this.type) {
      case "atd":
        foldername = "action";
        break;
      case "eft":
        foldername = "effect";
        break;
      default:
        foldername = "sprite";
    }
    const folder = resolve(root, foldername);
    await emptyDir(folder);
    return folder;
  }

  emit<K extends keyof EventMaps[T]>(type: K, data: EventMaps[T][K]) {
    this.event.emit(type as string, data);
  }

  on<K extends keyof EventMaps[T]>(
    type: K,
    listener: (this: Loader<T, U>, data: EventMaps[T][K]) => void
  ) {
    this.event.on(type as string, listener);
  }

  off<K extends keyof EventMaps[T]>(
    type: K,
    listener?: (this: Loader<T>, data: EventMaps[T][K]) => void
  ) {
    if (listener) this.event.off(type as string, listener);
    else {
      this.event.removeAllListeners(type as string);
    }
  }
}
