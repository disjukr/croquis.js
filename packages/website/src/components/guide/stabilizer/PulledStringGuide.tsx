import React from 'react';
import { getGuidePathData } from 'croquis.js/lib/stabilizer/pulledString';

interface PulledStringGuideProps extends React.SVGProps<SVGSVGElement> {
  pointerX: number;
  pointerY: number;
  followerX: number;
  followerY: number;
  stringLength: number;
  power: number;
}
const PulledStringGuide: React.FC<PulledStringGuideProps> = ({
  pointerX,
  pointerY,
  followerX,
  followerY,
  stringLength,
  power,
  style,
  ...svgProps
}) => {
  const pathData = getGuidePathData(pointerX, pointerY, followerX, followerY, stringLength);
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
        r={power * 0.5}
        cx={pointerX}
        cy={pointerY}
        fill="none"
        stroke="white"
        strokeWidth={8}
      />
      <path d={pathData} fill="none" stroke="red" strokeWidth={4} strokeLinecap="round" />
      <circle
        r={power * 0.5}
        cx={pointerX}
        cy={pointerY}
        fill="none"
        stroke="red"
        strokeWidth={4}
      />
    </svg>
  );
};

export default PulledStringGuide;
