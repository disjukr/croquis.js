import React, { useRef, PointerEventHandler, useState } from 'react';
import {
  stroke as brush,
  defaultBrushConfig,
  getDrawCircleFn,
  BrushStrokeResult,
} from 'croquis.js/lib/draw/brush';
import chooChoo, { defaultChooChooConfig, ChooChooState } from 'croquis.js/lib/stabilizer/chooChoo';
import type { StrokeDrawingPhase } from 'croquis.js/lib';
import { getStylusState } from 'croquis.js/lib/environment/stylus';

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingPhase, setDrawingPhase] = useState<
    StrokeDrawingPhase<ChooChooState, BrushStrokeResult>
  >();
  const downHandler: PointerEventHandler = e => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const stylusState = getStylusState(e.nativeEvent);
    setDrawingPhase(
      chooChoo(brush).down(
        {
          ...defaultChooChooConfig,
          targetConfig: {
            ...defaultBrushConfig,
            ctx,
            draw: getDrawCircleFn(ctx, '#000', 1),
            size: 30,
            aspectRatio: 1,
          },
        },
        stylusState
      )
    );
  };
  const moveHandler: PointerEventHandler | undefined =
    drawingPhase &&
    (e => {
      const stylusState = getStylusState(e.nativeEvent);
      drawingPhase.move(stylusState);
    });
  const upHandler: PointerEventHandler | undefined =
    drawingPhase &&
    (e => {
      const stylusState = getStylusState(e.nativeEvent);
      drawingPhase.up(stylusState);
      setDrawingPhase(undefined);
    });
  return (
    <canvas
      ref={canvasRef}
      onPointerDown={downHandler}
      onPointerMove={moveHandler}
      onPointerUp={upHandler}
      width={500}
      height={500}
      style={{
        outline: '1px solid black',
        touchAction: 'none',
      }}
    />
  );
};

export default Page;
