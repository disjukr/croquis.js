import { StylusState, createStylusStates } from '../environment/stylus';
import { copyStylusState, interpolateStylusState } from '../environment/stylus';
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
      if (config.catchUp) {
        let dx: number, dy: number;
        do {
          state.update();
          dx = (tail.x - head.x) | 0;
          dy = (tail.y - head.y) | 0;
        } while (dx || dy);
      }
      return state.targetDrawingPhase.up(tail);
    },
  };
}
export default function chooChoo<TProxyTarget extends StrokeProtocol>(target: TProxyTarget) {
  return {
    resume(config, prevState) {
      const diff = config.tailCount + 1 - prevState.stylusStates.length;
      if (diff > 0) {
        const tail = prevState.stylusStates[prevState.stylusStates.length - 1];
        prevState.stylusStates = prevState.stylusStates.concat(createStylusStates(diff, tail));
      } else if (diff < 0) {
        prevState.stylusStates.length -= diff;
      }
      return getDrawingPhase(config, prevState);
    },
    down(config, stylusState) {
      const stylusStates = createStylusStates(config.tailCount + 1, stylusState);
      const tail = stylusStates[stylusStates.length - 1];
      const state = {
        targetDrawingPhase: target.down(config.targetConfig, stylusState),
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
