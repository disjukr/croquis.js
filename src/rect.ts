module Croquis {
    export class Rect {
        x: number;
        y: number;
        width: number;
        height: number;
        constructor (x: number , y: number, width: number, height: number) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        clone(): Rect {
            return new Rect(this.x, this.y, this.width, this.height);
        }
        isEmpty(): boolean {
            return this.width === 0 || this.height === 0;
        }
        get left(): number {
            return this.x;
        }
        set left(value: number) {
            this.width += this.x - value;
            this.x = value;
        }
        get right(): number {
            return this.x + this.width;
        }
        set right(value: number) {
            this.width = value - this.x;
        }
        get top(): number {
            return this.y;
        }
        set top(value: number) {
            this.height += this.y - value;
            this.y = value;
        }
        get bottom(): number {
            return this.y + this.height;
        }
        set bottom(value: number) {
            this.height = value - this.y;
        }
    }
}