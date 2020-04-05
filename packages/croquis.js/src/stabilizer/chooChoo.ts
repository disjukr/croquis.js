import type { StylusState } from '../environment/stylus';
import type {
  StrokeProtocol,
  StrokeDrawingPhase,
  ResultOfStrokeProtocol,
  StrokeDrawingPhaseFromProtocol,
  ConfigOfStrokeProtocol,
} from '..';

export interface ChooChooConfig<TProxyTarget extends StrokeProtocol = any> {
  count: number;
  weight: number; // 0~1
  catchUp: boolean;
  targetConfig: ConfigOfStrokeProtocol<TProxyTarget>;
}
export const defaultChooChooConfig: Omit<ChooChooConfig<any>, 'targetConfig'> = {
  count: 10,
  weight: 0.5,
  catchUp: true,
};
export interface ChooChooState<TProxyTarget extends StrokeProtocol = any> {
  targetDrawingPhase: StrokeDrawingPhaseFromProtocol<TProxyTarget>;
  stylusStates: StylusState[];
  update(): void;
}
function getDrawingPhase(
  config: ChooChooConfig<any>,
  state: ChooChooState<any>
): StrokeDrawingPhase<ChooChooState<any>> {
  return {
    state,
    move(stylusState) {
      state.targetDrawingPhase.move(stylusState);
    },
    up(stylusState) {
      return state.targetDrawingPhase.up(stylusState);
    },
  };
}
export default function chooChoo<TProxyTarget extends StrokeProtocol>(target: TProxyTarget) {
  return {
    resume(config, prevState) {
      return getDrawingPhase(config, prevState);
    },
    down(config, strokeState) {
      const state = {
        targetDrawingPhase: target.down(config.targetConfig, strokeState),
        stylusStates: [],
        update() {
          // const follow = 1 - Math.min(0.95, Math.max(0, config.weight));
        },
      };
      return getDrawingPhase(config, state);
    },
  } as StrokeProtocol<
    ChooChooConfig<TProxyTarget>,
    ChooChooState<TProxyTarget>,
    ResultOfStrokeProtocol<TProxyTarget>
  >;
}
