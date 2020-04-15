import { StylusState, cloneStylusState, copyStylusState } from '../environment/stylus';
import type {
  StrokeProtocol,
  StrokeDrawingPhase,
  ResultOfStrokeProtocol,
  StrokeDrawingPhaseFromProtocol,
  ConfigOfStrokeProtocol,
} from '..';

export interface PulledStringConfig<TProxyTarget extends StrokeProtocol = any> {
  stringLength: number;
  targetConfig: ConfigOfStrokeProtocol<TProxyTarget>;
}
export const defaultPulledStringConfig: Omit<PulledStringConfig<any>, 'targetConfig'> = {
  stringLength: 50,
};
export interface PulledStringState<TProxyTarget extends StrokeProtocol = any> {
  targetDrawingPhase: StrokeDrawingPhaseFromProtocol<TProxyTarget>;
  follower: StylusState;
}
function getDrawingPhase(
  config: PulledStringConfig<any>,
  state: PulledStringState<any>
): StrokeDrawingPhase<PulledStringState<any>> {
  return {
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
      state.targetDrawingPhase.move(state.follower);
    },
    up: state.targetDrawingPhase.up,
  };
}
export default function pulledString<TProxyTarget extends StrokeProtocol>(target: TProxyTarget) {
  return {
    resume(config, prevState) {
      return getDrawingPhase(config, prevState);
    },
    down(config, stylusState) {
      const state = {
        targetDrawingPhase: target.down(config.targetConfig, stylusState),
        follower: cloneStylusState(stylusState),
      };
      return getDrawingPhase(config, state);
    },
  } as StrokeProtocol<
    PulledStringConfig<TProxyTarget>,
    PulledStringState<TProxyTarget>,
    ResultOfStrokeProtocol<TProxyTarget>
  >;
}
