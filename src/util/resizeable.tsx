import { useEffect, useState } from "react";
import getViewport from "./getClientSize";

export function useAutoSize() {
  const [size, setSize] = useState(getViewport());
  useEffect(() => {
    const onResize = () => setSize(getViewport());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}
