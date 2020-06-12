import { TW, TH } from "./Renderer";

export type SpriteOptions = {
  x: number;
  y: number;
  textures: ImageBitmap[];
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  id: number;
  frameLength: number;
};

export default class Sprite {
  x = 0;
  y = 0;
  id = 0;
  textures: ImageBitmap[] = [];
  width = 0;
  height = 0;
  offsetX = 0;
  offsetY = 0;
  px: number;
  py: number;
  frameLength = 0;
  totalFrame: number = 0;
  currentFrame = 0;

  constructor(options: SpriteOptions) {
    Object.assign(this, options);
    this.px = this.x * TW + this.offsetX;
    this.py = this.y * TH + this.offsetY;
    this.totalFrame = this.textures.length;
    this.frameLength *= 10;
  }

  getTouchedCell() {
    const tx = Math.floor(this.offsetX / 32) + this.x;
    const ty = Math.floor(this.offsetY / 24) + this.y;
    let w = Math.ceil(this.width / 32);
    let h = Math.ceil(this.height / 24);
    if (this.offsetX % 32 !== 0) w += 1;
    if (this.offsetY % 24 !== 0) h += 1;
    const cells = [] as { x: number; y: number }[];
    for (let y = ty; y < ty + h; y++) {
      for (let x = tx; x < tx + w; x++) {
        if (x === this.x && y === this.y) continue;
        cells.push({ x, y });
      }
    }
    return cells;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.textures[this.currentFrame],
      this.px,
      this.py,
      this.width,
      this.height
    );
  }

  lastTime: number = 0;
  update(time: number) {
    if (this.totalFrame <= 1) return;
    if (time - this.lastTime > this.frameLength) {
      this.lastTime = time;
      this.currentFrame = (this.currentFrame + 1) % this.totalFrame;
    }
  }
}
