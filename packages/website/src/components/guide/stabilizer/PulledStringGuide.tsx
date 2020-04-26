import React from 'react';
import { getGuidePathData } from 'croquis.js/lib/stabilizer/pulled-string';
import { StylusState } from 'croquis.js/lib/stylus';

interface PulledStringGuideProps extends React.SVGProps<SVGSVGElement> {
  brushSize: number;
  stylusState: StylusState;
  follower: StylusState;
  stringLength: number;
}
const PulledStringGuide: React.FC<PulledStringGuideProps> = ({
  brushSize,
  stylusState,
  follower,
  stringLength,
  style,
  ...svgProps
}) => {
  const pathData = getGuidePathData(
    stylusState.x,
    stylusState.y,
    follower.x,
    follower.y,
    stringLength
  );
  return (
    <svg
      {...svgProps}
      style={{
        ...style,
        overflow: 'visible',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
      <path d={pathData} fill="none" stroke="white" strokeWidth={8} strokeLinecap="round" />
      <circle
        r={brushSize * stylusState.pressure * 0.5}
        cx={stylusState.x}
        cy={stylusState.y}
        fill="none"
        stroke="white"
        strokeWidth={8}
      />
      <path d={pathData} fill="none" stroke="red" strokeWidth={4} strokeLinecap="round" />
      <circle
        r={brushSize * stylusState.pressure * 0.5}
        cx={stylusState.x}
        cy={stylusState.y}
        fill="none"
        stroke="red"
        strokeWidth={4}
      />
      <circle
        r={stringLength}
        cx={follower.x}
        cy={follower.y}
        fill="none"
        stroke="red"
        strokeWidth={1}
      />
    </svg>
  );
};

export default PulledStringGuide;
