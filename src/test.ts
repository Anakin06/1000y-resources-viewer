import { createCanvas } from "./util/imageUtils";

export async function dbCall() {}

const loadMap = async (name: string) => {
  return await (await fetch(name)).json();
};

class TileSet {
  constructor(
    public image: ImageBitmap,
    public columns: number,
    public gid: number
  ) {}

  getFrame(id: number) {
    const localId = id - this.gid;
    const x = localId % this.columns;
    const y = Math.floor(localId / this.columns);
    return {
      texture: this.image,
      frame: {
        x: x * 32,
        y: y * 24,
        width: 32,
        height: 24,
      },
    };
  }
}

async function loadTileset(tilesets: { first: number; source: string }[]) {
  return await Promise.all(
    tilesets.map(async ({ first, source }) => {
      const tileset = await (await fetch("map/" + source)).json();
      const img = new Image();
      img.src = "map/" + tileset.image;
      await new Promise((resolve) => (img.onload = resolve));
      const bmp = await createImageBitmap(img);
      return new TileSet(bmp, tileset.columns, first);
    })
  );
}

async function bootstrap() {
  const { canvas, ctx } = createCanvas(800, 600);
  document.body.appendChild(canvas);
  const map = await loadMap("map/start.map");

  const width = map.width;

  const location = { x: 5, y: 5 };
  const tiles = map.baseTiles as number[];
  console.log(map);

  const tileSets = await loadTileset(map.tilesets);

  const getTexture = (index: number) => {
    if (index === 0) return;
    let i = 0;
    let current: TileSet = tileSets[i];

    while (current.gid < index) {
      let tmp = tileSets[++i];
      if (!tmp || tmp.gid > index) {
        break;
      }
      current = tmp;
    }

    return current.getFrame(index);
  };

  console.time("a");
  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < 25; x++) {
      const dx = x + location.x;
      const dy = y + location.y;

      const tileId = tiles[dx + dy * width];
      let texture = getTexture(tileId);
      if (texture) {
        ctx.drawImage(
          texture.texture,
          texture.frame.x,
          texture.frame.y,
          texture.frame.width,
          texture.frame.height,
          x * 32,
          y * 24,
          32,
          24
        );
      }

      texture = getTexture(map.overTiles[dx + dy * width]);
      if (texture) {
        ctx.drawImage(
          texture.texture,
          texture.frame.x,
          texture.frame.y,
          texture.frame.width,
          texture.frame.height,
          x * 32,
          y * 24,
          32,
          24
        );
      }
    }
  }
  console.timeEnd("a");
}

bootstrap();
