import type { StylusState } from '../environment/stylus';
import { cloneStylusState, copyStylusState, interpolateStylusState } from '../environment/stylus';
import type {
  StrokeProtocol,
  StrokeDrawingPhase,
  ResultOfStrokeProtocol,
  StrokeDrawingPhaseFromProtocol,
  ConfigOfStrokeProtocol,
} from '..';

export interface ChooChooConfig<TProxyTarget extends StrokeProtocol = any> {
  tailCount: number;
  weight: number; // 0~1
  catchUp: boolean;
  targetConfig: ConfigOfStrokeProtocol<TProxyTarget>;
}
export const defaultChooChooConfig: Omit<ChooChooConfig<any>, 'targetConfig'> = {
  tailCount: 3,
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
      const head = state.stylusStates[0];
      copyStylusState(head, stylusState);
    },
    up(stylusState) {
      const head = state.stylusStates[0];
      const tail = state.stylusStates[state.stylusStates.length - 1];
      copyStylusState(head, stylusState);
      // TODO: catch up
      return state.targetDrawingPhase.up(tail);
    },
  };
}
export default function chooChoo<TProxyTarget extends StrokeProtocol>(target: TProxyTarget) {
  return {
    resume(config, prevState) {
      return getDrawingPhase(config, prevState);
    },
    down(config, strokeState) {
      const stylusStates = Array.from({ length: config.tailCount + 1 }, () =>
        cloneStylusState(strokeState)
      );
      const head = stylusStates[0];
      const tail = stylusStates[stylusStates.length - 1];
      const state = {
        targetDrawingPhase: target.down(config.targetConfig, strokeState),
        stylusStates,
        update() {
          const follow = 1 - Math.min(0.95, Math.max(0, config.weight));
          for (let i = 1; i < stylusStates.length; ++i) {
            const curr = stylusStates[i];
            const prev = stylusStates[i - 1];
            interpolateStylusState(curr, prev, follow);
          }
          state.targetDrawingPhase.move(tail);
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
