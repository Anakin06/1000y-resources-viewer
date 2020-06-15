import { useEffect, useRef } from "react";
import { isATDFile, isATZPkg, isEFTPkg } from "../../util/check";
import { basename } from "path";
import { ALLTYPES, ATDRecord, isATD, ATZRecord, isATZ, isEFT } from "./Loader";

type ALL_RECORDS = {
  atd: ATDRecord;
  atz: ATZRecord;
  eft: ATZRecord;
};

export function useLoadFile<T extends ALLTYPES, U = ALL_RECORDS[T]>(
  type: T,
  file: string | string[] | undefined,
  onLoad: (files: U[]) => void
) {
  const onLoadRef = useRef(onLoad);
  const internalOnload = (files: U[]) => onLoadRef.current(files);
  useEffect(() => {
    if (isATD(type)) {
      if (!isATDFile(file)) return;
      const files = file.map((fullpath, i) => ({
        name: basename(fullpath),
        path: fullpath,
        size: "N/A",
        state: "Initial",
        id: i,
      })) as any;
      internalOnload(files);
    } else if (isATZ(type)) {
      if (!isATZPkg(file)) return;
      const files = file.map((fullpath, i) => ({
        id: i,
        path: fullpath,
        name: basename(fullpath),
        size: "N/A",
        state: "Initial",
        count: -1,
      })) as any;
      internalOnload(files);
    } else if (isEFT(type)) {
      if (!isEFTPkg(file)) return;
      const files = file.map((fullpath, i) => ({
        id: i,
        path: fullpath,
        name: basename(fullpath),
        size: "N/A",
        state: "Initial",
        count: -1,
      })) as any;
      internalOnload(files);
    }
  }, [file, type]);
}
