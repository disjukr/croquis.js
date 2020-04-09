import { StylusState, cloneStylusState, copyStylusState } from '../environment/stylus';
import type {
  StrokeProtocol,
  StrokeDrawingPhase,
  ResultOfStrokeProtocol,
  StrokeDrawingPhaseFromProtocol,
  ConfigOfStrokeProtocol,
} from '..';

export interface PulledStringConfig<TProxyTarget extends StrokeProtocol = any> {
  stringLength: number; // 0~1
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
      // TODO
      state.targetDrawingPhase.move(stylusState);
    },
    up(stylusState) {
      return state.targetDrawingPhase.up(stylusState);
    },
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
