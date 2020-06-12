export default class Dragable {
  startX: number = 0;
  startY: number = 0;
  _onMove!: (x: number, y: number) => void;
  _onStart!: () => void;
  _elem!: HTMLElement;
  _cursor = "";
  wrap(
    elem: HTMLElement,
    onStart: () => void,
    onMove: (x: number, y: number) => void
  ) {
    this._onStart = onStart;
    this._onMove = onMove;
    elem.addEventListener("mousedown", this.onMouseDown);
    this._elem = elem;
  }

  unwrap(elem: HTMLElement) {
    elem.removeEventListener("mousedown", this.onMouseDown);
    //@ts-ignore
    this._onMove = void 0;
    //@ts-ignore
    this._onStart = void 0;
    //@ts-ignore
    this._elem = null;
  }

  onMouseDown = (e: MouseEvent) => {
    [this.startX, this.startY] = [e.pageX, e.pageY];
    document.documentElement.addEventListener("mouseup", this.onMouseUp);
    document.documentElement.addEventListener("mousemove", this.onMouseMove);
    this._cursor = this._elem.style.cursor;
    this._elem.style.cursor = "grabbing";
    this._onStart();
  };

  onMouseMove = (e: MouseEvent) => {
    const [x, y] = [this.startX - e.pageX, this.startY - e.pageY];
    this._onMove(x, y);
  };

  onMouseUp = (e: MouseEvent) => {
    document.documentElement.removeEventListener("mouseup", this.onMouseUp);
    document.documentElement.removeEventListener("mousemove", this.onMouseMove);
    this._elem.style.cursor = this._cursor;
  };
}
