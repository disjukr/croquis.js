export * as draw from './draw';
export * as color from './color';
import { StylusState } from './environment/stylus';

export interface StrokeProtocol<TConfig = void, TState = void, TResult = void> {
  (config: TConfig, stylusState: StylusState, prevState?: TState): StrokeDrawingPhase<
    TState,
    TResult
  >;
}

export interface StrokeDrawingPhase<TState = void, TResult = void> {
  readonly state: TState;
  move(stylusState: StylusState): void;
  up(stylusState: StylusState): TResult;
}
