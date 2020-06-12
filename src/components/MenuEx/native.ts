import { remote, MenuItem, ipcRenderer } from "electron";
import { EventEmitter } from "events";

export const SHOW_TERRAIN = "Show terrain";
export const SHOW_OBJECTS = "Show objects";
export const SHOW_ROOF = "Show roof";
export const SHOW_GRID = "Show grid";
export const OPEN = "Open";
export const EXPORT = "Export";
export const MAP = "Map";
export const SPRITE = "Sprite";
export const EFFECT = "Effect";
export const AUDIO = "Audio";
export const ACTION = "Action";

export type TMenuItem = {
  label: string;
  accelerator: string | null;
  role?: string;
  type?: string;
  checked: boolean;
  enabled: boolean;
};

export type TMenu = {
  label: string;
  items: TMenuItem[];
};

function formatAccelerator(role: string, acl: Electron.Accelerator) {
  if (role === "close") return "Ctrl+W";
  if (role === "toggledevtools") return "Ctrl+Shift+I";
  if (acl) {
    return acl
      .replace(/^CommandOr/, "")
      .replace(/^CmdOr/, "")
      .replace("Control+", "Ctrl+");
  }
  return null;
}

export function roleBehavior(role: string): void {
  switch (role) {
    case "toggledevtools":
      remote.getCurrentWindow().webContents.toggleDevTools();
      break;
    case "close":
    case "quit":
      remote.getCurrentWindow().close();
      break;
  }
}

export type IViewConfig = {
  showObject: boolean;
  showGrid: boolean;
  showTerrain: boolean;
  showRoof: Boolean;
};
export const viewConfig = {
  showTerrain: true,
  showObject: true,
  showRoof: true,
  showGrid: true,
};

function setViewConfig(label: string, checked: boolean) {
  switch (label) {
    case SHOW_TERRAIN:
      viewConfig.showTerrain = checked;
      break;
    case SHOW_OBJECTS:
      viewConfig.showObject = checked;
      break;
    case SHOW_ROOF:
      viewConfig.showRoof = checked;
      break;
    case SHOW_GRID:
      viewConfig.showGrid = checked;
      break;
  }
}

export const appMenus = remote.Menu.getApplicationMenu()?.items.map((menu) => {
  const items: TMenuItem[] = menu.submenu?.items.map((submenu) => {
    const label = submenu.label;
    if (label === SHOW_TERRAIN) {
      viewConfig.showTerrain = submenu.checked;
    } else if (label === SHOW_OBJECTS) {
      viewConfig.showObject = submenu.checked;
    } else if (label === SHOW_ROOF) {
      viewConfig.showRoof = submenu.checked;
    } else if (label === SHOW_GRID) {
      viewConfig.showGrid = submenu.checked;
    }
    return {
      label,
      accelerator: formatAccelerator(
        submenu.role as string,
        submenu.accelerator as Electron.Accelerator
      ),
      role: submenu.role,
      type: submenu.type,
      checked: submenu.checked,
      enabled: submenu.enabled,
    };
  }) as TMenuItem[];
  return {
    label: menu.label,
    items,
  };
}) as TMenu[];

const event = new EventEmitter();

export function findMenu<T extends string | string[]>(
  label: T
): T extends string ? MenuItem | undefined : MenuItem[];
export function findMenu(
  label: string | string[]
): MenuItem | undefined | MenuItem[] {
  const menu = remote.Menu.getApplicationMenu();
  if (!menu) return undefined;
  let items: MenuItem[] = [];

  let source: string[];
  const isArray = Array.isArray(label);
  if (!isArray) {
    source = [label as string];
  } else {
    source = label as string[];
  }
  menu.items.forEach(({ submenu }) => {
    if (submenu) {
      submenu.items.forEach((item) => {
        source.indexOf(item.label) > -1 && items.push(item);
      });
    }
  });
  if (isArray) return items;
  return items[0];
}

type MenuItemLike = {
  checked?: boolean;
  enabled?: boolean;
};

export function updateMenu(label: string | string[], value: MenuItemLike) {
  let menuLabels = label as string[];
  if (!Array.isArray(label)) {
    menuLabels = [label as string];
  }
  const items = findMenu(menuLabels);

  items.forEach((item) => {
    if (typeof value.checked !== "undefined") {
      item.checked = value.checked;
      setViewConfig(item.label, item.checked);
      fireEvent("check", {
        label: item.label,
        checked: item.checked,
      });
    }
    if (typeof value.enabled !== "undefined") {
      item.enabled = value.enabled;
      fireEvent("enable", {
        label: item.label,
        enabled: item.enabled,
      });
    }
  });
}

export function enableViewMenu(flag: boolean = true) {
  updateMenu([SHOW_TERRAIN, SHOW_OBJECTS, SHOW_ROOF, SHOW_GRID], {
    enabled: flag,
  });
}

export function enableOpenMenu(flag: boolean = true) {
  updateMenu([OPEN, EXPORT, MAP, SPRITE, EFFECT, AUDIO, ACTION], {
    enabled: flag,
  });
}

interface EventMap {
  click: { label: string };
  check: { label: string; checked: boolean };
  enable: { label: string; enabled: boolean };
  viewchange: void;
  export: void;
}

export function fireEvent(type: keyof EventMap, item: any) {
  event.emit(type, item);
  if (type === "click" && item.label === "Export") {
    event.emit("export");
  }
}

function on<K extends keyof EventMap>(
  type: K,
  listener: (item: EventMap[K]) => void
) {
  event.on(type, listener);
}

function off<K extends keyof EventMap>(
  type: K,
  listener?: (item: EventMap[K]) => void
) {
  if (listener) event.off(type, listener);
  else {
    event.removeAllListeners(type);
  }
}

ipcRenderer.on("menuclick", (e, menu: string) => {
  switch (menu) {
    case "Show terrain":
    case "Show objects":
    case "Show grid":
    case "Show roof":
      const item = findMenu(menu) as MenuItem;
      setViewConfig(item.label, item.checked);
      fireEvent("check", { label: menu, checked: item.checked });

      break;
    default:
      fireEvent("click", { label: menu });
  }
});

export default {
  on,
  off,
};
