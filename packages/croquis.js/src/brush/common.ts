import type { Color } from '../color';
import type { Rect } from '../geometry';
import type { StylusState } from '../stylus';
import { cloneStylusState, copyStylusState } from '../stylus';
import type { StrokeProtocol, StrokeDrawingContext } from '../stroke-protocol';

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

export type BrushContext = Pick<
  CanvasRenderingContext2D,
  'restore' | 'rotate' | 'save' | 'translate'
>;

export interface BrushConfig {
  ctx: BrushContext;
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

const noop = () => {};
const dummyBrushContext: BrushContext = {
  restore: noop,
  rotate: noop,
  save: noop,
  translate: noop,
};

export const defaultBrushConfig = Object.freeze<BrushConfig>({
  ctx: dummyBrushContext,
  draw: noop,
  size: 10,
  aspectRatio: 1,
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
  reserved: boolean;
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
}

export type BrushStroke = StrokeProtocol<BrushConfig, BrushStrokeState, BrushStrokeResult>;
export const stroke: BrushStroke = {
  resume(config, prevState) {
    return getDrawingContext(stroke, config, prevState);
  },
  down(config, curr) {
    const state: BrushStrokeState = {
      tangent: 0,
      delta: 0,
      lastStamp: { x: curr.x, y: curr.y, scale: curr.pressure, angle: curr.twist * toRad },
      reserved: false,
      boundingRect: { x: 0, y: 0, w: 0, h: 0 },
      prev: cloneStylusState(curr),
    };
    const drawingContext = getDrawingContext(stroke, config, state);
    if (curr.pressure <= 0) return drawingContext;
    if (config.rotateToTangent || config.normalSpread > 0 || config.tangentSpread > 0) {
      state.reserved = true;
    } else {
      stamp(config, state, state.lastStamp);
    }
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
      try {
        {
          // accumulate delta
          const dx = curr.x - state.prev.x;
          const dy = curr.y - state.prev.y;
          state.delta += sqrt(dx * dx + dy * dy);
        }
        const prevPressure = state.prev.pressure;
        const currPressure = curr.pressure;
        const lastStamp = state.lastStamp;
        const drawSpacing = max(
          config.size * config.spacing * ((prevPressure + currPressure) * 0.5),
          0.5
        );
        const ldx = curr.x - lastStamp.x;
        const ldy = curr.y - lastStamp.y;
        state.tangent = atan2(ldy, ldx);
        if (state.reserved && ldx !== 0 && ldy !== 0) {
          stamp(config, state, state.lastStamp);
          state.reserved = false;
        }
        if (state.delta < drawSpacing) return;
        lastStamp.angle = curr.twist * toRad;
        lastStamp.scale = curr.pressure;
        if (sqrt(ldx * ldx + ldy * ldy) < drawSpacing) {
          state.delta -= drawSpacing;
          lastStamp.x = curr.x;
          lastStamp.y = curr.y;
          stamp(config, state, lastStamp);
          return;
        }
        const scaleSpacing = (currPressure - prevPressure) * (drawSpacing / state.delta);
        const tx = cos(state.tangent);
        const ty = sin(state.tangent);
        while (state.delta >= drawSpacing) {
          lastStamp.x += tx * drawSpacing;
          lastStamp.y += ty * drawSpacing;
          lastStamp.scale += scaleSpacing;
          state.delta -= drawSpacing;
          stamp(config, state, lastStamp);
        }
      } finally {
        copyStylusState(state.prev, curr);
      }
    },
    up(curr) {
      const lastStamp = state.lastStamp;
      state.tangent = atan2(curr.y - lastStamp.y, curr.x - lastStamp.x);
      if (state.reserved) {
        stamp(config, state, state.lastStamp);
        state.reserved = false;
      }
      return {
        boundingRect: state.boundingRect,
      };
    },
  };
}
