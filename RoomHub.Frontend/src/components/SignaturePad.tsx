import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

interface Props {
  heightClass?: string;
}

/**
 * Reusable mouse/touch signature pad backed by an HTML5 canvas.
 * Exposes clear / isEmpty / toDataURL through a ref so a parent can save the PNG.
 */
const SignaturePad = forwardRef<SignaturePadHandle, Props>(({ heightClass = 'h-44' }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  // Size the backing store to the device pixel ratio so strokes stay crisp.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupContext = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1f2937';
      }
    };

    setupContext();
    window.addEventListener('resize', setupContext);
    return () => window.removeEventListener('resize', setupContext);
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = getPos(e);
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    const p = getPos(e);
    if (ctx && last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    last.current = p;
    if (empty) setEmpty(false);
  };

  const handleUp = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    setEmpty(true);
  };

  useImperativeHandle(ref, () => ({
    clear,
    isEmpty: () => empty,
    toDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
  }));

  return (
    <div>
      <div className={`relative w-full ${heightClass} bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
        />
        {empty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 text-xs font-bold select-none">
            Ký tên tại đây bằng chuột
          </div>
        )}
      </div>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
