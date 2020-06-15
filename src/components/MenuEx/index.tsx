import React, { useEffect, useState } from "react";
import styles from "./index.less";
import Menu from "./Menu";
import { useSelect } from "../../store";
import { setFile } from "../../store/action";
import { openForBrowser } from "../../util/dialog";
import { useHistory } from "react-router-dom";
import {
  updateItem,
  isBrowserFileMenu,
  getPathFromFile,
  getExtFromLabel,
  whenTitleChange,
  minimize,
  toggleMaximize,
  close,
} from "./utils";
import nativeMenu, {
  updateMenu,
  SHOW_TERRAIN,
  SHOW_OBJECTS,
  SHOW_ROOF,
  SHOW_GRID,
  appMenus,
  roleBehavior,
  fireEvent,
} from "./native";
import { remote } from "electron";

const MenuEx = () => {
  const cls = styles.container;
  const [isMaximized, setIsMaximized] = useState(
    remote.getCurrentWindow().isMaximized
  );
  const [menu, setMenu] = useState(appMenus);
  const [title, setTitle] = useState(document.title);
  const history = useHistory();

  const { dispatch } = useSelect();

  const onMenuClick = (
    role: string | undefined,
    label: string,
    checked?: boolean
  ) => {
    if (role) {
      roleBehavior(role);
      return;
    }
    switch (label) {
      case SHOW_TERRAIN:
      case SHOW_OBJECTS:
      case SHOW_ROOF:
      case SHOW_GRID:
        updateMenu(label, { checked: !checked });
        break;
      default:
        fireEvent("click", { label });
    }
  };

  useEffect(() => {
    whenTitleChange((title) => setTitle(title));
    const win = remote.getCurrentWindow();
    const onMaximize = () => setIsMaximized(true);
    const onUnMaximize = () => setIsMaximized(false);
    win.on("maximize", onMaximize);
    win.on("unmaximize", onUnMaximize);
  }, []);

  useEffect(() => {
    const onEnable = ({ label, enabled }: any) => {
      setMenu((menu) => updateItem(menu, label, { enabled }));
    };
    const onCheck = ({ label, checked }: any) => {
      setMenu((menu) => {
        const result = updateItem(menu, label, { checked });
        fireEvent("viewchange", void 0);
        return result;
      });
    };
    const onClick = async ({ label }: any) => {
      if (!isBrowserFileMenu(label)) return;
      const file = await openForBrowser(getExtFromLabel(label));
      if (!file) return;
      history.push(getPathFromFile(file));
      dispatch(setFile(file));
    };
    nativeMenu.on("enable", onEnable);
    nativeMenu.on("check", onCheck);
    nativeMenu.on("click", onClick);
    return () => {
      nativeMenu.off("enable", onEnable);
      nativeMenu.off("check", onCheck);
      nativeMenu.off("click", onClick);
    };
  }, [history, dispatch]);

  if (process.platform !== "darwin") return null;

  return (
    <div className={cls}>
      <div className={styles.appIcon}></div>
      <div className={styles.menubar}>
        {menu.map((menu) => (
          <Menu key={menu.label} {...menu} onClick={onMenuClick} />
        ))}
      </div>
      <div className={styles.dragRegion}></div>
      <div className={styles.controls}>
        <div className={styles.minimize} onClick={(e) => minimize()}></div>
        <div
          className={isMaximized ? styles.unmaximize : styles.maximize}
          onClick={() => toggleMaximize()}
        ></div>
        <div className={styles.close} onClick={() => close()}></div>
      </div>
      <div className={styles.title}>{title}</div>
    </div>
  );
};

export default MenuEx;
