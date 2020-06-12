import FileStream from "./FileStream";
import prettyBytes from "pretty-bytes";

function readHeader(stream: FileStream) {
  const ident = stream.readString(4);
  if (ident !== "ATW0") {
    throw new Error("Invalid ATW file");
  }
  const count = stream.readUint();
  return { count };
}

function readWave(stream: FileStream) {
  let name = stream.readString(33);
  const wavesize = stream.readInt();
  stream.seek(4);
  if (wavesize > 5 * 1000 * 1000) {
    throw new Error("size overflow");
  }
  const data = stream.readBuffer(wavesize);
  name = name.split("\\")[0];
  const size = prettyBytes(wavesize);
  return {
    name,
    data,
    size,
  };
}

export type ATZWAVE = {
  name: string;
  data: Buffer;
  size: string;
};

export function decode(buf: ArrayBuffer) {
  const stream = new FileStream(Buffer.from(buf));
  const { count } = readHeader(stream);
  const waves: ATZWAVE[] = [];
  for (let i = 0; i < count; i++) {
    const wave = readWave(stream);
    waves.push(wave);
  }
  return waves;
}
