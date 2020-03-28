import { Color } from '../color';
import { Rect } from '../geom/rect';

const pi = Math.PI;
const one = pi + pi;
const quarter = pi * 0.5;
const abs = Math.abs;
const sin = Math.sin;
const cos = Math.cos;
const atan2 = Math.atan2;

export interface BrushStrokeParams {
  x: number;
  y: number;
  pressure: number; // 0~1
  tangentialPressure: number; // -1~1
  tiltX: number; // -90~90
  tiltY: number; // -90~90
  twist: number; // 0~359
}

export interface RandomFn {
  (): number;
}

export interface DrawFn {
  (width: number, height: number): void;
}

export interface BrushConfig {
  ctx: CanvasRenderingContext2D;
  randomFn: RandomFn;
  drawFn: DrawFn;
  size: number;
  aspectRatio: number;
  spacing: number;
  angle: number; // radian
  rotateToTangent: boolean;
  normalSpread: number;
  tangentSpread: number;
}

export function getDrawCircleFn(ctx: CanvasRenderingContext2D, color: Color, flow: number) {
  return function drawCircle(width: number, height: number) {
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = flow;
    ctx.beginPath();
    ctx.arc(halfWidth, halfHeight, halfWidth, 0, one);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
}

export function getBrushWidth(size: number, aspectRatio: number) {
  return size * aspectRatio;
}

export function getBrushHeight(size: number) {
  return size;
}

export interface BrushStrokeState {
  prev: BrushStrokeParams;
  tangent: number; // radian
  delta: number;
  lastStampX: number;
  lastStampY: number;
  reservedStamp: StampParams | null;
  boundingRect: Rect;
}

export interface BrushStrokeResult {
  boundingRect: Rect;
}

export interface StampParams {
  x: number;
  y: number;
  scale: number;
}

export function stamp(config: BrushConfig, state: BrushStrokeState, params: StampParams) {
  const size = config.size * params.scale;
  const normal = state.tangent + quarter;
  const normalRandom = config.normalSpread * size * (config.randomFn() - 0.5);
  const tangentRandom = config.tangentSpread * size * (config.randomFn() - 0.5);
  const angle = config.rotateToTangent ? config.angle + state.tangent : config.angle;
  const width = getBrushWidth(size, config.aspectRatio);
  const height = getBrushHeight(size);
  const boundWidth = abs(height * sin(angle)) + abs(width * cos(angle));
  const boundHeight = abs(width * sin(angle)) + abs(height * cos(angle));
  const spreadX = cos(normal) * normalRandom + cos(state.tangent) * tangentRandom;
  const spreadY = sin(normal) * normalRandom + sin(state.tangent) * tangentRandom;
  {
    // draw
    const ctx = config.ctx;
    ctx.save();
    ctx.translate(spreadX, spreadY);
    ctx.rotate(angle);
    ctx.translate(-(width * 0.5), -(height * 0.5));
    config.drawFn(width, height);
    ctx.restore();
  }
  {
    // expand bounding rect
    const br = state.boundingRect;
    const bx = spreadX - boundWidth * 0.5;
    const by = spreadY - boundHeight * 0.5;
    const x = Math.min(br.x, bx);
    const y = Math.min(br.y, by);
    const right = Math.max(br.x + br.w, bx + boundWidth);
    const bottom = Math.max(br.y + br.h, by + boundHeight);
    state.boundingRect.x = x;
    state.boundingRect.y = y;
    state.boundingRect.w = right - x;
    state.boundingRect.h = bottom - y;
  }
}

export function down(config: BrushConfig, state: BrushStrokeState, curr: BrushStrokeParams) {
  state.tangent = 0;
  state.delta = 0;
  state.lastStampX = curr.x;
  state.lastStampY = curr.y;
  state.boundingRect = { x: 0, y: 0, w: 0, h: 0 };
  state.prev = curr;
  if (curr.pressure <= 0) return;
  const stampParams = { x: curr.x, y: curr.y, scale: curr.pressure };
  if (config.rotateToTangent || config.normalSpread > 0 || config.tangentSpread > 0) {
    state.reservedStamp = stampParams;
  } else {
    stamp(config, state, stampParams);
  }
}

export function move(config: BrushConfig, state: BrushStrokeState, curr: BrushStrokeParams) {
  // TODO
}

export function up(
  config: BrushConfig,
  state: BrushStrokeState,
  curr: BrushStrokeParams
): BrushStrokeResult {
  state.tangent = atan2(curr.y - state.lastStampY, curr.x - state.lastStampX);
  if (state.reservedStamp) {
    stamp(config, state, state.reservedStamp);
    state.reservedStamp = null;
  }
  return {
    boundingRect: state.boundingRect,
  };
}
