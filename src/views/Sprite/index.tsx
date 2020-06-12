import React from "react";
import BaseViewer, { BaseViewerProps } from "./BaseViewer";
import { isATZPkg } from "../../util/check";
const defaultProps: BaseViewerProps = {
  title: "Sprite Viewer",
  type: "atz",
  checkFn: isATZPkg,
};

export default () => {
  return <BaseViewer {...defaultProps} />;
};
