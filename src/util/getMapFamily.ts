import path from "path";
import fs from "fs-extra";

import mapData from "./data.json";

function capitalize(str: String) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const getFile = (root: string, mapName: string, type: string) => {
  const ext = "." + type;
  let file = path.resolve(root, mapName + ext);

  if (!fs.existsSync(file)) {
    file = path.resolve(root, "south" + type + ext);
  }
  return file;
};

export default function getMapFamily(mapFile: string) {
  const mapName = path.basename(mapFile).replace(path.extname(mapFile), "");
  const root = path.dirname(mapFile);
  let def = (mapData as string[][]).find((n) => n[0] === mapName);
  if (!def) {
    def = ["", mapName, mapName, mapName, mapName];
  }
  const tilFile = getFile(root, def[1], "til");
  const objFile = getFile(root, def[2], "obj");
  const roofFile = getFile(root, def[3], "obj");
  const thumb = path.resolve(root, mapName + ".bmp");
  return {
    mapName: capitalize(mapName),
    mapFile,
    tilFile,
    objFile,
    roofFile,
    thumb,
    showName: def[4],
  };
}
