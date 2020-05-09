import React, { useRef, PointerEventHandler, useState, useEffect } from 'react';
import {
  stroke as brush,
  defaultBrushConfig,
  BrushConfig,
  getDrawCircleFn,
} from 'croquis.js/lib/brush/common';
import { createStylusState } from 'croquis.js/lib/stylus';

const canvasWidth = 300;
const canvasHeight = 80;
const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushConfig, setBrushConfig] = useState<BrushConfig>(defaultBrushConfig);
  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d')!;
    setBrushConfig({
      ...brushConfig,
      ctx,
      draw: getDrawCircleFn(ctx, '#000', 1),
    });
  }, []);
  useEffect(() => {
    drawStroke(brushConfig, canvasWidth, canvasHeight, 30);
  }, [brushConfig]);
  return (
    <>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          border: '1px solid black',
        }}
      />
      <input
        type="range"
        min={0}
        max={50}
        value={brushConfig.size}
        onChange={e => setBrushConfig({ ...brushConfig, size: +e.target.value })}
      />
      <input
        type="range"
        min={0}
        max={3}
        step={0.01}
        value={brushConfig.spacing}
        onChange={e => setBrushConfig({ ...brushConfig, spacing: +e.target.value })}
      />
    </>
  );
};

export default Page;

function drawStroke(
  brushConfig: BrushConfig,
  canvasWidth: number,
  canvasHeight: number,
  padding: number
) {
  const ctx = brushConfig.ctx as CanvasRenderingContext2D;
  if (!ctx.clearRect) return;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  const halfHeight = canvasHeight >> 1;
  const paddedWidth = canvasWidth - padding * 2;
  const amplitude = halfHeight - padding;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  const stylusState = createStylusState();
  stylusState.x = padding;
  stylusState.y = halfHeight;
  stylusState.pressure = 0;
  const drawingPhase = brush.down(brushConfig, stylusState);
  for (let t = 0; t < 1; t += 0.01) {
    stylusState.x = t * paddedWidth + padding;
    stylusState.y = -Math.sin(Math.PI * 2 * t) * amplitude + halfHeight;
    stylusState.pressure = 1 - Math.abs(t * 2 - 1);
    drawingPhase.move(stylusState);
  }
  stylusState.x = canvasWidth - padding;
  stylusState.y = halfHeight;
  stylusState.pressure = 0;
  drawingPhase.up(stylusState);
}
