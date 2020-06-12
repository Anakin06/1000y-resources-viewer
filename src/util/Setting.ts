type Settings = {
  alpha: number;
};

const settings: Settings = {
  alpha: 80,
};

export default settings;
export function set(c: Partial<Settings>) {
  Object.assign(settings, c);
}
