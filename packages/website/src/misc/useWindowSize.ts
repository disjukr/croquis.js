import { useEffect, useState } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}
export default function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({ width: 0, height: 0 });
  useEffect(() => {
    const resize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    resize();
    window.addEventListener('resize', resize);
    () => window.removeEventListener('resize', resize);
  }, []);
  return windowSize;
}
