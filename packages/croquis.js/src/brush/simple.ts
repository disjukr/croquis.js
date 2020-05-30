import type { Circle } from '../geometry';
import type { StylusState } from '../stylus';
import { cloneStylusState, copyStylusState } from '../stylus';
import type { StrokeProtocol, StrokeDrawingContext } from '../stroke-protocol';
import { dummyCanvasContext } from '../misc';

export type BrushContext = CanvasRenderingContext2D;

export interface BrushConfig {
  ctx: BrushContext;
  color: string;
  size: number;
}

export const defaultBrushConfig = Object.freeze<BrushConfig>({
  ctx: dummyCanvasContext,
  color: '#000',
  size: 10,
});

export interface BrushStrokeState {
  prev: StylusState;
  // boundingRect: Rect;
}

export interface BrushStrokeResult {
  // boundingRect: Rect;
}

export type BrushStroke = StrokeProtocol<BrushConfig, BrushStrokeState, BrushStrokeResult>;
export const stroke: BrushStroke = {
  resume(config, prevState) {
    return getDrawingContext(stroke, config, prevState);
  },
  down(config, curr) {
    const state: BrushStrokeState = {
      prev: cloneStylusState(curr),
    };
    const drawingContext = getDrawingContext(stroke, config, state);
    if (curr.pressure <= 0) return drawingContext;
    config.ctx.save();
    config.ctx.fillStyle = config.color;
    drawCircle(config.ctx, stylusStateToCircle(curr, config.size));
    config.ctx.restore();
    return drawingContext;
  },
};

function getDrawingContext(
  stroke: StrokeProtocol,
  config: BrushConfig,
  state: BrushStrokeState
): StrokeDrawingContext<BrushConfig, BrushStrokeState, BrushStrokeResult> {
  return {
    getConfig(target?: StrokeProtocol) {
      if (!target || target === stroke) return config;
      throw undefined;
    },
    getState(target?: StrokeProtocol) {
      if (!target || target === stroke) return state;
      throw undefined;
    },
    move(curr) {
      const c1 = stylusStateToCircle(state.prev, config.size);
      const c2 = stylusStateToCircle(curr, config.size);
      config.ctx.save();
      config.ctx.fillStyle = config.color;
      drawCapsule(config.ctx, c1, c2);
      copyStylusState(state.prev, curr);
      config.ctx.restore();
    },
    up(curr) {
      const c1 = stylusStateToCircle(state.prev, config.size);
      const c2 = stylusStateToCircle(curr, config.size);
      config.ctx.save();
      config.ctx.fillStyle = config.color;
      drawCapsule(config.ctx, c1, c2);
      copyStylusState(state.prev, curr);
      config.ctx.restore();
      return {
        // boundingRect: state.boundingRect,
      };
    },
  };
}

function stylusStateToCircle(stylusState: StylusState, size: number): Circle {
  return { x: stylusState.x, y: stylusState.y, r: stylusState.pressure * size * 0.5 };
}

function drawCapsule(ctx: BrushContext, c1: Circle, c2: Circle) {
  const c1IsBig = c1.r > c2.r;
  const big = c1IsBig ? c1 : c2;
  const small = c1IsBig ? c2 : c1;
  const d = Math.sqrt((c2.x - c1.x) ** 2 + (c2.y - c1.y) ** 2);
  if (big.r > small.r + d) return drawCircle(ctx, big);
  if (big.r === small.r) {
    drawCapsuleCase1(ctx, big, small);
  } else {
    drawCapsuleCase2(ctx, big, small);
  }
}

function drawCircle(ctx: BrushContext, circle: Circle) {
  ctx.beginPath();
  ctx.moveTo(circle.x + circle.r, circle.y);
  ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

const quarter = Math.PI / 2;

function drawCapsuleCase1(ctx: BrushContext, c1: Circle, c2: Circle) {
  drawCircle(ctx, c1);
  drawCircle(ctx, c2);
  const c = Math.atan2(c2.y - c1.y, c2.x - c1.x);
  const i = c - quarter;
  const j = c + quarter;
  const idx = Math.cos(i) * c2.r;
  const idy = Math.sin(i) * c2.r;
  const jdx = Math.cos(j) * c2.r;
  const jdy = Math.sin(j) * c2.r;
  ctx.beginPath();
  ctx.moveTo(c2.x + idx, c2.y + idy);
  ctx.lineTo(c1.x + idx, c1.y + idy);
  ctx.lineTo(c1.x + jdx, c1.y + jdy);
  ctx.lineTo(c2.x + jdx, c2.y + jdy);
  ctx.closePath();
  ctx.fill();
}

function drawCapsuleCase2(ctx: BrushContext, c1: Circle, c2: Circle) {
  drawCircle(ctx, c1);
  drawCircle(ctx, c2);
  const x = c2.x - c1.x || 1e-9;
  const y = c2.y - c1.y;
  const r = c1.r - c2.r;
  const r2 = r * r;
  const x2 = x * x;
  const x3 = x * x * x;
  const y2 = y * y;
  const ax =
    (x === 0 ? c1.r : (y * Math.sqrt(r2 * x2 * (-r2 + x2 + y2)) + r2 * x2) / (x3 + x * y2)) + c1.x;
  const ay = (r2 * y - Math.sqrt(r2 * x2 * (-r2 + x2 + y2))) / (x2 + y2) + c1.y;
  const bx =
    (x === 0 ? -c1.r : (-(y * Math.sqrt(r2 * x2 * (-r2 + x2 + y2))) + r2 * x2) / (x3 + x * y2)) +
    c1.x;
  const by = (r2 * y + Math.sqrt(r2 * x2 * (-r2 + x2 + y2))) / (x2 + y2) + c1.y;
  const i = Math.atan2(ay - c1.y, ax - c1.x);
  const j = Math.atan2(by - c1.y, bx - c1.x);
  const idx = Math.cos(i) * c2.r;
  const idy = Math.sin(i) * c2.r;
  const jdx = Math.cos(j) * c2.r;
  const jdy = Math.sin(j) * c2.r;
  ctx.beginPath();
  ctx.moveTo(c2.x + idx, c2.y + idy);
  ctx.lineTo(ax + idx, ay + idy);
  ctx.lineTo(bx + jdx, by + jdy);
  ctx.lineTo(c2.x + jdx, c2.y + jdy);
  ctx.closePath();
  ctx.fill();
}
