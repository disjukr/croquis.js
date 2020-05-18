import React, { useRef, useState, useEffect, CSSProperties } from 'react';
import cx from 'classnames';
import {
  stroke as brush,
  defaultBrushConfig,
  BrushConfig,
  getDrawSoftRoundFn,
  getDrawHardRoundFn,
  getDrawStarFn,
  getStampFn,
  DrawFn,
} from 'croquis.js/lib/brush/common';
import { getRandomFn } from 'croquis.js/lib/prng/lfsr113';
import { createStylusState } from 'croquis.js/lib/stylus';

const canvasWidth = 300;
const canvasHeight = 80;
const Page = () => {
  const brushConfigState = useState<BrushConfig>(defaultBrushConfig);
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    setCanvas(canvasRef.current!);
  }, []);
  return (
    <div className="page">
      <BrushStrokePreview
        ref={canvasRef}
        brushConfigState={brushConfigState}
        canvas={canvas}
        style={{ marginTop: '20px', marginBottom: '6px' }}
      />
      <SelectBrushTip brushConfigState={brushConfigState} canvas={canvas} />
      <Checkbox brushConfigState={brushConfigState} field="applyPressureToSize">
        Apply Pen Pressure To Size
      </Checkbox>
      <Slider brushConfigState={brushConfigState} max={50} field="size">
        Size
      </Slider>
      <Checkbox brushConfigState={brushConfigState} field="applyPressureToFlow">
        Apply Pen Pressure To Flow
      </Checkbox>
      <Slider brushConfigState={brushConfigState} max={1} field="flow">
        Flow
      </Slider>
      <Slider brushConfigState={brushConfigState} max={3} field="spacing">
        Spacing
      </Slider>
      <Slider brushConfigState={brushConfigState} max={20} field="normalSpread">
        Normal Spread
      </Slider>
      <Slider brushConfigState={brushConfigState} max={20} field="tangentSpread">
        Tangent Spread
      </Slider>
      <style jsx global>{`
        body {
          background-color: #535353;
        }
      `}</style>
      <style jsx>{`
        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default Page;

const drawSoftRound = getDrawSoftRoundFn('#fff', 'rgba(255,255,255,0)');
const drawHardRound = getDrawHardRoundFn('#fff');
const drawStar = getDrawStarFn('#fff', 5, 0.5);

interface SelectBrushTipProps {
  brushConfigState: [BrushConfig, React.Dispatch<BrushConfig>];
  canvas?: HTMLCanvasElement;
}
const SelectBrushTip: React.FC<SelectBrushTipProps> = ({ brushConfigState, canvas }) => {
  const [brushConfig, setBrushConfig] = brushConfigState;
  const [drawFn, setDrawFn] = useState<DrawFn>(() => drawSoftRound);
  useEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    setBrushConfig({
      ...brushConfig,
      stamp: getStampFn(ctx, drawFn),
    });
  }, [canvas, drawFn]);
  return (
    <div className="select-brush-tip">
      <p>Brush Tip</p>
      <div>
        <BrushTip drawFn={drawSoftRound} selectedDrawFn={drawFn} setDrawFn={setDrawFn} />
        <BrushTip drawFn={drawHardRound} selectedDrawFn={drawFn} setDrawFn={setDrawFn} />
        <BrushTip drawFn={drawStar} selectedDrawFn={drawFn} setDrawFn={setDrawFn} />
      </div>
      <style jsx>{`
        .select-brush-tip {
          margin-bottom: 6px;
          width: 280px;
        }
        p {
          margin: 0;
          margin-bottom: 6px;
          color: #fff;
          font-size: 12px;
          font-family: sans-serif;
        }
      `}</style>
    </div>
  );
};

interface BrushTipProps {
  drawFn: DrawFn;
  selectedDrawFn: DrawFn;
  setDrawFn: React.Dispatch<DrawFn>;
  onClick?: () => void;
}
const BrushTip: React.FC<BrushTipProps> = ({ drawFn, selectedDrawFn, setDrawFn }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    drawBrushTip(canvasRef.current!, drawFn);
  }, []);
  const selected = selectedDrawFn === drawFn;
  return (
    <button className="brush-tip" onClick={() => setDrawFn(() => drawFn)}>
      <canvas ref={canvasRef} width={30} height={30} />
      <style jsx>{`
        .brush-tip {
          margin-right: 6px;
          padding: 6px;
          outline: none;
          border: solid 1px #383838;
          background: none;
        }
      `}</style>
      <style jsx>{`
        .brush-tip {
          border-bottom: solid 1px ${selected ? '#fff' : '#707070'};
        }
      `}</style>
    </button>
  );
};

function drawBrushTip(canvas: HTMLCanvasElement, drawFn: DrawFn) {
  const ctx = canvas.getContext('2d')!;
  drawFn(ctx, canvas.width, canvas.height);
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  brushConfigState: [BrushConfig, React.Dispatch<BrushConfig>];
  field: keyof BrushConfig;
}
const Checkbox: React.FC<CheckboxProps> = ({ children, brushConfigState, field, ...props }) => {
  const [brushConfig, setBrushConfig] = brushConfigState;
  return (
    <label className="checkbox">
      <p>
        {children}{' '}
        <input
          type="checkbox"
          {...props}
          checked={brushConfig[field] as any}
          onChange={e => setBrushConfig({ ...brushConfig, [field]: e.target.checked })}
        />
      </p>
      <style jsx>{`
        .checkbox {
          margin-bottom: 6px;
          width: 280px;
        }
        p {
          margin: 0;
          color: #fff;
          font-size: 12px;
          font-family: sans-serif;
        }
        input {
          margin: 0;
          margin-left: 1em;
          vertical-align: middle;
        }
      `}</style>
    </label>
  );
};

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  brushConfigState: [BrushConfig, React.Dispatch<BrushConfig>];
  field: keyof BrushConfig;
}
const Slider: React.FC<SliderProps> = ({ children, brushConfigState, field, ...props }) => {
  const [brushConfig, setBrushConfig] = brushConfigState;
  return (
    <label className="slider">
      <p>{children}</p>
      <input
        type="range"
        min={0}
        step={0.01}
        {...props}
        value={brushConfig[field] as any}
        onChange={e => setBrushConfig({ ...brushConfig, [field]: +e.target.value })}
      />
      <style jsx>{`
        .slider {
          margin-bottom: 6px;
        }
        p {
          margin: 0;
          margin-bottom: 6px;
          color: #fff;
          font-size: 12px;
          font-family: sans-serif;
        }
        input {
          margin: 0;
          width: 280px;
        }
      `}</style>
    </label>
  );
};

interface BrushStrokePreviewProps {
  className?: string;
  style?: CSSProperties;
  brushConfigState: [BrushConfig, React.Dispatch<BrushConfig>];
  canvas?: HTMLCanvasElement;
}
const BrushStrokePreview = React.forwardRef<HTMLCanvasElement, BrushStrokePreviewProps>(
  ({ className, style, brushConfigState, canvas }, ref) => {
    const [brushConfig] = brushConfigState;
    useEffect(() => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      drawStroke(ctx, brushConfig, canvasWidth, canvasHeight, 30);
    }, [canvas, brushConfig]);
    return (
      <>
        <canvas
          className={cx('brush-stroke-preview', className)}
          ref={ref}
          width={canvasWidth}
          height={canvasHeight}
          style={style}
        />
        <style jsx>{`
          .brush-stroke-preview {
            background-color: #4e4e4e;
            border: solid 1px #383838;
            border-bottom: solid 1px #707070;
          }
        `}</style>
      </>
    );
  }
);

function drawStroke(
  ctx: CanvasRenderingContext2D,
  brushConfig: BrushConfig,
  canvasWidth: number,
  canvasHeight: number,
  padding: number
) {
  if (brushConfig === defaultBrushConfig) {
    return;
  } else {
    brushConfig.angleRandom = getRandomFn(0);
    brushConfig.normalRandom = getRandomFn(1);
    brushConfig.tangentRandom = getRandomFn(2);
  }
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  const halfHeight = canvasHeight >> 1;
  const paddedWidth = canvasWidth - padding * 2;
  const amplitude = halfHeight - padding;
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
