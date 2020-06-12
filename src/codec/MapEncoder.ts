import { MapCell } from "./MapReader";
import { ATZTIL, Texture } from "./TerrainEncoder";

export type TiledMapTileSet = {
  first: number;
  source: string;
};

export type TiledMap = {
  name: string;
  width: number;
  height: number;
  baseTiles: number[];
  overTiles: number[];
  collision: number[];
  objects: ATZOBJ[];
  tilesets: TiledMapTileSet[];
};

export type ATZOBJ = {
  x: number; // grid X
  y: number; // grid Y
  id: number; // start id
  start: number; // start frame
  source: string; // which texture package
};

export default class MapEncoder {
  baseTiles: number[] = [];
  overTiles: number[] = [];
  collision: number[] = [];
  tilesets: TiledMapTileSet[] = [];
  objects: ATZOBJ[] = [];

  constructor(
    public name: string,
    public width: number,
    public height: number,
    cells: MapCell[],
    tiles: ATZTIL[],
    textures: Texture[]
  ) {
    let gid = 1;
    this.tilesets = textures.map((texture) => {
      const value = gid;
      gid += texture.count;
      return {
        source: texture.name,
        first: value,
      };
    });

    const getTile = (id: number, index: number) => {
      const block = tiles.find((tile) => tile.id === id);
      if (!block) return;
      return block.rects[index];
    };

    this.baseTiles = Array(cells.length);
    this.collision = Array(cells.length);
    this.overTiles = Array(cells.length);
    this.objects = [];

    cells.forEach((cell, i) => {
      const x = i % width;
      const y = Math.floor(i / width);
      let tile = getTile(cell.tileId, cell.tileNumber);
      let index = 0;
      if (tile) {
        index = tile.uid + this.tilesets[tile.textureId].first;
      }
      this.baseTiles[i] = index;
      this.collision[i] = cell.bMove;
      index = 0;
      if (cell.overId) {
        tile = getTile(cell.overId, cell.overNumber);
        if (tile) {
          index = tile.uid + this.tilesets[tile.textureId].first;
        }
      }
      this.overTiles[i] = index;
      if (cell.objId) {
        const obj: ATZOBJ = {
          id: cell.objId,
          x,
          y,
          source: name + "_obj",
          start: cell.objNumber,
        };
        this.objects.push(obj);
      }
    });
  }

  serialize(): TiledMap {
    const {
      baseTiles,
      collision,
      tilesets,
      name,
      width,
      height,
      overTiles,
      objects,
    } = this;
    return {
      name,
      width,
      height,
      baseTiles,
      collision,
      tilesets,
      overTiles,
      objects,
    };
  }
}
