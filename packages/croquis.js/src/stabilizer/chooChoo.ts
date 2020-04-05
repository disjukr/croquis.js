import { StylusState } from '../environment/stylus';
import { StrokeProtocol, StrokeDrawingPhase } from '..';

export interface ChooChooConfig {
  count: number;
  weight: number; // 0~1
  catchUp: boolean;
  target: StrokeDrawingPhase<unknown, unknown>;
}
export const defaultChooChooConfig: Omit<ChooChooConfig, 'target'> = {
  count: 10,
  weight: 0.5,
  catchUp: true,
};
export interface ChooChooState {
  stylusStates: StylusState[];
  update(): void;
}
const chooChoo: StrokeProtocol<ChooChooConfig, ChooChooState, unknown> = (
  config,
  stylusState,
  prevState
) => {
  const state = prevState || {
    stylusStates: [],
    update() {
      // TODO
    },
  };
  return {
    state,
    move(stylusState) {
      config.target.move(stylusState);
    },
    up(stylusState) {
      config.target.up(stylusState);
    },
  };
};

export default chooChoo;
