import FileStream from "./FileStream";
import { ATZCaption } from "./ATZDecoder";
import { bufferToBitmap } from "../util/imageUtils";
import BinPacker from "./BinPacker";

type BitmapInfo = {
  id: number;
  offsetX: number;
  offsetY: number;
  image?: ImageBitmap;
};

export default class EFTDecoder {
  image!: ImageBitmap;
  caption: ATZCaption = {};
  stream: FileStream;
  ident: string = "";
  count: number = 0;
  size: number = 0;
  maxWidth = 8192;
  maxHeight = 8192;
  constructor(buf: Buffer) {
    this.stream = new FileStream(buf);
    this.size = buf.byteLength;
  }

  async read() {
    this.readHead();
    const list = (await this.readList()) as any;
    this.caption = {};
    const packer = new BinPacker();

    for (let i = 0; i < this.count; i++) {
      const item = list[i];
      const image = item.image as ImageBitmap;
      packer.add({
        id: i,
        image,
        offsetX: item.offsetX,
        offsetY: item.offsetY,
        width: image.width,
        height: image.height,
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
    this.ident = this.stream.readString(4);
    this.stream.seek(0x10, 0);
    this.count = this.stream.readShort();
    this.stream.seek(0x3a, 0);

    if (
      this.ident !== "EFD2" &&
      this.ident !== "EFD0" &&
      this.ident !== "EFD1"
    ) {
      throw new Error("Invalid effect file:" + this.ident);
    }
  }

  async readList() {
    if (this.ident === "EFD2") {
      return await this.readEFD2();
    } else if (this.ident === "EFD1") {
      return await this.readEFD1();
    } else {
      return await this.readEFD0();
    }
  }

  async readEFD0() {
    this.stream.seek(0x6, 0);
    this.count = this.stream.readUShort();
    this.stream.seek(0x73, 0);

    const images: BitmapInfo[] = [];
    for (let i = 0; i < this.count; i++) {
      const ident = this.stream.readString(2);
      if (ident === "BM") {
        this.stream.seek(-2);
        break;
      }
      this.stream.seek(3);
      let offsetX = this.stream.readShort();
      let offsetY = this.stream.readShort();
      this.stream.seek(0x2f - 9);
      const img = {
        id: i,
        offsetX,
        offsetY,
      };
      images.push(img);
    }
    const offset = 0x2f - 8;
    this.eatWhiteSpace(offset);
    await this.readImageData(images);
    return images;
  }

  async readEFD1() {
    this.stream.seek(0x10, 0);
    this.count = this.stream.readUShort();
    this.stream.seek(0x34, 0);
    const images: BitmapInfo[] = [];
    const offset = 0x26 - 8;
    this.readOffsetEFD2(images, offset);
    this.eatWhiteSpace(offset);
    await this.readImageData(images);
    return images;
  }

  async readEFD2() {
    this.stream.seek(0x10, 0);
    this.count = this.stream.readUShort();
    this.stream.seek(0x3a, 0);
    const images: BitmapInfo[] = [];
    const offset = 0x26 - 8;
    this.readOffsetEFD2(images, offset);
    this.eatWhiteSpace(offset);
    await this.readImageData(images);
    return images;
  }

  readOffsetEFD2(images: BitmapInfo[], offset: number) {
    for (let n = 0; n < this.count; n++) {
      let efdident = this.stream.readString(2);
      let id = this.stream.readShort();
      let offsetX = this.stream.readShort();
      let offsetY = this.stream.readShort();
      if (efdident === "BM") {
        this.stream.seek(-8);
        break;
      }
      const img = {
        id,
        offsetX,
        offsetY,
      };
      images.push(img);
      this.stream.seek(offset);
    }
  }

  async eatWhiteSpace(offset: number) {
    while (this.stream._position < this.stream.size) {
      let efdident = this.stream.readString(2);
      this.stream.readShort();
      this.stream.readShort();
      this.stream.readShort();
      if (efdident === "BM") {
        this.stream.seek(-8);
        break;
      }
      this.stream.seek(offset);
    }
  }

  async readImageData(images: BitmapInfo[]) {
    this.count = images.length;
    for (let i = 0; i < this.count; i++) {
      this.stream.seek(2);
      const filesize = this.stream.readInt();
      this.stream.seek(-6);
      const buf = this.stream.readBuffer(filesize);
      const image = await bufferToBitmap(buf);
      images[i].image = image;
    }
  }
}
