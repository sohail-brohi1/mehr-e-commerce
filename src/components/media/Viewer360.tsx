import { useRef, useState } from "react";
import { motion } from "motion/react";
import { RotateCw } from "lucide-react";

/**
 * Drag-to-rotate 360° viewer built on an image sequence — no WebGL payload, so
 * it never blocks first render. Falls back to the still image when a product
 * ships without frames.
 */
export function Viewer360({ frames, alt }: { frames: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const step = (dx: number) => {
    if (Math.abs(dx) < 12) return;
    setIndex((i) => (i + (dx > 0 ? 1 : -1) + frames.length) % frames.length);
    lastX.current += dx > 0 ? 12 : -12;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative select-none overflow-hidden bg-cream"
    >
      <div
        className="aspect-[4/5] cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          dragging.current = true;
          lastX.current = e.clientX;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          step(e.clientX - lastX.current);
        }}
        onPointerUp={() => (dragging.current = false)}
        onPointerLeave={() => (dragging.current = false)}
        onClick={() => setZoom((z) => !z)}
      >
        <img
          src={frames[index]}
          alt={alt}
          width={1200}
          height={1500}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out"
          style={{ transform: zoom ? "scale(1.6)" : "scale(1)" }}
          draggable={false}
        />
      </div>
      <div className="label-xs pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 text-espresso/70">
        <RotateCw className="h-3.5 w-3.5" strokeWidth={1.2} />
        Drag to rotate · tap to zoom
      </div>
    </motion.div>
  );
}
