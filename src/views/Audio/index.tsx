import React, { useEffect, useState } from "react";
import styles from "./index.less";
import { useSelect } from "../../store";
import { isAudioPkg } from "../../util/check";
import codec from "../../codec";
import { ATZWAVE } from "../../codec/AudioPkg";
import { setMessage, setLoading, setInfo } from "../../store/action";
import { play, clear } from "./Player";
import { browserFolder } from "../../util/dialog";
import { emptyDir } from "fs-extra";
import { resolve } from "path";
import { FileToWrite, writeFiles } from "../../util/fileSystem";
import { Column } from "../../components/VirtualizedTable";
import Table from "../../components/VirtualizedTable";
import { useAutoSize } from "../../util/resizeable";
import { useExport } from "../../util/hooks";

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

export const columns: Column[] = [
  { id: "name", label: "Name" },
  { id: "size", label: "File\u00a0Size", width: 150 },
];

function Audio() {
  const [waves, setWaves] = useState<ATZWAVE[]>([]);
  const { file, dispatch } = useSelect();
  const [selectedId, setSelectedID] = useState(-1);
  const { height } = useAutoSize();

  useExport(async () => {
    try {
      await exportAudios(waves, (msg) => dispatch(setMessage(msg)));
      dispatch(setMessage("done."));
    } catch (_) {
      dispatch(setMessage("Export failed."));
    }
  });

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

  const onRowClick = (id: number) => {
    if (selectedId === id) {
      setSelectedID(-1);
      dispatch(setInfo(""));
      clear();
      return;
    }
    setSelectedID(id);
    play(id, waves[id].data, () => dispatch(setInfo("")));
    dispatch(setInfo("🔊‬ " + waves[id].name));
  };

  return (
    <div className={styles.container} style={{ height }}>
      <Table
        columns={columns}
        data={waves}
        selectedId={selectedId}
        onRowClick={onRowClick}
      />
    </div>
  );
}

export default Audio;
