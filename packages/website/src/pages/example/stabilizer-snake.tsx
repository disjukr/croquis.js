import React, { useRef, PointerEventHandler, useState, useEffect } from 'react';
import {
  stroke as brush,
  BrushStroke,
  defaultBrushConfig,
  BrushStrokeResult,
} from 'croquis.js/lib/brush/simple';
import {
  getStroke as getSnakeStroke,
  SnakeDrawingContext,
  SnakeState,
} from 'croquis.js/lib/stabilizer/snake';
import type { StrokeDrawingContext } from 'croquis.js/lib/stroke-protocol';
import { getStylusState } from 'croquis.js/lib/stylus';
import SnakeGuide from '../../components/guide/stabilizer/SnakeGuide';
import Draw from '../../components/example/Draw';
import GithubCorner from '../../components/GithubCorner';
import DataController from '../../components/DataController';
import useCanvasFadeout from '../../misc/useCanvasFadeout';
import useWindowSize from '../../misc/useWindowSize';
import useForceUpdate from '../../misc/useForceUpdate';

const snake = getSnakeStroke(brush);

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasFadeout(canvasRef);
  const windowSize = useWindowSize();
  const [drawingPhase, setDrawingPhase] = useState<
    StrokeDrawingContext<any, SnakeState, BrushStrokeResult>
  >();
  interface Config {
    brushSize: number;
    tailCount: number;
    weight: number;
  }
  const [config, setConfig] = useState<Config>(() => ({
    brushSize: 40,
    tailCount: 5,
    weight: 0.7,
  }));
  useEffect(() => {
    if (!drawingPhase) return;
    const id = setInterval(drawingPhase.getState().update, 10);
    return () => clearInterval(id);
  }, [drawingPhase]);
  const downHandler: PointerEventHandler = e => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const stylusState = getStylusState(e.nativeEvent);
    const brushConfig = {
      ...defaultBrushConfig,
      ctx,
      size: config.brushSize,
    };
    const drawingPhase = snake.down(
      {
        tailCount: config.tailCount,
        weight: config.weight,
        catchUp: true,
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
      <DataController
        className="data-controller"
        data={config}
        setData={setConfig}
        config={{
          brushSize: { label: 'Brush Size', type: 'range', min: 0, max: 100, step: 1 },
          tailCount: { label: 'Tail Count', type: 'range', min: 1, max: 10, step: 1 },
          weight: { label: 'Weight', type: 'range', min: 0, max: 1, step: 0.01 },
        }}
      />
    </>
  );
};

export default Page;

interface StabilizerGuideProps {
  drawingPhase?: SnakeDrawingContext<BrushStroke>;
}
const StabilizerGuide: React.FC<StabilizerGuideProps> = props => {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const id = setInterval(forceUpdate, 10);
    return () => {
      clearInterval(id);
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
