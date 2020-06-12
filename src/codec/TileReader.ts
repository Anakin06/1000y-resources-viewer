import FileStream from "./FileStream";
import { readFile } from "fs-extra";
import { ATZColor, setPixel } from "../util/colors";

export type TileBlock = {
  id: number;
  style: number;
  blockWidth: number;
  blockHeight: number;
  blockCount: number;
  tileWidth: number;
  tileHeight: number;
  aniDelay: number;
  images: ImageBitmap[];
};

export default class TileReader {
  count = 0;
  blocks: TileBlock[] = [];
  stream!: FileStream;
  constructor(public buf: Buffer) {
    this.stream = new FileStream(buf);
  }

  async read() {
    this.readHeader();
    for (let i = 0; i < this.count; i++) {
      await this.readBlock();
    }
  }

  getImage(id: number, index: number) {
    const block = this.blocks.find((n) => n.id === id);
    if (block) return block.images[index];
  }

  // int tileId
  // byte style
  // int width
  // int height
  // int count
  // int tileWidth
  // int tileHeight
  // byte[64] mBuffer
  // uint aniDelay
  // int[4] none
  readBlockHeader() {
    let id = this.stream.readInt();
    let style = this.stream.readByte();
    let blockWidth = this.stream.readInt();
    let blockHeight = this.stream.readInt();
    let blockCount = this.stream.readInt();
    let tileWidth = this.stream.readInt();
    let tileHeight = this.stream.readInt();
    this.stream.seek(64);
    let aniDelay = this.stream.readUint();
    this.stream.seek(20);
    return {
      id,
      style,
      blockWidth,
      blockHeight,
      blockCount,
      tileWidth,
      tileHeight,
      aniDelay,
    };
  }

  async readBlock() {
    let header = this.readBlockHeader();
    let block: TileBlock = { ...header, images: [] };
    const count = header.blockCount * header.blockWidth * header.blockHeight;
    for (let i = 0; i < count; i++) {
      let width = header.tileWidth;
      let height = header.tileHeight;
      let data = new ImageData(width, height);
      for (let i = 0, len = width * height; i < len; i++) {
        //RGB555
        const rawColor = this.stream.readUShort();
        const color = ATZColor(rawColor);
        setPixel(data, i, color);
      }
      block.images.push(await createImageBitmap(data));
    }
    this.blocks.push(block);
  }

  // STRUCT FILEHEAD
  //   char[8] ident
  //   int count
  //   int[1024] pos //应该是用来快速索引的地址？反正我用不到
  readHeader() {
    const ident = this.stream.readString(8);
    if (ident !== "ATZTIL2") {
      throw new Error(`Invalid ATZTIL file.`);
    }
    this.count = this.stream.readUint();
    this.stream.seek(1024 * 4);
  }
}
