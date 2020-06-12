import React from "react";
import styles from "./index.less";
import { TMenuItem } from "./native";
import classNames from "classnames";

type OtherProps = {
  onClick: (role: string | undefined, label: string, checked?: boolean) => void;
};

export default function MenuItem({
  label,
  checked,
  accelerator,
  type,
  enabled,
  role,
  onClick,
}: TMenuItem & OtherProps) {
  if (type === "separator") {
    return <div className={styles.separator}></div>;
  }
  const keybinding = accelerator ? (
    <span className={styles.keybinding}>{accelerator}</span>
  ) : null;
  const cls = classNames(styles.item, {
    [styles.disabled]: !enabled,
  });

  return (
    <div
      className={cls}
      onClick={() => enabled && onClick(role, label, checked)}
    >
      <span
        className={styles.itemCheck}
        style={{ visibility: checked ? "visible" : "hidden" }}
      ></span>
      <span className={styles.itemLabel}>{label}</span>
      {keybinding}
    </div>
  );
}
