export default function getViewport() {
  const { clientWidth, clientHeight } = document.documentElement;

  return {
    width: clientWidth,
    height: clientHeight - (process.platform === "darwin" ? 22 : 52),
  };
}
