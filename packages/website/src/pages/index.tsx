import React, { useRef, PointerEventHandler, useState, useEffect } from 'react';
import {
  stroke as brush,
  defaultBrushConfig,
  getDrawCircleFn,
  BrushStrokeResult,
} from 'croquis.js/lib/draw/brush';
import chooChoo, { defaultChooChooConfig, ChooChooState } from 'croquis.js/lib/stabilizer/chooChoo';
import pulledString, {
  defaultPulledStringConfig,
  PulledStringState,
} from 'croquis.js/lib/stabilizer/pulledString';
import type { StrokeDrawingPhase } from 'croquis.js/lib';
import { getStylusState } from 'croquis.js/lib/environment/stylus';
import PulledStringGuide from '../components/guide/stabilizer/PulledStringGuide';
import useCanvasFadeout from '../misc/useCanvasFadeout';
import useWindowSize from '../misc/useWindowSize';

const Page = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasFadeout(canvasRef);
  const windowSize = useWindowSize();
  // const [drawingPhase, setDrawingPhase] = useState<
  //   StrokeDrawingPhase<ChooChooState, BrushStrokeResult>
  // >();
  const [drawingPhase, setDrawingPhase] = useState<
    StrokeDrawingPhase<PulledStringState, BrushStrokeResult>
  >();
  // useEffect(() => {
  //   if (!drawingPhase) return;
  //   const id = setInterval(drawingPhase.state.update, 10);
  //   return () => clearInterval(id);
  // }, [drawingPhase]);
  const downHandler: PointerEventHandler = e => {
    const ctx = canvasRef.current!.getContext('2d')!;
    const stylusState = getStylusState(e.nativeEvent);
    const brushConfig = {
      ...defaultBrushConfig,
      ctx,
      draw: getDrawCircleFn(ctx, '#000', 1),
      size: 20,
      aspectRatio: 1,
    };
    // setDrawingPhase(
    //   chooChoo(brush).down(
    //     {
    //       ...defaultChooChooConfig,
    //       targetConfig: brushConfig,
    //     },
    //     stylusState
    //   )
    // );
    setDrawingPhase(
      pulledString(brush).down(
        {
          ...defaultPulledStringConfig,
          targetConfig: brushConfig,
        },
        stylusState
      )
    );
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
      <StabilizerGuide type="pulled string" drawingPhase={drawingPhase} />
    </>
  );
};

export default Page;

type StabilizerGuideProps =
  // | {
  //   type: 'choo choo',
  //   drawingPhase?: StrokeDrawingPhase<ChooChooState, BrushStrokeResult>,
  // }
  {
    type: 'pulled string';
    drawingPhase?: StrokeDrawingPhase<PulledStringState, BrushStrokeResult>;
  };
const StabilizerGuide: React.FC<StabilizerGuideProps> = ({ type, drawingPhase }) => {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const pointermove = (e: PointerEvent) => setPointer({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', pointermove);
    return () => window.removeEventListener('pointermove', pointermove);
  }, []);
  return (
    (drawingPhase && (
      <PulledStringGuide
        pointerX={pointer.x}
        pointerY={pointer.y}
        followerX={drawingPhase.state.follower.x}
        followerY={drawingPhase.state.follower.y}
        stringLength={100}
        power={drawingPhase.state.follower.pressure * 20}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    )) ||
    null
  );
};
