/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import classNames from "classnames";
import styles from "./index.less";
import { useSelect } from "../../store";
import svg from "./loading.svg";

export default () => {
  const { message, addon, title, filename, loading } = useSelect();
  return (
    <div className={styles.container}>
      <div className={classNames(styles.items, "left")}>
        {loading && (
          <span className={styles.loading}>
            <img src={svg} alt="Loading..." />
          </span>
        )}
        {message}
      </div>
      <div className={classNames(styles.items, "right")}>
        <div className={classNames(styles.item, "last")} title="MapSize">
          <a aria-label="a">{addon}</a>
        </div>
        <div className={styles.item} title={title}>
          <a>{filename}</a>
        </div>
      </div>
    </div>
  );
};
