const context = new AudioContext();
let source: AudioBufferSourceNode;
let _callback: () => void;
export async function play(id: number, buf: Buffer, callback: () => void) {
  try {
    if (source) {
      source.onended = null;
      source.stop();
    }
    _callback = callback;
    source = context.createBufferSource();
    const data = await context.decodeAudioData(buf.buffer.slice(0));
    source.buffer = data;
    source.connect(context.destination);
    source.start(0);
    source.onended = () => {
      _callback();
    };
  } catch (_) {
    console.error(_);
  }
}

export function clear() {
  if (source) {
    source.onended = null;
    source.stop();
  }
  // @ts-ignore
  _callback = null;
}
