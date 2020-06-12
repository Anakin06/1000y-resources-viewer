import { EventEmitter } from "events";
import Loader from "./Loader";
import native, {
  IViewConfig,
  viewConfig as config,
  enableOpenMenu,
} from "../../components/MenuEx/native";
import Rectangle from "./Rectangle";
import Dragable from "./Dragable";
import Vector2 from "./Vector2";
import Sprite from "./Sprite";
import { ObjGroup } from "../../codec/ObjReader";
import { exportMap } from "./util";
import { browserSaveAs } from "../../util/dialog";
export const TW = 32;
export const TH = 24;

type EventMap = {
  message: { message: string; loading?: boolean };
  info: { filename: string; title: string };
  size: { x: number; y: number };
  load: {
    thumb: HTMLImageElement | HTMLCanvasElement;
    width: number;
    height: number;
  };
  move: {
    x: number;
    y: number;
  };
};

type Cell = {
  x: number;
  y: number;
  moveable: boolean;
  tile?: ImageBitmap;
  overTile?: ImageBitmap;
  object?: Sprite;
  roof?: Sprite;
  touchedSprites: Sprite[];
};

const dragable = new Dragable();

export default class Renderer extends EventEmitter {
  viewConfig: IViewConfig = {
    showTerrain: true,
    showObject: true,
    showRoof: true,
    showGrid: true,
  };
  ctx: CanvasRenderingContext2D;
  width = 0;
  height = 0;
  loader = new Loader();
  running = false;
  timer = 0;
  location = new Vector2();
  currentLoc = new Vector2();
  viewport = new Rectangle();
  maxpw = 0;
  maxph = 0;
  cells: Cell[][] = [];
  sprites: Sprite[] = [];
  constructor(public canvas: HTMLCanvasElement) {
    super();
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.resize(canvas.width, canvas.height);
    this.loader.onMessage(this.setMessage);
    native.on("viewchange", this.onViewChange);
    native.on("export", this.onExport);
    dragable.wrap(canvas, this.onDragStart, this.onDrag);
  }

  onExport = async () => {
    if (!this.loaded) return;
    const name = this.loader.mapName.toLowerCase();
    const savePath = await browserSaveAs({
      defaultPath: name,
      title: "Export As ...",
      filters: [
        {
          extensions: ["map"],
          name: "MapFile",
        },
      ],
    });

    if (!savePath) return;

    const options = {
      blocks: this.loader.tiles,
      width: this.loader.width,
      height: this.loader.height,
      cells: this.loader.cells,
      name,
      savePath,
      objGroups: this.loader.objs,
      roofs: this.loader.hasRoofObj ? this.loader.roofs : undefined,
    };
    try {
      enableOpenMenu(false);
      await exportMap(options, (msg) => this.setMessage(msg, true));
      this.setMessage(`Map:${name} created.`, false);
    } catch (_) {
      console.error(_);
      this.setMessage(`Failed to create map.`, false);
    } finally {
      enableOpenMenu(true);
    }
  };

  on<K extends keyof EventMap>(
    type: K,
    listener: (this: Renderer, data: EventMap[K]) => void
  ) {
    super.on(type, listener);
    return this;
  }

  onDragStart = () => {
    this.currentLoc = this.location.clone();
  };

  onDrag = (x: number, y: number) => {
    if (!this.running) return;
    const pos = this.currentLoc.add(x, y).clamp(0, this.maxpw, 0, this.maxph);
    this.setLocation(pos);
  };

  onViewChange = () => {
    Object.assign(this.viewConfig, config);
  };

  onUpdate = (time: number) => {
    this.update(time);
    this.draw();
    this.timer = requestAnimationFrame(this.onUpdate);
  };

  update(time: number) {
    const { x, y } = this.pixelToMapPos();
    this.viewport.x = x;
    this.viewport.y = y;
    this.sprites.forEach((s) => s.update(time));
  }

  draw() {
    const { showTerrain, showObject, showRoof, showGrid } = this.viewConfig;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(-this.location.x, -this.location.y);
    showTerrain && this.drawTerrain();
    showObject && this.drawObjects();
    showRoof && this.drawRoof();
    showGrid && this.drawGrid();
    this.ctx.restore();
  }

  drawTerrain() {
    this.forEachVisibleCell((cell) => {
      cell.tile &&
        this.ctx.drawImage(cell.tile, cell.x * TW, cell.y * TH, TW, TH);
      cell.overTile &&
        this.ctx.drawImage(cell.overTile, cell.x * TW, cell.y * TH, TW, TH);
    });
  }

  drawObjects() {
    let sprites: Sprite[] = [];
    let dict = {} as any;
    const addSprite = (sprite: Sprite) => {
      if (dict[sprite.id]) return;
      dict[sprite.id] = true;
      sprites.push(sprite);
    };
    this.forEachVisibleCell((cell) => {
      cell.object && addSprite(cell.object);
      cell.touchedSprites.forEach((s) => addSprite(s));
    });
    sprites.sort(this.sortFn);
    sprites.forEach((s) => s.draw(this.ctx));
  }

