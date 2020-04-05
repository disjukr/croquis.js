export * as draw from './draw';
export * as color from './color';
import { StylusState } from './environment/stylus';

export interface StrokeProtocol<TConfig = unknown, TState = unknown, TResult = unknown> {
  resume(config: TConfig, prevState: TState): StrokeDrawingPhase<TState, TResult>;
  down(config: TConfig, stylusState: StylusState): StrokeDrawingPhase<TState, TResult>;
}
export interface StrokeDrawingPhase<TState = unknown, TResult = unknown> {
  readonly state: TState;
  move(stylusState: StylusState): void;
  up(stylusState: StylusState): TResult;
}
export type StrokeDrawingPhaseFromProtocol<T> = T extends StrokeProtocol<
  unknown,
  infer TState,
  infer TResult
>
  ? StrokeDrawingPhase<TState, TResult>
  : StrokeDrawingPhase<unknown, unknown>;
export type ConfigOfStrokeProtocol<T> = T extends StrokeProtocol<infer TConfig, unknown, unknown>
  ? TConfig
  : unknown;
export type ResultOfStrokeProtocol<T> = T extends StrokeProtocol<unknown, unknown, infer TResult>
  ? TResult
  : unknown;
