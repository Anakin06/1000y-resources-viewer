import { State } from "./state";
import {
  Action,
  isSetFile,
  isSetMessage,
  isSetInfo,
  isSetSize,
  isSetLoading,
} from "./action";

export default (state: State, action: Action) => {
  if (isSetFile(action)) {
    return {
      ...state,
      file: action.payload,
    };
  }
  if (isSetMessage(action)) {
    return {
      ...state,
      message: action.payload,
    };
  }
  if (isSetInfo(action)) {
    return {
      ...state,
      title: action.payload.title,
      filename: action.payload.filename,
    };
  }
  if (isSetSize(action)) {
    const { x, y } = action.payload;
    let addon = `[${x}, ${y}]`;
    if (x === -1 && y === -1) addon = "";
    return {
      ...state,
      addon,
    };
  }
  if (isSetLoading(action)) {
    return {
      ...state,
      loading: action.payload,
    };
  }
  return state;
};
