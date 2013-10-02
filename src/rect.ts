module Croquis {
    export class Rect {
        private _x: number;
        private _y: number;
        private _width: number;
        private _height: number;
        constructor (x: number , y: number, width: number, height: number) {
            this._x = x;
            this._y = y;
            this._width = width;
            this._height = height;
        }
        isEmpty(): boolean {
            return this._width === 0 && this._height === 0;
        }
        get x(): number {
            return this._x;
        }
        set x(value: number) {
            this._x = value;
        }
        get y(): number {
            return this._y;
        }
        set y(value: number) {
            this._y = value;
        }
        get width(): number {
            return this._width;
        }
        set width(value: number) {
            this._width = value;
        }
        get height(): number {
            return this._height;
        }
        set height(value: number) {
            this._height = value;
        }
        get left(): number {
            return this._x;
        }
        set left(value: number) {
            this._width += this._x - value;
            this._x = value;
        }
        get right(): number {
            return this._x + this._width;
        }
        set right(value: number) {
            this._width = value - this._x;
        }
        get top(): number {
            return this._y;
        }
        set top(value: number) {
            this._height += this._y - value;
            this._y = value;
        }
        get bottom(): number {
            return this._y + this._height;
        }
        set bottom(value: number) {
            this._height = value - this._y;
        }
    }
}