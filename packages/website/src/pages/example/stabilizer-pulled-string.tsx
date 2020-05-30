import React, { useRef, PointerEventHandler, useState, useEffect } from 'react';
import {
  stroke as brush,
  BrushStroke,
  defaultBrushConfig,
  BrushStrokeResult,
} from 'croquis.js/lib/brush/simple';
import {
  getStroke as getPulledStringStroke,
  PulledStringDrawingContext,
} from 'croquis.js/lib/stabilizer/pulled-string';
import type { StrokeDrawingContext } from 'croquis.js/lib/stroke-protocol';
import { getStylusState, createStylusState } from 'croquis.js/lib/stylus';
import PulledStringGuide from '../../components/guide/stabilizer/PulledStringGuide';
import Draw from '../../components/example/Draw';
import GithubCorner from '../../components/GithubCorner';
import DataController from '../../components/DataController';
import useCanvasFadeout from '../../misc/useCanvasFadeout';
import useWindowSize from '../../misc/useWindowSize';
import useForceUpdate from '../../misc/useForceUpdate';

const pulledString = getPulledStringStroke(brush);

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasFadeout(canvasRef);
  const windowSize = useWindowSize();
  const [drawingPhase, setDrawingPhase] = useState<
    StrokeDrawingContext<any, any, BrushStrokeResult>
  >();
  interface Config {
    brushSize: number;
    stringLength: number;
  }
  const [config, setConfig] = useState<Config>(() => ({
    brushSize: 40,
    stringLength: 200,
  }));
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
      size: config.brushSize,
    };
    const drawingPhase = pulledString.down(
      {
        stringLength: config.stringLength,
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
        href="https://github.com/disjukr/croquis.js/blob/master/packages/website/src/pages/example/stabilizer-pulled-string.tsx"
      />
      <DataController
        className="data-controller"
        data={config}
        setData={setConfig}
        config={{
          brushSize: { label: 'Brush Size', type: 'range', min: 0, max: 100, step: 1 },
          stringLength: { label: 'String Length', type: 'range', min: 0, max: 200, step: 1 },
        }}
      />
    </>
  );
};

export default Page;

interface StabilizerGuideProps {
  drawingPhase?: PulledStringDrawingContext<BrushStroke>;
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
    <PulledStringGuide
      brushSize={props.drawingPhase.getConfig(brush).size}
      stylusState={stylusState}
      follower={props.drawingPhase.getState().follower}
      stringLength={props.drawingPhase.getConfig().stringLength}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  );
};
