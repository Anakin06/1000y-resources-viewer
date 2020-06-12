import React from "react";
import BaseView, { BaseViewerProps } from "../Sprite/BaseViewer";

import { isEFTPkg } from "../../util/check";

const options: BaseViewerProps = {
  title: "Effect Viewer",
  checkFn: isEFTPkg,
  type: "eft",
};

export default () => {
  return <BaseView {...options} />;
};
