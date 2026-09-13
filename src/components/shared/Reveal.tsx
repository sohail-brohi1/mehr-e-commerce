import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Slow, restrained entrance used across the site. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Image that unmasks upward as it enters the viewport. */
export function RevealImage({
  src,
  alt,
  className,
  imgClassName,
  width,
  height,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${imgClassName ?? ""}`}
        initial={{ scale: 1.12, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
