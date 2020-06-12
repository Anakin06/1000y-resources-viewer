import { ObjGroup } from "./ObjReader";
import { IRectangle } from "maxrects-packer";

type ATZOBJ = {
  aniDelay: number;
  aniId: number;
  startId: number;
  endId: number;
  width: number;
  height: number;
  iHeight: number;
  iWidth: number;
  imageCount: number;
  ipx: number;
  ipy: number;
  objType: number;
  image?: ImageBitmap;
};

export default class ObjEncoder {
  initObjs(groups: ObjGroup[]) {
    const objs: { [index: number]: ATZOBJ } = {};
    groups.forEach((obj) => {
      objs[obj.objId] = {
        aniDelay: obj.aniDelay,
        aniId: obj.aniId,
        startId: obj.startId,
        endId: obj.endId,
        width: obj.width,
        height: obj.height,
        iHeight: obj.iHeight,
        iWidth: obj.iWidth,
        imageCount: obj.imageCount,
        ipx: obj.ipx,
        ipy: obj.ipy,
        objType: obj.objType,
      };
    });
    return objs;
  }

  async encode(groups: ObjGroup[]) {
    const objs = this.initObjs(groups);

    groups.forEach((obj) => {
      const width = obj.iWidth * obj.imageCount;
      const height = obj.iHeight;
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
      for (let j = 0; j < obj.imageCount; j++) {
        ctx.drawImage(obj.images[j], j * obj.iWidth, 0);
      }
      objs[obj.objId].image = canvas.transferToImageBitmap();
    });

    return objs;
  }
}
