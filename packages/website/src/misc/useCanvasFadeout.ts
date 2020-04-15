import { useEffect } from 'react';

export default function useCanvasFadeout(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const id = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }, 50);
    return () => clearInterval(id);
  }, []);
}
