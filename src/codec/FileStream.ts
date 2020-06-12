export default class FileStream {
  _position = 0;
  buf!: Buffer;
  size = 0;

  constructor(buf: Buffer) {
    this.buf = buf;
    this.size = buf.byteLength;
  }

  readBuffer(size: number) {
    const newBuff = Buffer.alloc(size);
    this.buf.copy(newBuff, 0, this._position, this._position + size);
    this._position += size;
    return newBuff;
  }

  readInt() {
    let result = this.buf.readInt32LE(this._position);
    this._position += 4;
    return result;
  }

  readShort() {
    let result = this.buf.readInt16LE(this._position);
    this._position += 2;
    return result;
  }

  seek(offset: number, whence: number = 1) {
    if (whence === 1) {
      this._position += offset;
    } else if (whence === 0) {
      this._position = offset;
    }
  }

  readUint() {
    let result = this.buf.readUInt32LE(this._position);
    this._position += 4;
    return result;
  }

  readUShort() {
    let result = this.buf.readUInt16LE(this._position);
    this._position += 2;
    return result;
  }

  readByte() {
    let result = this.buf.readUInt8(this._position);
    this._position += 1;
    return result;
  }

  readString(length: number, encoding = "ASCII") {
    let result = this.buf.toString(
      encoding,
      this._position,
      this._position + length
    );
    this._position += length;
    return result.replace(/\0/g, "");
  }
}
