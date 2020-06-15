export interface State {
  file?: string | string[];
  message: string;
  filename: string;
  title: string;
  addon: string;
  loading: boolean;
}

export const defaultState: State = {
  // file: "D:/Focus/archive/newversion/wav/effect.atw",
  file: [
    "D:/Focus/archive/newversion/sprite/_111.atz",
    "D:/Focus/archive/newversion/sprite/_112.atz",
  ],
  message: "",
  filename: "",
  title: "",
  addon: "",
  loading: false,
};
