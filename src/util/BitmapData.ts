import { Color } from "./colors";

export class BitmapData {
  private data: ImageData;
  constructor(width: number, height: number) {
    this.data = new ImageData(width, height);
  }

  setPixel(color: Color, index: number) {
    index *= 4;
    this.data.data[index] = color.R;
    this.data.data[index + 1] = color.G;
    this.data.data[index + 2] = color.B;
    this.data.data[index + 3] = color.A;
  }

  async toImage() {
    return await createImageBitmap(this.data);
  }
}
