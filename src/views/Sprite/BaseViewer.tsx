import React, { useState, useRef, useEffect } from "react";
import styles from "./index.less";
import Table from "../../components/Table";
import { useSelect } from "../../store";
import { useTitle } from "../../util/hooks";
import { columns, FileData, useLoader, useListener, exportATZ } from "./util";
import Loader, { ATZFile } from "./Loader";
import Renderer from "./Renderer";
import { useAutoSize } from "../../util/resizeable";
import { useExport } from "../../util/exportHelper";
import { enableOpenMenu } from "../../components/MenuEx/native";
import { setLoading, setMessage } from "../../store/action";

const loader = new Loader();
const canvasWidth = 400;

export type SpriteViewerType = "atz" | "eft";

export type BaseViewerProps = {
  title: string;
  type: SpriteViewerType;
  checkFn: (file?: string | string[]) => file is string[];
};

export default ({ title, type, checkFn }: BaseViewerProps) => {
  loader.type = type;
  const { height } = useAutoSize();
  const rendererRef = useRef<Renderer>(new Renderer());
  useEffect(() => {
    rendererRef.current.resize(canvasWidth, height);
  }, [height]);

  useTitle(title);
  const { file, dispatch } = useSelect();
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedRow, setSelectedRow] = useState(-1);

  const updateFiles = (file: ATZFile) => {
    setFiles((preFiles) => {
      const files = [...preFiles];
      files[file.id].size = file.size;
      files[file.id].state = "complete";
      files[file.id].count = file.count;
      return files;
    });
  };

  useListener(loader, updateFiles);
  useLoader(file, checkFn, (f) => {
    setFiles(f);
    loader.init();
  });

  const onRowClick = async (id: number) => {
    const file = files[id];
    setSelectedRow(id);
    try {
      const { image, caption } = await loader.load(file);
      rendererRef.current.start(image, caption);
      dispatch(setMessage(file.name));
    } catch (_) {
      console.error(_);
      dispatch(setMessage(`Error Occured! (${_.message})`));
    }
  };

  useExport(async () => {
    if (files.length === 0) return;
    enableOpenMenu(false);
    dispatch(setLoading(true));
    exportATZ(loader, files, (msg) => {
      dispatch(setMessage(msg));
    });
    enableOpenMenu(true);
    dispatch(setLoading(false));
  });
  return (
    <div className={styles.container} style={{ height }}>
      <div className={styles.renderer}>
        <canvas
          ref={rendererRef.current.setRef}
          width={canvasWidth}
          height={height}
        ></canvas>
      </div>
      <div className={styles.list}>
        <Table
          columns={columns}
          data={files}
          selectedId={selectedRow}
          onRowClick={onRowClick}
        />
      </div>
    </div>
  );
};
