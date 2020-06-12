export default class Rectangle {
  private _x = 0;
  private _y = 0;
  private _width = 0;
  private _height = 0;
  private _boundingbox = {
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  };

  setBoundingbox(x: number, y: number, width: number, height: number) {
    this._boundingbox = {
      x,
      y,
      width,
      height,
    };
  }

  get left() {
    return Math.max(this._x, this._boundingbox.x);
  }

  get top() {
    return Math.max(this._y, this._boundingbox.y);
  }

  get right() {
    const value = this._x + this._width;
    return Math.min(value, this._boundingbox.width);
  }
  get bottom() {
    const value = this.y + this._height;
    return Math.min(value, this._boundingbox.height);
  }

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

  get width() {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
  }

  get height() {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
  }

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}
