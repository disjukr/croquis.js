import React, { useEffect, useRef, PointerEventHandler } from 'react';
import {
  down,
  move,
  up,
  defaultBrushConfig,
  BrushConfig,
  getDrawCircleFn,
  BrushStrokeState,
} from 'croquis.js/lib/draw/brush';

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brushConfigRef = useRef<BrushConfig>();
  const brushStateRef = useRef<BrushStrokeState>();
  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d')!;
    brushConfigRef.current = {
      ...defaultBrushConfig,
      ctx,
      draw: getDrawCircleFn(ctx, '#000', 1),
      size: 30,
      aspectRatio: 1,
    };
  }, []);
  const downHandler: PointerEventHandler = e => {
    brushStateRef.current = down(brushConfigRef.current!, e.nativeEvent);
  };
  const moveHandler: PointerEventHandler = e => {
    if (!brushStateRef.current) return;
    if (e.nativeEvent.pressure !== 0.5) console.log(e.nativeEvent.pressure);
    move(brushConfigRef.current!, brushStateRef.current, e.nativeEvent);
  };
  const upHandler: PointerEventHandler = e => {
    if (!brushStateRef.current) return;
    up(brushConfigRef.current!, brushStateRef.current, e.nativeEvent);
  };
  return <canvas
    ref={canvasRef}
    onPointerDown={downHandler}
    onPointerMove={moveHandler}
    onPointerUp={upHandler}
    width={500}
    height={500}
    style={{ outline: '1px solid black' }}
  />;
}

export default Page;
