import FileStream from "./FileStream";
import { Color, setPixel, ATZColor } from "../util/colors";
import settings from "../util/Setting";
import { IRectangle, MaxRectsPacker } from "maxrects-packer";
import BinPacker, { Rectangle } from "./BinPacker";

export interface ATZImageInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export type ATZCaption = {
  [index: number]: ATZImageInfo;
};

export default class ATZDecoder {
  image!: ImageBitmap;
  caption: ATZCaption = {};
  stream: FileStream;
  ident: string = "";
  pattle: Color[] = [];
  count: number = 0;
  size: number = 0;

  constructor(buf: Buffer) {
    this.stream = new FileStream(buf);
    this.size = buf.byteLength;
  }

  async read() {
    this.readHead();
    const packer = new BinPacker<Rectangle>();
    this.caption = {};
    for (let i = 0; i < this.count; i++) {
      const { offsetX, offsetY, img } = await this.readImage();
      packer.add({
        id: i,
        image: img,
        offsetX,
        offsetY,
        width: img.width,
        height: img.height,
      });
    }

    if (this.count === 0) {
      throw new Error("Empty package");
    }

    packer.fit();

    if (packer.bins.length > 1) {
      throw new Error("Size limit");
    }
    const bin = packer.bins[0];
    const canvas = new OffscreenCanvas(bin.width, bin.height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

    const rects = packer.rects;
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      ctx.drawImage(rect.image, rect.x, rect.y);
      this.caption[rect.id] = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        offsetX: rect.offsetX,
        offsetY: rect.offsetY,
      };
    }
    this.image = canvas.transferToImageBitmap();
  }

  transparentColor = 0;
  readHead() {
    let ident = (this.ident = this.stream.readString(4));
    if (ident !== "ATZ0" && ident !== "ATZ1") {
      throw new Error("unknow ident " + ident);
    }
    this.count = this.stream.readUint();
    // transparentColor
    this.transparentColor = this.stream.readUint();

    this.pattle = [];
    for (let i = 0; i < 256; i++) {
      const color = this.readRGB();
      this.pattle.push(color);
    }
    this.pattle[0].A = 0;
  }
  async readImage() {
    let width = this.stream.readUint();
    let height = this.stream.readUint();
    let offsetX = this.stream.readInt();
    let offsetY = this.stream.readInt();

    this.stream.seek(4);
    let img: ImageBitmap;
    if (this.ident === "ATZ0") {
      img = await this.readATZ0(width, height);
    } else {
      img = await this.readATZ1(width, height);
    }
    return { offsetX, offsetY, img };
  }

  async readATZ0(width: number, height: number) {
    const img = new ImageData(width, height);
    for (let i = 0, len = width * height; i < len; i++) {
      let colorIndex = this.stream.readByte();

      let color = this.pattle[colorIndex];

      setPixel(img, i, color);
    }
    return await createImageBitmap(img);
  }

  async readATZ1(width: number, height: number) {
    const img = new ImageData(width, height);
    for (let i = 0, len = width * height; i < len; i++) {
      const color = ATZColor(this.stream.readUShort());
      setPixel(img, i, color);
    }
    return await createImageBitmap(img);
  }

  readRGB() {
    let R = this.stream.readByte();
    let G = this.stream.readByte();
    let B = this.stream.readByte();
    this.stream.seek(1);
    let A = 255;
    if (R === 0 && G === 0 && B === 255) {
      R = 0;
      G = 0;
      B = 0;
      A = settings.alpha;
    }
    return { R, G, B, A };
  }
}
