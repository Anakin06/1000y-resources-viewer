import { expose } from "comlink";
import MapReader, { MapCell } from "../MapReader";
import TileReader from "../TileReader";
import ObjReader, { ObjGroup } from "../ObjReader";
import { TerrainEncoder, ATZTIL, Options, Texture } from "../TerrainEncoder";
import MapEncoder from "../MapEncoder";
import ObjEncoder from "../ObjEncoder";
import { decode as audioDecode } from "../AudioPkg";
import EFTDecoder from "../EFTDecoder";
import ATZDecoder from "../ATZDecoder";

const decodeMap = function (buf: ArrayBuffer) {
  const reader = new MapReader(Buffer.from(buf));
  return reader.serialize();
};

const decodeTile = async function (buf: ArrayBuffer) {
  const reader = new TileReader(Buffer.from(buf));
  await reader.read();
  return reader.blocks;
};

const decodeObj = async function (buf: ArrayBuffer) {
  const reader = new ObjReader(Buffer.from(buf));
  await reader.read();
  return reader.objs;
};

const encodeMap = async function (
  name: string,
  width: number,
  height: number,
  cells: MapCell[],
  tiles: ATZTIL[],
  textures: Texture[]
) {
  const encoder = new MapEncoder(name, width, height, cells, tiles, textures);
  return encoder.serialize();
};

const encodeTerrain = async function (
  blocks: ATZTIL[],
  name: string,
  options?: Options
) {
  return await new TerrainEncoder(options).encode(blocks, name);
};

const packTileSet = async function (
  blocks: ATZTIL[],
  canvasList: OffscreenCanvas[]
) {
  return await TerrainEncoder.pack(blocks, canvasList);
};

const encodeObjs = function (groups: ObjGroup[]) {
  return new ObjEncoder().encode(groups);
};

const decodeAudioPkg = function (buf: ArrayBuffer) {
  return audioDecode(buf);
};

const decodeATZ = async function (buf: ArrayBuffer) {
  const reader = new ATZDecoder(Buffer.from(buf));
  await reader.read();
  return {
    image: reader.image,
    caption: reader.caption,
    count: reader.count,
    size: reader.size,
  };
};

const decodeEFT = async function (buf: ArrayBuffer) {
  const reader = new EFTDecoder(Buffer.from(buf));
  await reader.read();
  return {
    image: reader.image,
    caption: reader.caption,
    count: reader.count,
    size: reader.size,
  };
};

const exports = {
  decodeMap,
  decodeTile,
  decodeObj,
  encodeMap,
  encodeTerrain,
  encodeObjs,
  packTileSet,
  decodeAudioPkg,
  decodeATZ,
  decodeEFT,
};

export type WorkerApi = typeof exports;

expose(exports, self as any);