  drawRoof() {
    this.forEachVisibleCell((cell) => {
      cell.roof && cell.roof.draw(this.ctx);
    });
  }

  drawGrid() {
    const { left, right, top, bottom, width, height } = this.viewport;
    this.ctx.save();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "lime";
    this.ctx.globalAlpha = 0.3;
    this.ctx.beginPath();
    for (let y = top; y < bottom; y++) {
      this.ctx.moveTo(left * TW, y * TH + 0.5);
      this.ctx.lineTo((left + width) * TW, y * TH + 0.5);
    }
    for (let x = left; x < right; x++) {
      this.ctx.moveTo(x * TW + 0.5, top * TH);
      this.ctx.lineTo(x * TW + 0.5, (top + height) * TH);
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
  }

  setLocation(value: Vector2) {
    this.location = value;
    this.emit("move", { x: value.x, y: value.y });
  }

  forEachVisibleCell(callback: (cell: Cell) => void) {
    const { left, top, right, bottom } = this.viewport;
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        callback(this.cells[x][y]);
      }
    }
  }

  start() {
    Object.assign(this.viewConfig, config);
    this.setLocation(Vector2.Zero());
    this.viewport.setBoundingbox(0, 0, this.loader.width, this.loader.height);
    this.setClamp();
    this.running = true;
    cancelAnimationFrame(this.timer);
    this.timer = requestAnimationFrame(this.onUpdate);
  }

  setClamp() {
    this.maxpw = Math.max(0, this.loader.width * TW - this.width);
    this.maxph = Math.max(0, this.loader.height * TH - this.height);
  }

  resize(width: number, height: number) {
    [this.width, this.height] = [width, height];
    this.viewport.width = Math.ceil(this.width / TW) + 1;
    this.viewport.height = Math.ceil(this.height / TH) + 1;
    this.setClamp();
  }

  setMessage = (message: string, loading?: boolean) => {
    this.emit("message", { message, loading });
  };

  setInfo(filename: string, title: string) {
    this.emit("info", { filename, title });
  }

  setSizeInfo(x: number, y: number) {
    this.emit("size", { x, y });
  }

  pixelToMapPos() {
    let { x, y } = this.location;
    x = Math.floor(x / TW);
    y = Math.floor(y / TH);
    return { x, y };
  }

  clear() {
    this.running = false;
    native.off("viewchange", this.onViewChange);
    native.off("export", this.onExport);
    this.removeAllListeners();
    dragable.unwrap(this.canvas);
  }

  initCells() {
    console.time("init cells");
    const w = this.loader.width;
    const h = this.loader.height;
    this.cells = [];
    this.sprites = [];
    for (let x = 0; x < w; x++) {
      const row = [] as Cell[];
      this.cells[x] = row;
      for (let y = 0; y < h; y++) {
        const {
          bMove,
          objId,
          roofId,
          tileId,
          tileNumber,
          overId,
          overNumber,
        } = this.loader.getCell(x, y);
        const cell: Cell = { x, y, moveable: bMove === 0, touchedSprites: [] };
        row[y] = cell;
        const tile = this.loader.getTileImage(tileId, tileNumber);
        cell.tile = tile;
        overId &&
          (cell.overTile = this.loader.getTileImage(overId, overNumber));

        const obj = this.loader.getObject(objId);
        const id = y * w + x;
        if (obj) {
          const sprite = this.createSprite(x, y, id, obj);
          this.sprites.push(sprite);
          cell.object = sprite;
        }

        const roof = this.loader.getRoof(roofId);
        if (roof) {
          const sprite = this.createSprite(x, y, id, roof);
          this.sprites.push(sprite);
          cell.roof = sprite;
        }
      }
    }

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const cell = this.cells[x][y];
        const sprite = cell.object;
        if (!sprite) continue;
        sprite.getTouchedCell().forEach(({ x, y }) => {
          let row = this.cells[x];
          const cell = row && row[y];
          cell && cell.touchedSprites.push(sprite);
        });
      }
    }
    console.timeEnd("init cells");
  }

  createSprite(x: number, y: number, id: number, obj: ObjGroup) {
    return new Sprite({
      x,
      y,
      id,
      width: obj.iWidth,
      height: obj.iHeight,
      offsetX: obj.ipx,
      offsetY: obj.ipy,
      textures: obj.images,
      frameLength: obj.aniDelay,
    });
  }

  sortFn = (a: Sprite, b: Sprite) => {
    if (a.y > b.y) {
      return 1;
    } else if (a.y < b.y) {
      return -1;
    } else {
      if (a.x > b.x) {
        return 1;
      } else if (a.x < b.x) {
        return -1;
      }
      return 0;
    }
  };

  loaded = false;
  async load(file: string) {
    this.loaded = false;
    this.setInfo("", "");
    this.setSizeInfo(-1, -1);
    await this.loader.load(file);
    this.setInfo(this.loader.showName, file);
    this.setSizeInfo(this.loader.width, this.loader.height);
    this.emit("load", {
      thumb: this.loader.thumbImage,
      width: this.loader.width,
      height: this.loader.height,
    });
    this.loaded = true;
    this.initCells();
    this.start();
  }
}
