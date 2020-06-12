import codec from "../../codec";
import { EventEmitter } from "events";
import { FileData } from "./util";
import prettyBytes from "pretty-bytes";
import { ATZCaption } from "../../codec/ATZDecoder";
import { SpriteViewerType } from "./BaseViewer";

export type ATZFile = {
  id: number;
  image: ImageBitmap;
  caption: ATZCaption;
  count: number;
  size: string;
};

type EventMap = {
  load: ATZFile;
};

export default class Loader {
  private event: EventEmitter = new EventEmitter();
  files: { [index: number]: ATZFile } = {};
  loading: boolean = false;
  type: SpriteViewerType = "atz";

  init() {
    this.files = {};
  }

  async load(file: FileData, cache: boolean = true) {
    if (this.files[file.id]) {
      const atzFile = this.files[file.id];
      this.event.emit("load", atzFile);
      return {
        image: atzFile.image,
        caption: atzFile.caption,
      };
    }

    let decode: (
      file: string
    ) => Promise<{
      image: ImageBitmap;
      count: number;
      caption: ATZCaption;
      size: number;
    }>;
    switch (this.type) {
      case "eft":
        decode = codec.decodeEFT;
        break;
      default:
        decode = codec.decodeATZ;
    }
    const { image, count, caption, size } = await decode.call(codec, file.path);
    const atzFile = {
      id: file.id,
      image: image,
      caption,
      count,
      size: prettyBytes(size),
    };
    if (cache) {
      this.files[file.id] = atzFile;
    }
    this.event.emit("load", atzFile);
    return { image, caption };
  }

  on<K extends keyof EventMap>(
    type: K,
    listener: (this: Loader, data: EventMap[K]) => void
  ) {
    this.event.on(type, listener);
  }

  off<K extends keyof EventMap>(
    type: K,
    listener?: (this: Loader, data: EventMap[K]) => void
  ) {
    if (listener) this.event.off(type, listener);
    else {
      this.event.removeAllListeners(type);
    }
  }
}
