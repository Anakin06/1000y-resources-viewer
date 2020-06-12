import Setting from "./Setting";

export type Color = { R: number; G: number; B: number; A: number };

const TRANSPARENT = { R: 0, G: 0, B: 0, A: 0 };

export function RGB555(color: number) {
  const b = color & 0x1f;
  const g = (color >> 5) & 0x1f;
  const r = (color >> 10) & 0x1f;
  return [r, g, b];
}

export const COLOR_RED: Color = {
  R: 255,
  G: 0,
  B: 0,
  A: 255,
};

export const COLOR_BLACK: Color = {
  R: 0,
  G: 0,
  B: 0,
  A: 255,
};

export const COLOR_WHITE: Color = {
  R: 255,
  G: 255,
  B: 255,
  A: 255,
};

export function ATZColor(color: number, alphaKey = 31) {
  if (color === 0) {
    return TRANSPARENT;
  } else if (color === alphaKey) {
    return { R: 0, G: 0, B: 0, A: Setting.alpha };
  } else {
    let B = color & 0x1f;
    let G = (color >> 5) & 0x1f;
    let R = (color >> 10) & 0x1f;
    if (R === 1 && G === 1 && B === 1) return TRANSPARENT;
    R *= 8;
    B *= 8;
    G *= 8;

    return { R, G, B, A: 255 };
  }
}

export function setPixel(bitmapData: ImageData, index: number, color: Color) {
  const byteIndex = index * 4;
  bitmapData.data.set([color.R, color.G, color.B, color.A], byteIndex);
}
