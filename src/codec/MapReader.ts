import FileStream from "./FileStream";

export type MapCell = {
  tileId: number;
  tileNumber: number;
  overId: number;
  overNumber: number;
  objId: number;
  objNumber: number;
  roofId: number;
  bMove: number;
};

export default class MapReader extends FileStream {
  blockSize = 0;
  width = 0;
  height = 0;
  cells: MapCell[] = [];
  count = 0;
  constructor(buf: Buffer) {
    super(buf);
    this.readHeader();
    this.readCells();
    this.count = this.width * this.height;
    delete this.buf;
  }

  getCell(x: number, y: number) {
    return this.cells[x + y * this.width];
  }

  getCellByIndex(index: number) {
    return this.cells[index];
  }

  readHeader() {
    let ident = this.readString(16);
    if (ident !== "ATZMAP2") {
      throw new Error(`Invalid map file.`);
    }
    this.blockSize = this.readInt();
    this.width = this.readInt();
    this.height = this.readInt();
  }

  // STRUCT CELL
  //    unsigned short tileId;
  //    byte tileNumber;
  //    unsigned short overId;
  //    byte overNumber;
  //    unsigned short objId;
  //    byte objectNumber;
  //    unsigned short roofId;
  //    byte boMove;
  readCell() {
    const tileId = this.readUShort();
    const tileNumber = this.readByte();
    const overId = this.readUShort();
    const overNumber = this.readByte();
    const objId = this.readUShort();
    const objNumber = this.readByte();
    const roofId = this.readUShort();
    const bMove = this.readByte();
    return {
      tileId,
      tileNumber,
      overId,
      overNumber,
      objId,
      objNumber,
      roofId,
      bMove,
    };
  }

  // 干啥用？ 不清楚
  // struct BLOCK_HEADER
  //   char ident[16]
  //   int changedCount;
  readBlockHeader() {
    this.readString(16);
    this.readInt();
  }

  readBlock(bx: number, by: number) {
    this.readBlockHeader();
    for (let y = 0; y < this.blockSize; y++) {
      for (let x = 0; x < this.blockSize; x++) {
        const cell = this.readCell();
        let mapX = bx * this.blockSize + x;
        let mapY = by * this.blockSize + y;
        let mapIndex = mapX + mapY * this.width;
        this.cells[mapIndex] = cell;
      }
    }
  }

  readCells() {
    this.cells = Array(this.width * this.height);
    const squareAcross = Math.floor(this.width / this.blockSize);
    const squareDown = Math.floor(this.height / this.blockSize);
    for (let y = 0; y < squareDown; y++) {
      for (let x = 0; x < squareAcross; x++) {
        this.readBlock(x, y);
      }
    }
  }

  serialize() {
    const arr = [] as number[];
    this.cells.forEach(
      ({
        tileId,
        tileNumber,
        overId,
        overNumber,
        objId,
        objNumber,
        roofId,
        bMove,
      }) => {
        arr.push(
          tileId,
          tileNumber,
          overId,
          overNumber,
          objId,
          objNumber,
          roofId,
          bMove
        );
      }
    );

    return arr;
  }
}
