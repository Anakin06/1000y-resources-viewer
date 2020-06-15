import React, { useState, useRef, useEffect } from "react";
import { useTitle, useExport } from "../../util/hooks";
import Loader, { ATZRecord, ATZFile, ATZ, EFT } from "../LargeList/Loader";
import { useLoadFile } from "../LargeList/util";
import { useSelect } from "../../store";
import styles from "./index.less";
import Table, { Column } from "../../components/VirtualizedTable";
import Renderer from "./Renderer";
import { useAutoSize } from "../../util/resizeable";
import { setMessage } from "../../store/action";

export type BaseViewerProps = {
  title: string;
  type: ATZ | EFT;
};

const canvasWidth = 300;

export const columns: Column[] = [
  { id: "name", label: "Name" },
  { id: "size", label: "Size", width: 80 },
  {
    id: "state",
    label: "State",
    width: 100,
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "count",
    label: "Count",
    align: "center",
    width: 80,
    format: (value: number) => {
      if (value <= 0) return "N/A";
      return value.toString();
    },
  },
];

export default ({ title, type }: BaseViewerProps) => {
  useTitle(title);
  const loader = useRef(new Loader(type));
  const { height } = useAutoSize();
  const { file, dispatch } = useSelect();
  const [selectedId, setSelectedID] = useState(-1);
  const [files, setFiles] = useState<ATZRecord[]>([]);
  useLoadFile(type, file, (files) => setFiles(files));
  const renderer = useRef<Renderer>(new Renderer());
  useEffect(() => {
    renderer.current.resize(canvasWidth, height);
  }, [height]);

  const updateFiles = (file: ATZFile) => {
    setFiles((preFiles) => {
      const files = [...preFiles];
      files[file.id].size = file.size;
      files[file.id].state = "complete";
      files[file.id].count = file.count;
      return files;
    });
  };

  useEffect(() => {
    const internalLoader = loader.current;
    internalLoader.on("load", (file) => updateFiles(file));
    return () => internalLoader.off("load");
  }, []);

  const onRowClick = async (id: number) => {
    const file = files[id];
    setSelectedID(id);
    try {
      const { image, caption } = (await loader.current.load(
        file,
        true
      )) as ATZFile;
      renderer.current.start(image, caption);
      dispatch(setMessage(file.name));
    } catch (_) {
      console.error(_);
      dispatch(setMessage(`Error Occured! (${_.message})`));
    }
  };

  useExport(async () => {
    await loader.current.exportData(files, (msg) => dispatch(setMessage(msg)));
  });

  return (
    <div className={styles.container} style={{ height }}>
      <div className={styles.renderer}>
        <canvas
          ref={renderer.current.setRef}
          width={canvasWidth}
          height={height}
        ></canvas>
      </div>
      <div className={styles.list}>
        <Table
          columns={columns}
          data={files}
          selectedId={selectedId}
          onRowClick={onRowClick}
        />
      </div>
    </div>
  );
};
