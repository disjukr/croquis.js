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

export function createStylusState(): StylusState {
  return {
    x: 0,
    y: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
  };
}

const dummyStylusState = createStylusState();
export function createStylusStates(
  length: number,
  prototype: Readonly<StylusState> = dummyStylusState
): StylusState[] {
  return Array.from({ length }, () => cloneStylusState(prototype));
}

export function cloneStylusState(stylusState: Readonly<StylusState>): StylusState {
  const { x, y, pressure, tangentialPressure, tiltX, tiltY, twist } = stylusState;
  return { x, y, pressure, tangentialPressure, tiltX, tiltY, twist };
}

export function copyStylusState(dst: StylusState, src: Readonly<StylusState>) {
  dst.x = src.x;
  dst.y = src.y;
  dst.pressure = src.pressure;
  dst.tangentialPressure = src.tangentialPressure;
  dst.tiltX = src.tiltX;
  dst.tiltY = src.tiltY;
  dst.twist = src.twist;
}

export function interpolateStylusState(target: StylusState, to: Readonly<StylusState>, t: number) {
  target.x = lerp(target.x, to.x, t);
  target.y = lerp(target.y, to.y, t);
  target.pressure = lerp(target.pressure, to.pressure, t);
  target.tangentialPressure = lerp(target.tangentialPressure, to.tangentialPressure, t);
  target.tiltX = lerp(target.tiltX, to.tiltX, t);
  target.tiltY = lerp(target.tiltY, to.tiltY, t);
  target.twist = lerpAngle(target.twist, to.twist, t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number) {
  const c = ((((b - a) % 360) + 540) % 360) - 180;
  return a + ((c * t) % 360);
}
