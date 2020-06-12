export default class Vector2 {
  private _x = 0;
  private _y = 0;

  get x() {
    return this._x;
  }
  set x(value: number) {
    this._x = value;
  }

  get y() {
    return this._y;
  }
  set y(value: number) {
    this._y = value;
  }

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  add(x: number, y: number) {
    return new Vector2(this.x + x, this.y + y);
  }

  clamp(x1: number, x2: number, y1: number, y2: number) {
    this.x = Math.min(Math.max(this.x, x1), x2);
    this.y = Math.min(Math.max(this.y, y1), y2);
    return this;
  }

  static Zero() {
    return new Vector2(0, 0);
  }
}
