import { MaxRectsPacker, IRectangle, IOption } from "maxrects-packer";

interface Rectangle extends IRectangle {
  uid: number;
  id: number;
  index: number;
  textureId: number;
}

type TerrainEncoderOptions = {
  maxWidth: number;
  maxHeight: number;
  NPOT: boolean;
  square: boolean;
  border: number;
  padding: number;
};

const defaultOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  NPOT: true,
  square: false,
  border: 0,
  padding: 0,
};

export type Texture = {
  width: number;
  height: number;
  columns: number;
  count: number;
  name: string;
  image: string;
  padding: number;
};

export type ATZTIL = {
  id: number;
  width: number;
  height: number;
  count: number;
  rects: Rectangle[];
  images: ImageBitmap[];
};

export type Options = Partial<TerrainEncoderOptions>;

export class TerrainEncoder {
  uniqueId = 0;
  packerOptions: IOption;
  maxWidth = 2048;
  maxHeight = 2048;
  padding = 0;
  TW = 0;
  TH = 0;
  constructor(options: Options = {}, TW = 32, TH = 24) {
    const o = Object.assign(defaultOptions, options);
    this.TW = TW;
    this.TH = TH;
    this.packerOptions = {
      smart: true,
      pot: !o.NPOT,
      square: o.square,
      allowRotation: false,
      tag: false,
      border: o.border,
    };
    this.maxHeight = o.maxHeight;
    this.maxWidth = o.maxWidth;
    this.padding = o.padding;
  }

  createPacker() {
    return new MaxRectsPacker<Rectangle>(
      this.maxWidth,
      this.maxHeight,
      this.padding,
      this.packerOptions
    );
  }

  async encode(blocks: ATZTIL[], name: string) {
    const rects = [] as Rectangle[];
    blocks.forEach((block) => {
      const { id, width, height, count } = block;
      block.rects = this.initRectangles(id, width * height * count);
      rects.push(...block.rects);
    });

    const packer = this.createPacker();
    packer.addArray(rects);
    packer.next();

    const textures = [] as Texture[];
    const cw = this.TW + this.padding;
    const ch = this.TH + this.padding;
    packer.bins.map((bin, i) => {
      const { rects, width, height } = bin;

      // First, calculate how many columns a row
      let columns = 0;
      rects.forEach((rect) => {
        rect.textureId = i;
        const x = rect.x / cw;
        if (x > columns) columns = x;
      });
      columns += 1;

      const texture: Texture = {
        width,
        height,
        columns: columns,
        name: `${name}_${i}.til`,
        image: `${name}_${i}.png`,
        padding: this.padding,
        count: rects.length,
      };
      textures.push(texture);

      // uid := index
      rects.forEach((rect) => {
        rect.textureId = i;
        const x = rect.x / cw;
        const y = rect.y / ch;
        rect.uid = x + y * columns;
      });
    });
    return {
      blocks,
      textures,
    };
  }

  initRectangles(id: number, count: number) {
    const rects = [] as Rectangle[];
    for (let i = 0; i < count; i++) {
      rects.push({
        id,
        index: i,
        uid: 0,
        textureId: 0,
        x: 0,
        y: 0,
        width: this.TW,
        height: this.TH,
      });
    }
    return rects;
  }

  static async pack(blocks: ATZTIL[], canvasList: OffscreenCanvas[]) {
    const ctxs = canvasList.map(
      (c) => c.getContext("2d") as OffscreenCanvasRenderingContext2D
    );
    blocks.forEach((block) => {
      const { rects, images } = block;
      rects.forEach((rect, i) => {
        const ctx = ctxs[rect.textureId];
        const { x, y, width, height } = rect;
        ctx.drawImage(images[i], x, y, width, height);
      });
    });
    return canvasList.map((canvas) => {
      return canvas.transferToImageBitmap();
    });
  }
}
