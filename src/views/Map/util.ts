import codec from "../../codec";
import { TileBlock } from "../../codec/TileReader";
import { MapCell } from "../../codec/MapReader";
import { FileToWrite, writeFiles } from "../../util/fileSystem";
import { transfer } from "comlink";
import { basename, dirname, resolve } from "path";
import { createCanvasEx, imageBitmapEncode } from "../../util/imageUtils";
import { ObjGroup } from "../../codec/ObjReader";
import { emptyDir } from "fs-extra";

type Props = {
  blocks: TileBlock[];
  name: string;
  width: number;
  height: number;
  cells: MapCell[];
  objGroups: ObjGroup[];
  roofs?: ObjGroup[];
  savePath: string;
};

export async function exportMap(
  { blocks, width, height, cells, objGroups, roofs, savePath }: Props,
  setMessage = (msg: string) => {}
) {
  const root = dirname(savePath);
  const name = basename(savePath).replace(".map", "");

  // Remove image data to speed up transmission
  const atzTiles = blocks.map((n) => ({
    id: n.id,
    width: n.blockWidth,
    height: n.blockHeight,
    count: n.blockCount,
    rects: [],
    images: [],
  }));

  setMessage("Packing terrain data.");
  const result = await codec.encodeTerrain(atzTiles, name);

  // Now, we add the image data for packaging
  result.blocks.forEach((block, i) => {
    block.images = blocks[i].images;
  });

  const cs = result.textures.map((texture) => {
    const canvas = createCanvasEx(texture.width, texture.height);
    return canvas.transferControlToOffscreen();
  });

  setMessage("Packing textures.");
  const bmps = await codec.packTerrainImages(
    result.blocks,
    transfer(cs, cs as any)
  );
  const bufs = await Promise.all(
    bmps.map((bmp) => imageBitmapEncode(bmp, "image/png"))
  );
  const imageDatas = bufs.map((buf) => Buffer.from(buf));

  setMessage("Packing objects.");
  const objs = await codec.encodeObj(objGroups);
  const objsJSON = {} as any;

  const objTextures: FileToWrite[] = [];
  for (let id in objs) {
    let obj = objs[id];
    setMessage(`Creating object:${id}.png`);
    let buf = await imageBitmapEncode(obj.image as ImageBitmap, "image/png");
    delete obj.image;
    objsJSON[id] = obj;
    objTextures.push({
      name: `${name}_obj/${id}.png`,
      data: Buffer.from(buf),
    });
  }

  let roofJSON: any = undefined;
  let roofTextures: FileToWrite[] = [];
  if (roofs) {
    roofJSON = {};
    setMessage("Packing roof objects.");
    const objs = await codec.encodeObj(roofs);
    for (let id in objs) {
      let obj = objs[id];
      setMessage(`Creating object:${id}.png`);
      let buf = await imageBitmapEncode(obj.image as ImageBitmap, "image/png");
      delete obj.image;
      roofJSON[id] = obj;
      roofTextures.push({
        name: `${name}_roof/${id}.png`,
        data: Buffer.from(buf),
      });
    }
  }

  setMessage("Packing map.");
  const mapData = await codec.encodeMap(
    width,
    height,
    name,
    cells,
    result.blocks,
    result.textures
  );

  const files = [] as FileToWrite[];
  files.push({
    name: name + ".map",
    data: JSON.stringify(mapData),
  });
  files.push({
    name: name + "_til.json",
    data: JSON.stringify(
      result.blocks.map(({ id, width, height, count, rects }) => ({
        id,
        width,
        height,
        count,
        rects,
      }))
    ),
  });

  result.textures.forEach((texture, i) => {
    const n = { ...texture };
    delete n.name;
    files.push({
      name: texture.name,
      data: JSON.stringify(n),
    });
    files.push({
      name: texture.image,
      data: imageDatas[i],
    });
  });

  files.push({
    name: `${name}_obj.json`,
    data: JSON.stringify(objsJSON),
  });
  files.push(...objTextures);

  if (roofJSON) {
    files.push({
      name: `${name}_roof.json`,
      data: JSON.stringify(roofJSON),
    });
    files.push(...roofTextures);
    await emptyDir(resolve(root, `${name}_roof`));
  }

  await emptyDir(resolve(root, `${name}_obj`));
  for await (let message of writeFiles(files, root)) {
    setMessage(message);
  }
}
