import React, { useState, useEffect } from "react";
import { useTitle, useExport } from "../../util/hooks";
import Table, { Column } from "../../components/VirtualizedTable";
import { useLoadFile } from "../LargeList/util";
import { useSelect } from "../../store";
import { useAutoSize } from "../../util/resizeable";
import Loader, { ATDFile, ATDRecord } from "../LargeList/Loader";
import { setMessage } from "../../store/action";

export const columns: Column[] = [
  { id: "name", label: "Name" },
  { id: "size", label: "File\u00a0Size", width: 150 },
  {
    id: "state",
    label: "State",
    width: 150,
    align: "center",
  },
];

const loader = new Loader("atd");
export default () => {
  useTitle("Action");
  const { file, dispatch } = useSelect();
  const { height } = useAutoSize();
  const [files, setFiles] = useState<ATDRecord[]>([]);
  const [selectedId, setSelectedID] = useState(-1);
  const onRowClick = (id: number) => {
    try {
      const file = files.find((f) => f.id === id);
      file && loader.load(file, true);
    } catch (_) {
      console.error(_);
      dispatch(setMessage(`Error Occured! (${_.message})`));
    }

    setSelectedID(id);
  };
  const updateFiles = ({ id, size }: ATDFile) =>
    setFiles((preFiles) => {
      const files = [...preFiles];
      [files[id].size, files[id].state] = [size, "complete"];
      return files;
    });

  useLoadFile("atd", file, (files) => setFiles(files));
  useEffect(() => {
    loader.on("load", (file) => updateFiles(file));
    return () => loader.off("load");
  }, []);

  useExport(async () => {
    await loader.exportData(files, (msg) => dispatch(setMessage(msg)));
  });

  return (
    <div style={{ height }}>
      <Table
        columns={columns}
        data={files}
        selectedId={selectedId}
        onRowClick={onRowClick}
      />
    </div>
  );
};
