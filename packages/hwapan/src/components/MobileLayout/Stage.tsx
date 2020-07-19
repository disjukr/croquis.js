import React, { useRef, useEffect } from 'react';
import { useHwapan } from '../../hwapan';

const Stage: React.FC = () => {
  const layers = useHwapan(hwapan => hwapan.layers);
  return <div className='stage'>
    {layers.map(layer => <Layer canvas={layer.canvas}/>)}
    <style jsx global>{`
      .stage {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
    `}</style>
  </div>;
};

export default Stage;

interface LayerProps {
  canvas: HTMLCanvasElement;
}
const Layer: React.FC<LayerProps> = ({canvas}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(canvas);
  }, [canvas]);
  return <div ref={containerRef}/>;
};
