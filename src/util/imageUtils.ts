export async function decodeImage(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  const loaded = new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(Error("Image loading error"));
  });

  if (img.decode) {
    await img.decode().catch(() => null);
  }
  await loaded;
  return img;
}

export async function blobToImage(blob: Blob) {
  const url = URL.createObjectURL(blob);
  try {
    return await decodeImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function bufferToBitmap(buffer: Buffer) {
  const uint8Array = new Uint8Array(buffer.buffer);
  const blob = new Blob([uint8Array]);
  return await createImageBitmap(blob);
}

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx };
}

export function createCanvasEx(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export async function canvasEncode(
  canvas: HTMLCanvasElement,
  type: string = "image/png",
  quality?: number
) {
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, type, quality)
  );
  const buf = await new Response(blob).arrayBuffer();
  return buf;
}

export async function imageBitmapEncode(
  img: ImageBitmap,
  type: string = "image/png",
  quality?: number
) {
  const canvas = createCanvasEx(img.width, img.height);
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.drawImage(img, 0, 0);
  return await canvasEncode(canvas, type, quality);
}
