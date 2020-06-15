import FileStream from "./FileStream";

const format = (value: string) => {
  value = value.trim();
  if (/^-?\d+$/.test(value)) {
    return Number(value);
  }
  if (value.length === 0) {
    return null;
  }
  return value;
};

export default class EFTDecoder {
  stream: FileStream;
  size = 0;
  jsonString = "";
  constructor(buf: Buffer) {
    this.stream = new FileStream(buf);
    this.size = buf.byteLength;
    const chunkSize = 255;
    const size = buf.byteLength / chunkSize;
    for (let i = 0; i < buf.byteLength; i++) {
      let b = buf[i];
      let h = b & 0xf0;
      let l = b & 0x0f;
      b = (h >> 4) + (l << 4);
      buf[i] = b;
    }

    const stringBuffer: string[] = [];
    for (let i = 0; i < size; i++) {
      const index = i * 255;
      const length = buf[index];
      const str = buf.toString("utf8", index + 1, index + length + 1);
      stringBuffer.push(str);
    }

    const fields = stringBuffer[0].split(",");
    const actions: any[] = [];
    for (let i = 1; i < size; i++) {
      const action = {} as any;
      const values = stringBuffer[i].split(",");
      fields.forEach((field, i) => {
        const value = format(values[i]);
        if (value !== null) {
          action[field] = value;
        }
      });
      actions.push(action);
    }
    this.jsonString = JSON.stringify(actions);
  }

  async read() {}
}
