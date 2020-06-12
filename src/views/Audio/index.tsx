import React, { useEffect, useState } from "react";
import Card from "./Card";
import styles from "./index.less";
import { useSelect } from "../../store";
import { isAudioPkg } from "../../util/check";
import codec from "../../codec";
import { ATZWAVE } from "../../codec/AudioPkg";
import { setMessage, setLoading, setInfo } from "../../store/action";
import { play, clear } from "./Player";
import native, { enableOpenMenu } from "../../components/MenuEx/native";
import { browserFolder } from "../../util/dialog";
import { emptyDir } from "fs-extra";
import { resolve } from "path";
import { FileToWrite, writeFiles } from "../../util/fileSystem";

function getHeight() {
  return `calc(100vh - ${process.platform === "darwin" ? "22px" : "52px"})`;
}

async function exportAudios(
  waves: ATZWAVE[],
  msg: (msg: string) => void,
  name: string = "1000y_audio"
) {
  let root = await browserFolder({ title: "Select the folder to save" });
  if (!root) return;
  root = resolve(root, name);
  await emptyDir(root);
  const files: FileToWrite[] = waves.map((wave) => ({
    name: wave.name,
    data: wave.data,
  }));

  for await (let message of writeFiles(files, root)) {
    if (message.startsWith("[")) msg(message);
  }
}

function Audio() {
  const [maxHeight, setMaxHeight] = useState(getHeight());
  const [waves, setWaves] = useState<ATZWAVE[]>([]);
  const [current, setCurrent] = useState(-1);
  const { file, dispatch } = useSelect();

  useEffect(() => {
    enableOpenMenu(true);
    const onExport = async function () {
      enableOpenMenu(false);
      try {
        dispatch(setLoading(true));
        await exportAudios(waves, (msg) => {
          dispatch(setMessage(msg));
        });
        dispatch(setMessage("done."));
      } catch (_) {
        dispatch(setMessage("Export failed."));
      }
      dispatch(setLoading(false));
      enableOpenMenu(true);
    };
    native.on("export", onExport);
    return () => native.off("export", onExport);
  }, [waves, dispatch]);

  useEffect(() => {
    document.title = "Audio";
    const resize = () => {
      setMaxHeight(getHeight());
    };

    window.addEventListener("resize", resize);
    return () => {
      clear();
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (!isAudioPkg(file)) return;
    dispatch(setMessage(`Parsing ${file}`));
    dispatch(setLoading(true));

    const load = async function () {
      const result = await codec.decodeAudioPkg(file);
      setWaves((arr) => result);
      dispatch(setMessage(`done. ${result.length} files`));
      dispatch(setLoading(false));
    };
    load();
  }, [file, dispatch]);

  const onClick = (id: number) => {
    if (current === id) {
      setCurrent(-1);
      clear();
      return;
    }
    setCurrent(id);
    play(id, waves[id].data, () => {
      setCurrent(-1);
      dispatch(setInfo(""));
    });
    dispatch(setInfo("🔊‬ " + waves[id].name));
  };

  return (
    <div className={styles.container} style={{ height: maxHeight }}>
      <div className={styles.cards} style={{ maxHeight }}>
        {waves.map(({ name, size }, i) => (
          <Card
            key={name}
            size={size}
            id={i}
            playing={current === i}
            onClick={onClick}
            name={name}
          />
        ))}
      </div>
    </div>
  );
}

export default Audio;
