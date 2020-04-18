import type { Color } from '../color';
import type { Rect } from '../geometry/rect';
import type { StylusState } from '../environment/stylus';
import { cloneStylusState, copyStylusState } from '../environment/stylus';
import type { StrokeProtocol, StrokeDrawingContext } from '..';

const pi = Math.PI;
const one = pi + pi;
const quarter = pi * 0.5;
const toRad = pi / 180;
const min = Math.min;
const max = Math.max;
const abs = Math.abs;
const sin = Math.sin;
const cos = Math.cos;
const sqrt = Math.sqrt;
const atan2 = Math.atan2;

export interface RandomFn {
  (): number; // 0~1
}

export interface DrawFn {
  (width: number, height: number): void;
}

export interface BrushConfig {
  ctx: CanvasRenderingContext2D;
  draw: DrawFn;
  size: number;
  aspectRatio: number;
  spacing: number;
  angle: number; // radian
  rotateToTangent: boolean;
  // TODO: scaleSpread
  angleRandom: RandomFn;
  angleSpread: number; // radian
  normalRandom: RandomFn;
  normalSpread: number;
  tangentRandom: RandomFn;
  tangentSpread: number;
}

type RequiredKeysOfBrushConfig = 'ctx' | 'draw' | 'size' | 'aspectRatio';
export const defaultBrushConfig = Object.freeze<Omit<BrushConfig, RequiredKeysOfBrushConfig>>({
  spacing: 0.1,
  angle: 0,
  rotateToTangent: false,
  angleRandom: Math.random,
  angleSpread: 0,
  normalRandom: Math.random,
  normalSpread: 0,
  tangentRandom: Math.random,
  tangentSpread: 0,
});

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
  prev: StylusState;
  tangent: number; // radian
  delta: number;
  lastStamp: StampParams;
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
  angle: number;
}

export function stamp(config: BrushConfig, state: BrushStrokeState, params: StampParams) {
  if (params.scale <= 0) return;
  const size = config.size * params.scale;
  const width = getBrushWidth(size, config.aspectRatio);
  const height = getBrushHeight(size);
  const angleSpread = config.angleSpread && config.angleSpread * (config.angleRandom() - 0.5);
  const angle =
    params.angle +
    (config.rotateToTangent ? config.angle + state.tangent : config.angle) +
    angleSpread;
  const normalSpread =
    config.normalSpread && config.normalSpread * size * (config.normalRandom() - 0.5);
  const tangentSpread =
    config.tangentSpread && config.tangentSpread * size * (config.tangentRandom() - 0.5);
  const doSpread = normalSpread || tangentSpread;
  const normal = state.tangent + quarter;
  const spreadX = doSpread && cos(normal) * normalSpread + cos(state.tangent) * tangentSpread;
  const spreadY = doSpread && sin(normal) * normalSpread + sin(state.tangent) * tangentSpread;
  const x = params.x + spreadX;
  const y = params.y + spreadY;
  {
    // draw
    const ctx = config.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.translate(-(width * 0.5), -(height * 0.5));
    config.draw(width, height);
    ctx.restore();
  }
  {
    // expand bounding rect
    const br = state.boundingRect;
    const boundWidth = angle ? abs(height * sin(angle)) + abs(width * cos(angle)) : width;
    const boundHeight = angle ? abs(width * sin(angle)) + abs(height * cos(angle)) : height;
    const bx = x - boundWidth * 0.5;
    const by = y - boundHeight * 0.5;
    const rx = min(br.x, bx);
    const ry = min(br.y, by);
    const right = max(br.x + br.w, bx + boundWidth);
    const bottom = max(br.y + br.h, by + boundHeight);
    state.boundingRect.x = rx;
    state.boundingRect.y = ry;
    state.boundingRect.w = right - rx;
    state.boundingRect.h = bottom - ry;
  }
  state.lastStamp = params;
}

export type BrushStroke = StrokeProtocol<BrushConfig, BrushStrokeState, BrushStrokeResult>;
export const stroke: BrushStroke = {
  resume(config, prevState) {
    return getDrawingContext(config, prevState);
  },
  down(config, curr) {
    const state: BrushStrokeState = {
      tangent: 0,
      delta: 0,
      lastStamp: { x: curr.x, y: curr.y, scale: curr.pressure, angle: curr.twist * toRad },
      reservedStamp: null,
      boundingRect: { x: 0, y: 0, w: 0, h: 0 },
      prev: cloneStylusState(curr),
    };
    const drawingContext = getDrawingContext(config, state);
    if (curr.pressure <= 0) return drawingContext;
    if (config.rotateToTangent || config.normalSpread > 0 || config.tangentSpread > 0) {
      state.reservedStamp = state.lastStamp;
    } else {
      stamp(config, state, state.lastStamp);
    }
    return drawingContext;
  },
};

function getDrawingContext(
  config: BrushConfig,
  state: BrushStrokeState
): StrokeDrawingContext<BrushConfig, BrushStrokeState, BrushStrokeResult> {
  return {
    config,
    state,
    move(curr) {
      try {
        {
          // accumulate delta
          const dx = curr.x - state.prev.x;
          const dy = curr.y - state.prev.y;
          state.delta += sqrt(dx * dx + dy * dy);
        }
        const spacing = max(
          config.size * config.spacing * ((state.prev.pressure + curr.pressure) * 0.5),
          0.5
        );
        const ldx = curr.x - state.lastStamp.x;
        const ldy = curr.y - state.lastStamp.y;
        state.tangent = atan2(ldy, ldx);
        if (state.reservedStamp && ldx !== 0 && ldy !== 0) {
          stamp(config, state, state.reservedStamp);
          state.reservedStamp = null;
        }
        if (state.delta < spacing) return;
        if (sqrt(ldx * ldx + ldy * ldy) < spacing) {
          state.delta -= spacing;
          stamp(config, state, {
            x: curr.x,
            y: curr.y,
            scale: curr.pressure,
            angle: curr.twist * toRad,
          });
          return;
        }
        const scaleSpacing = (curr.pressure - state.prev.pressure) * (spacing / state.delta);
        const tx = cos(state.tangent);
        const ty = sin(state.tangent);
        while (state.delta >= spacing) {
          state.lastStamp.x += tx * spacing;
          state.lastStamp.y += ty * spacing;
          state.lastStamp.scale += scaleSpacing;
          state.delta -= spacing;
          stamp(config, state, state.lastStamp);
        }
      } finally {
        copyStylusState(state.prev, curr);
      }
    },
    up(curr) {
      state.tangent = atan2(curr.y - state.lastStamp.y, curr.x - state.lastStamp.x);
      if (state.reservedStamp) {
        stamp(config, state, state.reservedStamp);
        state.reservedStamp = null;
      }
      return {
        boundingRect: state.boundingRect,
      };
    },
  };
}
