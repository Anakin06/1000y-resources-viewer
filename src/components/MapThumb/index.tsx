import React, { useState } from "react";
import styles from "./index.less";
import classNames from "classnames";
import { TW, TH } from "../../views/Map/Renderer";
import Thumb from "./Thumb";

type ThumbProps = {
  thumb?: HTMLImageElement | HTMLCanvasElement;
  mapWidth: number;
  mapHeight: number;
  viewport: { x: number; y: number };
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
};

function getScale(mapWidth: number, mapHeight: number, vw: number, vh: number) {
  if (mapWidth === 0 || mapHeight === 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: vw / (mapWidth * TW),
    y: vh / (mapHeight * TH),
  };
}

export default function MapThumb({
  thumb,
  mapWidth,
  mapHeight,
  viewport,
  x,
  y,
  onChange,
}: ThumbProps) {
  const [isMaximized, setMaximized] = useState(true);
  const onClick = () => {
    setMaximized(!isMaximized);
  };

  const btncls = classNames(
    styles.ctrl,
    isMaximized ? styles.minimize : styles.restore
  );

  const mapPixelWidth = mapWidth * TW;
  const mapPixelHeight = mapHeight * TH;
  const scale = getScale(mapWidth, mapHeight, viewport.x, viewport.y);
  const cx = x / mapPixelWidth || 0;
  const cy = y / mapPixelHeight || 0;

  const onThumbClick = (sx: number, sy: number) => {
    let x = mapPixelWidth * sx;
    let y = mapPixelHeight * sy;
    x -= viewport.x / 2;
    y -= viewport.y / 2;
    x = Math.max(0, Math.floor(x));
    y = Math.max(0, Math.floor(y));

    if (x + viewport.x > mapPixelWidth) x = mapPixelWidth - viewport.x;
    if (y + viewport.y > mapPixelHeight) y = mapPixelHeight - viewport.y;
    x = Math.max(0, x);
    y = Math.max(0, y);
    onChange(x, y);
  };

  return (
    <div className={styles.container}>
      <div className={btncls} onClick={onClick}></div>
      <Thumb
        scaleX={scale.x}
        scaleY={scale.y}
        isMaximized={isMaximized}
        source={thumb}
        onClick={onThumbClick}
        cx={cx}
        cy={cy}
      />
    </div>
  );
}
