import { useEffect, useRef } from "react";
import native from "../components/MenuEx/native";

export function useExport(callback: Function) {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  }, [callback]);
  useEffect(() => {
    function internalHandler() {
      ref.current();
    }
    native.on("export", internalHandler);
    return () => {
      native.off("export", internalHandler);
    };
  }, []);
}
