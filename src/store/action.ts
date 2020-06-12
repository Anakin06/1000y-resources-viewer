export interface Action<T = {}> {
  type: string;
  payload: T;
}

export function setFile(file: string | string[]) {
  return {
    type: "setfile",
    payload: file,
  };
}

export function setMessage(message: string) {
  return {
    type: "setmessage",
    payload: message,
  };
}

export function setInfo(filename: string, title: string = "") {
  return {
    type: "setinfo",
    payload: { filename, title },
  };
}

export function setSize(x: number, y: number) {
  return {
    type: "setsize",
    payload: { x, y },
  };
}

export function setLoading(value: boolean = true) {
  return {
    type: "setloading",
    payload: value,
  };
}

function checkAction<T>(type: string) {
  return (action: Action): action is Action<T> => type === action.type;
}

export const isSetFile = checkAction<string>("setfile");
export const isSetMessage = checkAction<string>("setmessage");
export const isSetInfo = checkAction<{ filename: string; title: string }>(
  "setinfo"
);
export const isSetSize = checkAction<{ x: number; y: number }>("setsize");
export const isSetLoading = checkAction<boolean>("setloading");
