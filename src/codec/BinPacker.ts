import { IRectangle, MaxRectsPacker } from "maxrects-packer";

export interface Rectangle extends IRectangle {
  id: number;
  image: ImageBitmap;
  offsetX: number;
  offsetY: number;
}

type PackerOptions = {
  smart: boolean;
  pot: boolean;
  square: boolean;
  allowRotation: boolean;
  tag: boolean;
  border: number;
};

const defaultOptions = {
  smart: true,
  pot: false,
  square: false,
  allowRotation: false,
  tag: false,
  border: 0,
};

export default class BinPacker<T extends IRectangle = Rectangle> {
  rects: T[] = [];
  packer: MaxRectsPacker<T>;
  maxWidth = 0;
  maxHeight = 0;
  padding = 0;

  constructor(
    width: number = 8192,
    height: number = 8192,
    padding = 0,
    options: PackerOptions = defaultOptions
  ) {
    this.maxHeight = height;
    this.maxWidth = width;
    this.padding = padding;
    this.packer = new MaxRectsPacker<T>(
      this.maxWidth,
      this.maxHeight,
      this.padding,
      options
    );
  }

  get bins() {
    return this.packer.bins;
  }

  fit() {
    this.packer.addArray(this.rects);
    this.packer.next();
  }

  add(rect: Omit<T, "x" | "y">) {
    const newRect = Object.assign(rect, {
      x: 0,
      y: 0,
    }) as T;
    this.rects.push(newRect);
  }
}
