import { useEffect, useRef } from "react";

import native, { enableOpenMenu } from "../components/MenuEx/native";
import { useSelect } from "../store";
import { setLoading } from "../store/action";
export function useTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export function useExport(callback: Function) {
  const ref = useRef(callback);
  const { dispatch } = useSelect();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);
  useEffect(() => {
    async function internalHandler() {
      dispatch(setLoading(true));
      enableOpenMenu(false);
      await ref.current();
      dispatch(setLoading(false));
      enableOpenMenu(true);
    }
    native.on("export", internalHandler);
    return () => {
      native.off("export", internalHandler);
    };
  }, [dispatch]);
}
