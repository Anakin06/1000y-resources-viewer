import FileStream from "./FileStream";
import { readFile } from "fs-extra";
import { ATZColor, setPixel } from "../util/colors";

export type ObjGroup = {
  aniId: number;
  objId: number;
  objType: number;
  width: number;
  height: number;
  imageCount: number;
  startId: number;
  endId: number;
  iWidth: number;
  iHeight: number;
  ipx: number;
  ipy: number;
  aniDelay: number;
  dataPos: number;
  images: ImageBitmap[];
};

export default class ObjReader {
  stream!: FileStream;
  ident = "";
  count = 0;
  objs: ObjGroup[] = [];
  constructor(buf: Buffer) {
    this.stream = new FileStream(buf);
  }

  get(id: number) {
    if (!id) return null;
    return this.objs.find((n) => n.objId === id);
  }

  async read() {
    this.readHeader();
    for (let i = 0; i < this.count; i++) {
      await this.readObj();
    }
  }

  async readObj() {
    if (this.ident === "ATZOBJ2") {
      await this.readObj2();
    } else if (this.ident === "ATZOBJ3") await this.readObj3();
  }

  /**
     *  ObjectId: integer;
        MWidth, MHeight: Integer;
        IWidth, IHeight: Integer;
        Ipx, Ipy: Integer;
        MBuffer: array[0..OBJECT_CELL_MAX - 1] of byte;
        AniDelay: DWORD;
        None: array[0..4 - 1] of integer;
     */
  readObj2Header() {
    let aniId = 0;
    let objId = this.stream.readInt();
    let width = this.stream.readInt();
    let height = this.stream.readInt();
    let iWidth = this.stream.readInt();
    let iHeight = this.stream.readInt();
    let ipx = this.stream.readInt();
    let ipy = this.stream.readInt();

    this.stream.seek(256);
    let aniDelay = this.stream.readInt();
    this.stream.seek(20);
    return {
      aniId,
      objId,
      objType: -1,
      width,
      height,
      imageCount: 0,
      startId: 0,
      endId: 0,
      iWidth,
      iHeight,
      ipx,
      ipy,
      aniDelay,
      dataPos: 0,
    };
  }

  async readObj2() {
    const header = this.readObj2Header();
    const images: ImageBitmap[] = [];
    for (let i = 0; i < 1; i++) {
      const data = new ImageData(header.iWidth, header.iHeight);
      for (let i = 0, len = header.iWidth * header.iHeight; i < len; i++) {
        const rawColor = this.stream.readUShort();
        const color = ATZColor(rawColor);
        setPixel(data, i, color);
      }
      images.push(await createImageBitmap(data));
    }
    this.objs.push({ ...header, images });
  }

  async readObj3() {
    const header = this.readObjHeader();
    const images: ImageBitmap[] = [];
    for (let k = 0; k < header.imageCount; k++) {
      const data = new ImageData(header.iWidth, header.iHeight);
      for (let i = 0, len = header.iWidth * header.iHeight; i < len; i++) {
        let rawColor = this.stream.readUShort();
        const color = ATZColor(rawColor);
        setPixel(data, i, color);
      }
      images.push(await createImageBitmap(data));
    }
    this.objs.push({ ...header, images });
  }

  readObjHeader() {
    let aniId = this.stream.readInt();
    let objId = this.stream.readInt();
    let objType = this.stream.readByte();
    let width = this.stream.readInt();
    let height = this.stream.readInt();
    let imageCount = this.stream.readInt();
    let startId = this.stream.readInt();
    let endId = this.stream.readInt();
    let iWidth = this.stream.readInt();
    let iHeight = this.stream.readInt();
    let ipx = this.stream.readInt();
    let ipy = this.stream.readInt();
    this.stream.seek(256);
    let aniDelay = this.stream.readInt();
    let dataPos = this.stream.readInt();
    this.stream.seek(20);
    return {
      aniId,
      objId,
      objType,
      width,
      height,
      imageCount,
      startId,
      endId,
      iWidth,
      iHeight,
      ipx,
      ipy,
      aniDelay,
      dataPos,
    };
  }

  readHeader() {
    this.ident = this.stream.readString(8);
    this.count = this.stream.readInt();
    if (this.ident !== "ATZOBJ2" && this.ident !== "ATZOBJ3") {
      throw new Error(`Invalid ATZOBJ file.`);
    }
  }
}
