import React from "react";
import styles from "./index.less";

type CardProps = {
  playing: boolean;
  name: string;
  id: number;
  size: string;
  onClick: (id: number) => void;
};

function PauseButton() {
  return (
    <div className={styles.playIcon}>
      <svg viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
      </svg>
    </div>
  );
}

function PlayButton() {
  return (
    <div className={styles.playIcon}>
      <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z"></path>
      </svg>
    </div>
  );
}

export default function Card({ playing, name, size, id, onClick }: CardProps) {
  let cls = styles.item;
  if (playing) cls += " " + styles.playing;
  return (
    <div className={cls} title={size} onClick={() => onClick(id)}>
      {playing ? <PauseButton /> : <PlayButton />}

      <span className={styles.label}>{name}</span>
    </div>
  );
}
