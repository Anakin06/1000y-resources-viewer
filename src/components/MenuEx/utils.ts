import { TMenu, OPEN, MAP, SPRITE, EFFECT, AUDIO, ACTION } from "./native";
import { extname } from "path";
import { Ext } from "../../util/dialog";
import { remote } from "electron";

export function updateItem(
  menu: TMenu[],
  label: string,
  options: { enabled?: boolean; checked?: boolean }
) {
  return menu.map((menu) => {
    let item = menu.items.find((n) => n.label === label);
    if (item) {
      Object.entries(options).forEach(([key, value]) => {
        (item as any)[key] = value;
      });
    }
    return menu;
  });
}

export function isBrowserFileMenu(label: string) {
  return [OPEN, MAP, SPRITE, EFFECT, AUDIO, ACTION].indexOf(label) > -1;
}

export function getPathFromFile(file: string | string[]) {
  if (Array.isArray(file)) file = file[0];
  const ext = extname(file).toLowerCase();
  const path = ({
    ".map": "/map",
    ".atz": "/sprite",
    ".eft": "/effect",
    ".atw": "/audio",
    ".atd": "/action",
  } as any)[ext];
  return path || "/";
}

export function getExtFromLabel(label: string) {
  return label === "Open" ? undefined : (label as Ext);
}

export function whenTitleChange(callback: (title: string) => void) {
  new MutationObserver(function (mutations) {
    callback(mutations[0].target.textContent as string);
  }).observe(document.querySelector("title") as Node, {
    subtree: true,
    characterData: true,
    childList: true,
  });
}

export function minimize() {
  remote.getCurrentWindow().minimize();
}

export function toggleMaximize() {
  const win = remote.getCurrentWindow();
  win.isMaximized() ? win.unmaximize() : win.maximize();
}

export function close() {
  remote.getCurrentWindow().close();
}
