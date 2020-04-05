export interface StylusState {
  x: number;
  y: number;
  pressure: number; // 0~1
  tangentialPressure: number; // -1~1
  tiltX: number; // -90~90
  tiltY: number; // -90~90
  twist: number; // 0~359
}

interface XY {
  x: number;
  y: number;
}
const id = <T>(x: T) => x;
export function getStylusState(e: PointerEvent, transformXy: (xy: XY) => XY = id) {
  return {
    ...transformXy({ x: e.x, y: e.y }),
    pressure: e.pointerType === 'mouse' ? 1 : e.pressure,
    tangentialPressure: e.tangentialPressure,
    tiltX: e.tiltX,
    tiltY: e.tiltY,
    twist: e.twist,
  };
}
