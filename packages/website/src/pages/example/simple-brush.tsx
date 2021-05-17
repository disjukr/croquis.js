import React, { useRef, PointerEventHandler, useState, useEffect } from 'react';
import { stroke as brush, BrushStrokeResult } from '@disjukr/croquis-js/lib/brush/simple';

import type { StrokeDrawingContext } from '@disjukr/croquis-js/lib/stroke-protocol';
import { getStylusState } from '@disjukr/croquis-js/lib/stylus';
import useCanvasFadeout from '../../misc/useCanvasFadeout';
import useWindowSize from '../../misc/useWindowSize';
import Draw from '../../components/example/Draw';
import GithubCorner from '../../components/GithubCorner';
import DataController from '../../components/DataController';

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasFadeout(canvasRef);
  const windowSize = useWindowSize();
  const [drawingContext, setDrawingContext] = useState<
    StrokeDrawingContext<any, any, BrushStrokeResult>
  >();
  interface Config {
    brushSize: number;
    color: string;
  }
  const [config, setConfig] = useState<Config>(() => ({
    brushSize: 40,
    color: '#000',
  }));
  useEffect(() => {
    if (!drawingContext?.getState().update) return;
    const id = setInterval(drawingContext.getState().update, 10);
    return () => clearInterval(id);
  }, [drawingContext]);
  const downHandler: PointerEventHandler = e => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const brushConfig = {
      ctx,
      size: config.brushSize,
      color: config.color,
    };
    const stylusState = getStylusState(e.nativeEvent);
    const drawingContext = brush.down(brushConfig, stylusState);
    setDrawingContext(drawingContext);
  };
  useEffect(() => {
    if (!drawingContext) return;
    const moveHandler = (e: PointerEvent) => {
      const stylusState = getStylusState(e);
      drawingContext.move(stylusState);
    };
    const upHandler = (e: PointerEvent) => {
      const stylusState = getStylusState(e);
      drawingContext.up(stylusState);
      setDrawingContext(undefined);
    };
    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler);
    return () => {
      window.removeEventListener('pointermove', moveHandler);
      window.removeEventListener('pointerup', upHandler);
    };
  }, [drawingContext]);
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
      <Draw drawing={!!drawingContext} />
      <GithubCorner
        bannerColor="#000"
        octoColor="#fff"
        href="https://github.com/disjukr/croquis.js/blob/master/packages/website/src/pages/example/simple-brush.tsx"
      />
      <DataController
        className="data-controller"
        data={config}
        setData={setConfig}
        config={{
          brushSize: { label: 'Brush Size', type: 'range', min: 0, max: 100, step: 1 },
          color: { label: 'Color', type: 'color' },
        }}
      />
    </>
  );
};

export default Page;
