import { useState, type ImgHTMLAttributes } from "react";

export function SiteImage({ src, alt, className, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        className={`flex items-center justify-center bg-cream text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground ${className ?? ""}`}
        aria-hidden
      />
    );
  }
  return (
    <img
      {...rest}
      src={src}
      alt={alt ?? ""}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
