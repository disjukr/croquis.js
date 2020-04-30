import React from 'react';
import { StylusState } from 'croquis.js/lib/stylus';

interface SnakeGuideProps extends React.SVGProps<SVGSVGElement> {
  brushSize: number;
  stylusStates: StylusState[];
}
const SnakeGuide: React.FC<SnakeGuideProps> = ({ brushSize, stylusStates, style, ...svgProps }) => {
  const points = stylusStates.map(({ x, y }) => x + ',' + y).join(' ');
  return (
    <svg
      {...svgProps}
      style={{
        ...style,
        overflow: 'visible',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
      <polyline points={points} fill="none" stroke="white" strokeWidth={8} strokeLinecap="round" />
      {stylusStates.map(({ x, y, pressure }, index) => (
        <circle
          key={index}
          r={brushSize * pressure * 0.5}
          cx={x}
          cy={y}
          fill="none"
          stroke="white"
          strokeWidth={8}
        />
      ))}
      <polyline points={points} fill="none" stroke="red" strokeWidth={4} strokeLinecap="round" />
      {stylusStates.map(({ x, y, pressure }, index) => (
        <circle
          key={index}
          r={brushSize * pressure * 0.5}
          cx={x}
          cy={y}
          fill="none"
          stroke="red"
          strokeWidth={4}
        />
      ))}
    </svg>
  );
};

export default SnakeGuide;
