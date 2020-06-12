import { remote } from "electron";
import { SPRITE, EFFECT } from "../components/MenuEx/native";

export type Ext = "Map" | "Sprite" | "Audio" | "Action" | "Effect";
const fileTypes = {
  Map: {
    extensions: ["map"],
    name: "1000y map",
  },
  Sprite: {
    extensions: ["atz"],
    name: "1000y sprite sheet",
  },
  Audio: {
    extensions: ["atw"],
    name: "1000y music archive",
  },
  Action: {
    extensions: ["atd"],
    name: "1000y sprite animation",
  },
  Effect: {
    extensions: ["eft"],
    name: "1000y effect",
  },
};

export async function openForBrowser(ext?: Ext) {
  const multi = ext === SPRITE || ext === EFFECT;
  const properties = ["openFile", multi ? "multiSelections" : undefined].filter(
    Boolean
  ) as any;
  let result = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties,
    filters: ext
      ? [fileTypes[ext]]
      : Object.entries(fileTypes).map(([key, filter]) => filter),
  });

  if (!result.canceled) {
    return multi ? result.filePaths : result.filePaths[0];
  }
}

export async function browserFolder({
  defaultPath,
  title,
}: {
  defaultPath?: string;
  title?: string;
}) {
  const result = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    title,
    defaultPath,
    properties: ["createDirectory", "openDirectory"],
  });
  if (!result.canceled) {
    return result.filePaths[0];
  }
}

export async function browserSaveAs({
  defaultPath,
  title,
  filters,
}: {
  defaultPath?: string;
  title?: string;
  filters?: Electron.FileFilter[];
}) {
  let result = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
    defaultPath,
    title,
    filters,
  });
  if (!result.canceled) {
    return result.filePath;
  }
}
