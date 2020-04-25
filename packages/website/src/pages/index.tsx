import React, { useRef, PointerEventHandler, useState, useEffect } from 'react';
import {
  stroke as brush,
  BrushStroke,
  defaultBrushConfig,
  getDrawCircleFn,
  BrushStrokeResult,
} from 'croquis.js/lib/brush';
import snake, {
  defaultSnakeConfig,
  SnakeDrawingContext,
} from 'croquis.js/lib/stabilizer/snake';
import pulledString, {
  defaultPulledStringConfig,
  PulledStringDrawingContext,
} from 'croquis.js/lib/stabilizer/pulledString';
import type { StrokeDrawingContext } from 'croquis.js/lib/stroke-protocol';
import { getStylusState, createStylusState } from 'croquis.js/lib/stylus';
import SnakeGuide from '../components/guide/stabilizer/SnakeGuide';
import PulledStringGuide from '../components/guide/stabilizer/PulledStringGuide';
import useCanvasFadeout from '../misc/useCanvasFadeout';
import useWindowSize from '../misc/useWindowSize';
import useForceUpdate from '../misc/useForceUpdate';

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasFadeout(canvasRef);
  const windowSize = useWindowSize();
  const [drawingPhase, setDrawingPhase] = useState<
    StrokeDrawingContext<any, any, BrushStrokeResult>
  >();
  const [stabilizerType, setStabilizerType] = useState<StabilizerType>('pulled string');
  useEffect(() => setDrawingPhase(undefined), [stabilizerType]);
  useEffect(() => {
    if (!drawingPhase?.state.update) return;
    const id = setInterval(drawingPhase.state.update, 10);
    return () => clearInterval(id);
  }, [drawingPhase]);
  const downHandler: PointerEventHandler = e => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const stylusState = getStylusState(e.nativeEvent);
    const brushConfig = {
      ...defaultBrushConfig,
      ctx,
      draw: getDrawCircleFn(ctx, '#000', 1),
      size: 20,
      aspectRatio: 1,
    };
    const drawingPhase =
      stabilizerType === 'snake'
        ? snake(brush).down(
            {
              ...defaultSnakeConfig,
              targetConfig: brushConfig,
            },
            stylusState
          )
        : pulledString(brush).down(
            {
              ...defaultPulledStringConfig,
              targetConfig: brushConfig,
            },
            stylusState
          );
    setDrawingPhase(drawingPhase);
  };
  useEffect(() => {
    if (!drawingPhase) return;
    const moveHandler = (e: PointerEvent) => {
      const stylusState = getStylusState(e);
      drawingPhase.move(stylusState);
    };
    const upHandler = (e: PointerEvent) => {
      const stylusState = getStylusState(e);
      drawingPhase.up(stylusState);
      setDrawingPhase(undefined);
    };
    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler);
    return () => {
      window.removeEventListener('pointermove', moveHandler);
      window.removeEventListener('pointerup', upHandler);
    };
  }, [drawingPhase]);
  return (
    <>
      <canvas
        ref={canvasRef}
        onPointerDown={downHandler}
        width={windowSize.width}
        height={windowSize.height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          touchAction: 'none',
        }}
      />
      <StabilizerGuide type={stabilizerType} drawingPhase={drawingPhase} />
    </>
  );
};

export default Page;

type StabilizerGuideProps =
  | {
      type: 'snake';
      drawingPhase?: SnakeDrawingContext<BrushStroke>;
    }
  | {
      type: 'pulled string';
      drawingPhase?: PulledStringDrawingContext<BrushStroke>;
    };
type StabilizerType = StabilizerGuideProps['type'];
const defaultStylusState = createStylusState();
const StabilizerGuide: React.FC<StabilizerGuideProps> = props => {
  const [stylusState, setStylusState] = useState(defaultStylusState);
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const pointermove = (e: PointerEvent) => setStylusState(getStylusState(e));
    const id = setInterval(forceUpdate, 10);
    window.addEventListener('pointermove', pointermove);
    return () => {
      clearInterval(id);
      window.removeEventListener('pointermove', pointermove);
    };
  }, []);
  if (!props.drawingPhase) return null;
  switch (props.type) {
    case 'snake':
      return (
        <SnakeGuide
          brushSize={props.drawingPhase.config.targetConfig.size}
          stylusStates={props.drawingPhase.state.stylusStates}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      );
    case 'pulled string':
      return (
        <PulledStringGuide
          brushSize={props.drawingPhase.config.targetConfig.size}
          stylusState={stylusState}
          follower={props.drawingPhase.state.follower}
          stringLength={props.drawingPhase.config.stringLength}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      );
  }
};
