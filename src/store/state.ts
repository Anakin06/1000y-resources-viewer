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
    "D:\\Focus\\archive\\newversion\\effect\\_1000.eft",
    "D:\\Focus\\archive\\newversion\\effect\\_1001.eft",
    "D:\\Focus\\archive\\newversion\\effect\\_0.eft",
    "D:\\Focus\\archive\\newversion\\effect\\_1.eft",
  ],
  message: "",
  filename: "",
  title: "",
  addon: "",
  loading: false,
};
