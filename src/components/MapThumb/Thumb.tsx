import React, { useRef, useEffect, useState } from "react";
import styles from "./index.less";
const WIDTH = 320;
const HEIGHT = 240;

type Source = HTMLCanvasElement | HTMLImageElement;

type ThumbProps = {
  isMaximized: boolean;
  source?: Source;
  cx: number;
  cy: number;
  scaleX: number;
  scaleY: number;
  onClick: (x: number, y: number) => void;
};

export default function Thumb({
  isMaximized,
  source,
  cx,
  cy,
  scaleX,
  scaleY,
  onClick,
}: ThumbProps) {
  const onThumbClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.x - rect.x;
    const y = e.clientY - box.y - rect.y;
    if (x > 0 && x < rect.w && y > 0 && y < rect.h) {
      onClick(x / rect.w, y / rect.h);
    }
  };
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [rect, setRect] = useState({ x: 0, y: 0, w: WIDTH, h: HEIGHT });
  const [viewRect, setViewRect] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (source && canvas.current) {
      let r = drawThumb(source, canvas.current);
      setRect((n) => ({ ...n, ...r }));
    } else {
      clearThumb(canvas.current);
    }
  }, [source]);

  useEffect(() => {
    setViewRect({
      x: Math.floor(scaleX * rect.w),
      y: Math.floor(scaleY * rect.h),
    });
  }, [scaleX, scaleY, rect]);

  let tw = viewRect.x > WIDTH ? 0 : viewRect.x;
  let th = viewRect.y > HEIGHT ? 0 : viewRect.y;
  const trackerStyle = {
    left: rect.x + cx * rect.w,
    top: rect.y + cy * rect.h,
    width: tw,
    height: th,
    display: tw === 0 || th === 0 ? "none" : "block",
  };

  return (
    <div
      className={styles.thumb}
      onClick={onThumbClick}
      style={{ display: isMaximized ? "block" : "none" }}
    >
      <div className={styles.tracker} style={trackerStyle}></div>
      <canvas ref={canvas} width={WIDTH} height={HEIGHT}></canvas>
    </div>
  );
}

function clearThumb(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawThumb(source: Source, canvas: HTMLCanvasElement) {
  let ox = 0;
  let oy = 0;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  let rw = 0;
  let rh = 0;
  if (WIDTH / HEIGHT > source.width / source.height) {
    rh = HEIGHT;
    rw = source.width / (source.height / rh);
    ox = (WIDTH - rw) / 2;
    oy = 0;
  } else {
    rw = WIDTH;
    rh = source.height / (source.width / rw);
    ox = 0;
    oy = (HEIGHT - rh) / 2;
  }
  ctx.drawImage(source, 0, 0, source.width, source.height, ox, oy, rw, rh);
  return { x: ox, y: oy, w: rw, h: rh };
}
