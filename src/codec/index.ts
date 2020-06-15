import { wrap, Remote } from "comlink";
import { WorkerApi } from "./worker";
import { readFile } from "fs-extra";
import MapReader, { MapCell } from "./MapReader";
import { ATZTIL, Options, Texture } from "./TerrainEncoder";
import { ObjGroup } from "./ObjReader";

function Process() {
  return (target: Codec, method: string, descriptor: PropertyDescriptor) => {
    const processFunc = descriptor.value;
    descriptor.value = async function (this: Codec, ...args: any[]) {
      const returnValue = Promise.race([
        processFunc.call(this, ...args),
        new Promise((_, reject) => (this.abortRejector = reject)),
      ]);
      await returnValue.catch(() => {});
      return returnValue;
    };
  };
}

function Timed(label: string) {
  return (target: Codec, method: string, descriptor: PropertyDescriptor) => {
    const func = descriptor.value;
    descriptor.value = async function (this: Codec, ...args: any[]) {
      console.time(label);
      const result = await func.call(this, ...args);
      console.timeEnd(label);
      return result;
    };
  };
}

class Codec {
  protected worker: Remote<WorkerApi>;
  protected abortRejector?: (err: Error) => void;
  private _worker: Worker;
  constructor() {
    this._worker = new Worker("./worker", {
      type: "module",
      name: "worker",
    });
    this.worker = wrap<WorkerApi>(this._worker);
  }

  @Process()
  @Timed("encode terrain")
  async encodeTerrain(blocks: ATZTIL[], name: string, options?: Options) {
    return await this.worker.encodeTerrain(blocks, name, options);
  }

  @Process()
  @Timed("pack tileset")
  async packTerrainImages(blocks: ATZTIL[], canvasList: OffscreenCanvas[]) {
    return await this.worker.packTileSet(blocks, canvasList);
  }

  @Process()
  @Timed("decode map")
  async decodeMap(file: string) {
    const buf = await readFile(file);
    const reader = new MapReader(buf);
    return {
      width: reader.width,
      height: reader.height,
      cells: reader.cells,
    };
  }

  @Process()
  @Timed("decode tile")
  async decodeTile(file: string) {
    const buf = await readFile(file);
    return this.worker.decodeTile(buf.buffer);
  }

  @Process()
  @Timed("decode obj")
  async decodeObj(file: string) {
    const buf = await readFile(file);
    return this.worker.decodeObj(buf.buffer);
  }

  @Process()
  @Timed("encode obj")
  async encodeObj(groups: ObjGroup[]) {
    return this.worker.encodeObjs(groups);
  }

  @Process()
  @Timed("encode map")
  async encodeMap(
    width: number,
    height: number,
    name: string,
    cells: MapCell[],
    tiles: ATZTIL[],
    textures: Texture[]
  ) {
    const tiledMap = await this.worker.encodeMap(
      name,
      width,
      height,
      cells,
      tiles,
      textures
    );

    return tiledMap;
  }

  @Process()
  @Timed("decode audio pkg")
  async decodeAudioPkg(file: string) {
    const buf = await readFile(file);
    const waves = await this.worker.decodeAudioPkg(buf);
    waves.forEach((item) => {
      item.data = Buffer.from(item.data);
    });
    return waves;
  }

  @Process()
  @Timed("decode ATZ file")
  async decodeATZ(file: string) {
    const buf = await readFile(file);
    return await this.worker.decodeATZ(buf);
  }

  @Process()
  @Timed("decode EFT file")
  async decodeEFT(file: string) {
    const buf = await readFile(file);
    return await this.worker.decodeEFT(buf);
  }

  @Process()
  async decodeATD(file: string) {
    const buf = await readFile(file);
    return await this.worker.decodeATD(buf);
  }

  terminate() {
    this._worker.terminate();
  }
}

export default new Codec();
