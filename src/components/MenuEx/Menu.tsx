import React from "react";
import styles from "./index.less";
import Popper from "@material-ui/core/Popper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import { TMenuItem } from "./native";
import MenuItem from "./MenuItem";

type MenuProps = {
  label: string;
  items: TMenuItem[];
  onClick: (role: string | undefined, label: string, checked?: boolean) => void;
};

function Menu({ label, items, onClick }: MenuProps) {
  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const onToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const onClose = (event: React.MouseEvent<Document>) => {
    setOpen(false);
  };

  const onMenuClick = (
    role: string | undefined,
    label: string,
    checked?: boolean
  ) => {
    setOpen(false);
    onClick(role, label, checked);
  };

  return (
    <div>
      <div className={styles.menubtn} ref={anchorRef} onClick={onToggle}>
        {label}
      </div>
      <Popper
        style={{ zIndex: 1000 }}
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
      >
        <ClickAwayListener onClickAway={onClose}>
          <div className={styles.itemsHolder}>
            <div>
              {items.map((item, i) => (
                <MenuItem onClick={onMenuClick} key={i} {...item} />
              ))}
              <div></div>
            </div>
          </div>
        </ClickAwayListener>
      </Popper>
    </div>
  );
}

export default Menu as any;
