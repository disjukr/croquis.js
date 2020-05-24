import React, { useRef, PointerEventHandler, useState, useEffect } from 'react';
import {
  stroke as brush,
  BrushStroke,
  defaultBrushConfig,
  BrushStrokeResult,
} from 'croquis.js/lib/brush/simple';
import {
  getStroke as getSnakeStroke,
  defaultSnakeConfig,
  SnakeDrawingContext,
} from 'croquis.js/lib/stabilizer/snake';
import type { StrokeDrawingContext } from 'croquis.js/lib/stroke-protocol';
import { getStylusState, createStylusState } from 'croquis.js/lib/stylus';
import SnakeGuide from '../../components/guide/stabilizer/SnakeGuide';
import Draw from '../../components/example/Draw';
import GithubCorner from '../../components/GithubCorner';
import useCanvasFadeout from '../../misc/useCanvasFadeout';
import useWindowSize from '../../misc/useWindowSize';
import useForceUpdate from '../../misc/useForceUpdate';

const snake = getSnakeStroke(brush);

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasFadeout(canvasRef);
  const windowSize = useWindowSize();
  const [drawingPhase, setDrawingPhase] = useState<
    StrokeDrawingContext<any, any, BrushStrokeResult>
  >();
  useEffect(() => {
    if (!drawingPhase?.getState().update) return;
    const id = setInterval(drawingPhase.getState().update, 10);
    return () => clearInterval(id);
  }, [drawingPhase]);
  const downHandler: PointerEventHandler = e => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const stylusState = getStylusState(e.nativeEvent);
    const brushConfig = {
      ...defaultBrushConfig,
      ctx,
      size: 20,
    };
    const drawingPhase = snake.down(
      {
        ...defaultSnakeConfig,
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
      <StabilizerGuide drawingPhase={drawingPhase} />
      <Draw drawing={!!drawingPhase} />
      <GithubCorner
        bannerColor="#000"
        octoColor="#fff"
        href="https://github.com/disjukr/croquis.js/blob/master/packages/website/src/pages/example/stabilizer-snake.tsx"
      />
    </>
  );
};

export default Page;

interface StabilizerGuideProps {
  drawingPhase?: SnakeDrawingContext<BrushStroke>;
}
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
  return (
    <SnakeGuide
      brushSize={props.drawingPhase.getConfig(brush).size}
      stylusStates={props.drawingPhase.getState().stylusStates}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  );
};
