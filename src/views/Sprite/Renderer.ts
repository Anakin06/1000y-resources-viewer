import { ATZCaption, ATZImageInfo } from "../../codec/ATZDecoder";

export default class Renderer {
  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;
  width = 100;
  height = 100;
  image?: ImageBitmap;
  caption: ATZImageInfo[] = [];
  timer = 0;
  running = false;
  totalFrame = 0;
  currentFrame = 0;
  lastTime = 0;

  start(image: ImageBitmap, caption: ATZCaption) {
    this.image = image;
    this.caption = Object.entries(caption).map(([id, info]) => info);
    this.running = true;
    this.totalFrame = this.caption.length;
    this.currentFrame = 0;
    cancelAnimationFrame(this.timer);
    this.timer = requestAnimationFrame(this.onUpdate);
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    const info = this.caption[this.currentFrame];
    if (!info) return;
    const img = this.image as ImageBitmap;
    const dx = this.width / 2 + info.offsetX;
    const dy = this.height / 2 + info.offsetY;
    this.ctx.drawImage(
      img,
      info.x,
      info.y,
      info.width,
      info.height,
      dx,
      dy,
      info.width,
      info.height
    );
  }
  update(time: number) {
    if (time - this.lastTime > 120) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrame;
      this.lastTime = time;
    }
  }

  onUpdate = (time: number) => {
    this.update(time);
    this.draw();
    requestAnimationFrame(this.onUpdate);
  };

  resize(width: number, height: number) {
    [this.width, this.height] = [width, height];
  }

  setRef = (el: HTMLCanvasElement | null) => {
    if (el && !this.canvas) {
      this.canvas = el;
      this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }
  };
}
