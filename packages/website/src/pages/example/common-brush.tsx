import React, { useRef, useState, useEffect, useImperativeHandle, CSSProperties } from 'react';
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
  const brushConfigState = useState<BrushConfig>(defaultBrushConfig);
  useEffect(() => {
    document.body.style.backgroundColor = '#535353';
  }, []);
  return (
    <>
      <BrushStrokePreview brushConfigState={brushConfigState} />
      <Slider brushConfigState={brushConfigState} min={0} max={50} field="size">
        Size
      </Slider>
      <Slider brushConfigState={brushConfigState} min={0} max={1} step={0.01} field="flow">
        Flow
      </Slider>
      <Slider brushConfigState={brushConfigState} min={0} max={3} step={0.01} field="spacing">
        Spacing
      </Slider>
    </>
  );
};

export default Page;

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  brushConfigState: [BrushConfig, React.Dispatch<BrushConfig>];
  field: keyof BrushConfig;
}
const Slider: React.FC<SliderProps> = ({ children, brushConfigState, field, ...props }) => {
  const [brushConfig, setBrushConfig] = brushConfigState;
  return (
    <label>
      <p style={{
        margin: 0,
        marginBottom: '6px',
        color: '#fff',
        fontSize: '12px',
      }}>{children}</p>
      <input
        type="range"
        {...props}
        value={brushConfig[field] as any}
        onChange={e => setBrushConfig({ ...brushConfig, [field]: +e.target.value })}
      />
    </label>
  );
};

interface BrushStrokePreviewProps {
  style?: CSSProperties;
  brushConfigState: [BrushConfig, React.Dispatch<BrushConfig>];
}
const BrushStrokePreview: React.FC<BrushStrokePreviewProps> = ({ brushConfigState, style }) => {
  const [brushConfig, setBrushConfig] = brushConfigState;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d')!;
    setBrushConfig({
      ...brushConfig,
      ctx,
      draw: getDrawCircleFn(ctx, '#fff'),
    });
  }, []);
  useEffect(() => {
    drawStroke(brushConfig, canvasWidth, canvasHeight, 30);
  }, [brushConfig]);
  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        backgroundColor: '#4e4e4e',
        border: 'solid 1px #383838',
        borderBottom: 'solid 1px #707070',
        ...style,
      }}
    />
  );
};

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
