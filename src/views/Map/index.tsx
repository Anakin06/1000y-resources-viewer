import React, { useEffect, useState, useRef } from "react";
import { useSelect } from "../../store";
import { enableViewMenu, enableOpenMenu } from "../../components/MenuEx/native";
import styles from "./index.less";
import getViewport from "../../util/getClientSize";
import Renderer from "./Renderer";
import {
  setMessage,
  setInfo,
  setSize as setInfoSize,
  setLoading,
} from "../../store/action";
import { isMapfile } from "../../util/check";
import MapThumb from "../../components/MapThumb";
import Vector2 from "./Vector2";

type MapInfo = {
  thumb?: HTMLCanvasElement | HTMLImageElement;
  width: number;
  height: number;
};

function Map() {
  const { file, dispatch } = useSelect();
  const [viewport, setViewport] = useState(getViewport());
  const [width, height] = [viewport.width, viewport.height];
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<Renderer>();
  const [mapInfo, setMapInfo] = useState<MapInfo>({ width: 0, height: 0 });
  const [loc, setLoc] = useState({ x: 0, y: 0 });
  useEffect(() => {
    document.title = "Map Viewer";
    const setSize = () => {
      const viewport = getViewport();
      setViewport(viewport);
      renderer.current?.resize(viewport.width, viewport.height);
    };
    enableViewMenu(true);
    window.addEventListener("resize", setSize);
    if (!renderer.current) {
      renderer.current = new Renderer(canvas.current as HTMLCanvasElement);
      renderer.current.on("message", ({ message, loading }) => {
        dispatch(setMessage(message));
        if (typeof loading !== "undefined") dispatch(setLoading(loading));
      });
      renderer.current.on("info", ({ filename, title }) =>
        dispatch(setInfo(filename, title))
      );

      renderer.current.on("size", ({ x, y }) => dispatch(setInfoSize(x, y)));
      renderer.current.on("load", ({ thumb, width, height }) => {
        setMapInfo((info) => {
          return {
            thumb,
            width,
            height,
          };
        });
      });
      renderer.current.on("move", ({ x, y }) => {
        setLoc((n) => ({
          x,
          y,
        }));
      });
    }
    return () => {
      enableViewMenu(false);
      window.removeEventListener("resize", setSize);
      renderer.current?.clear();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isMapfile(file)) return;
    const load = async function () {
      enableOpenMenu(false);
      dispatch(setLoading(true));
      try {
        await renderer.current?.load(file);
        dispatch(setMessage("done."));
      } catch (_) {
        console.error(_);
        dispatch(setMessage("Parse map failed."));
      } finally {
        enableOpenMenu(true);
        dispatch(setLoading(false));
      }
    };
    load();
  }, [file, dispatch]);

  const onChange = (x: number, y: number) => {
    renderer.current?.setLocation(new Vector2(x, y));
  };

  return (
    <div className={styles.container}>
      <div className={styles.stage} style={{ width, height }}>
        <div className={styles.renderer}>
          <canvas ref={canvas} width={width - 2} height={height - 2}></canvas>
        </div>
      </div>
      <div className={styles.thumb}>
        <MapThumb
          onChange={onChange}
          thumb={mapInfo.thumb}
          mapWidth={mapInfo.width}
          mapHeight={mapInfo.height}
          viewport={{ x: width, y: height }}
          x={loc.x}
          y={loc.y}
        />
      </div>
    </div>
  );
}

export default Map;
//export default connect(mapState, mapDispatch)(Map);
