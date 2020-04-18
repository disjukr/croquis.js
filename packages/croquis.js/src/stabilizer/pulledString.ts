import { StylusState, cloneStylusState, copyStylusState } from '../stylus';
import type {
  StrokeProtocol,
  StrokeDrawingContext,
  ResultOfStrokeProtocol,
  StrokeDrawingContextFromProtocol,
  ConfigOfStrokeProtocol,
} from '../stroke-protocol';

export interface PulledStringConfig<TProxyTarget extends StrokeProtocol = any> {
  stringLength: number;
  targetConfig: ConfigOfStrokeProtocol<TProxyTarget>;
}
export const defaultPulledStringConfig: Omit<PulledStringConfig<any>, 'targetConfig'> = {
  stringLength: 50,
};
export interface PulledStringState<TProxyTarget extends StrokeProtocol = any> {
  targetDrawingContext: StrokeDrawingContextFromProtocol<TProxyTarget>;
  follower: StylusState;
}
export type PulledStringDrawingContext<
  TProxyTarget extends StrokeProtocol = any
> = StrokeDrawingContext<PulledStringConfig<TProxyTarget>, PulledStringState<TProxyTarget>>;
function getDrawingContext(
  config: PulledStringConfig<any>,
  state: PulledStringState<any>
): PulledStringDrawingContext {
  return {
    config,
    state,
    move(stylusState) {
      const l = config.stringLength;
      const px = state.follower.x;
      const py = state.follower.y;
      const dx = stylusState.x - px;
      const dy = stylusState.y - py;
      const d = Math.sqrt(dx * dx + dy * dy);
      copyStylusState(state.follower, stylusState);
      if (d > l) {
        const t = Math.min((d - l) / l, 1);
        state.follower.x = px + dx * t;
        state.follower.y = py + dy * t;
      } else {
        state.follower.x = px;
        state.follower.y = py;
      }
      state.targetDrawingContext.move(state.follower);
    },
    up: state.targetDrawingContext.up,
  };
}
export default function pulledString<TProxyTarget extends StrokeProtocol>(target: TProxyTarget) {
  return {
    resume(config, prevState) {
      return getDrawingContext(config, prevState);
    },
    down(config, stylusState) {
      const state = {
        targetDrawingContext: target.down(config.targetConfig, stylusState),
        follower: cloneStylusState(stylusState),
      };
      return getDrawingContext(config, state);
    },
  } as StrokeProtocol<
    PulledStringConfig<TProxyTarget>,
    PulledStringState<TProxyTarget>,
    ResultOfStrokeProtocol<TProxyTarget>
  >;
}

export function getGuidePathData(
  pointerX: number,
  pointerY: number,
  followerX: number,
  followerY: number,
  stringLength: number
): string {
  const dx = pointerX - followerX;
  const dy = pointerY - followerY;
  const d = Math.sqrt(dx * dx + dy * dy);
  const sx = followerX;
  const sy = followerY;
  const ex = pointerX;
  const ey = pointerY;
  if (d >= stringLength) return `M${sx},${sy}L${ex},${ey}`;
  const cx = sx + (ex - sx) * 0.5;
  const cy = sy + (ey - sy) * 0.5 + (stringLength - d);
  return `M${sx},${sy}Q${cx},${cy} ${ex},${ey}`;
}
