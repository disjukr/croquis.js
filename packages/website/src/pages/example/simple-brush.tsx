import React, { useRef, PointerEventHandler, useState, useEffect } from 'react';
import {
  stroke as brush,
  defaultBrushConfig,
  BrushStrokeResult,
} from 'croquis.js/lib/brush/simple';

import type { StrokeDrawingContext } from 'croquis.js/lib/stroke-protocol';
import { getStylusState } from 'croquis.js/lib/stylus';
import useCanvasFadeout from '../../misc/useCanvasFadeout';
import useWindowSize from '../../misc/useWindowSize';
import Draw from '../../components/example/Draw';

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
    const brushConfig = {
      ...defaultBrushConfig,
      ctx,
      size: 20,
    };
    const stylusState = getStylusState(e.nativeEvent);
    const drawingPhase = brush.down(brushConfig, stylusState);
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
      <Draw drawing={!!drawingPhase} />
    </>
  );
};

export default Page;
