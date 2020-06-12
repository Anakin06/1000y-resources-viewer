import { EventEmitter } from "events";
import getMapFamily from "../../util/getMapFamily";
import { MapCell } from "../../codec/MapReader";
import codec from "../../codec";
import { ObjGroup } from "../../codec/ObjReader";
import { TileBlock } from "../../codec/TileReader";
import { readFile } from "fs-extra";
import { bufferToBitmap } from "../../util/imageUtils";

import { TW, TH } from "./Renderer";

export default class Loader extends EventEmitter {
  private handleMessage!: (msg: string) => void;
  showName: string = "";
  mapName: string = "";
  width = 0;
  height = 0;
  cells: MapCell[] = [];
  objs: ObjGroup[] = [];
  roofs: ObjGroup[] = [];
  tiles: TileBlock[] = [];
  hasRoofObj: boolean = false;
  thumbImage?: ImageBitmap | HTMLCanvasElement;

  getCell(x: number, y: number) {
    return this.cells[x + y * this.width];
  }

  getTileImage(id: number, index: number) {
    const block = this.tiles.find((n) => n.id === id);
    if (block) return block.images[index];
  }

  getObject(id: number) {
    if (!id) return null;
    return this.objs.find((n) => n.objId === id);
  }

  getRoof(id: number) {
    if (!id) return null;
    return this.roofs.find((n) => n.objId === id);
  }

  onMessage(callback: (msg: string) => void) {
    this.handleMessage = callback;
  }

  async load(file: string) {
    this.hasRoofObj = false;
    const {
      showName,
      tilFile,
      objFile,
      roofFile,
      thumb,
      mapName,
    } = getMapFamily(file);
    this.showName = showName;
    this.mapName = mapName;

    this.thumbImage = await this.tryLoadThumb(thumb);

    this.handleMessage(`Parsing ${file}`);
    const { width, height, cells } = await codec.decodeMap(file);

    this.width = width;
    this.height = height;
    this.cells = cells;

    this.handleMessage(`Parsing ${tilFile}`);
    this.tiles = await codec.decodeTile(tilFile);

    this.handleMessage(`Parsing ${objFile}`);
    this.objs = await codec.decodeObj(objFile);

    this.roofs = this.objs;
    if (roofFile !== objFile) {
      this.hasRoofObj = true;
      this.handleMessage(`Parsing ${roofFile}`);
      this.roofs = await codec.decodeObj(roofFile);
    }

    if (!this.thumbImage) {
      await this.generateThumb();
    }
  }

  async generateThumb() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = (this.height * TH) / TW;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.scale(1, TH / TW);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.getCell(x, y);
        ctx.fillStyle = cell.bMove === 0 ? "#ff6600" : "white";
        ctx.fillRect(x, y, 1, 1);
      }
    }
    this.thumbImage = canvas;
  }

  async tryLoadThumb(file: string) {
    try {
      const buf = await readFile(file);
      const img = await bufferToBitmap(buf);
      return img;
    } catch (_) {
      console.error("Load thumb failed.\n", _);
    }
  }
}
