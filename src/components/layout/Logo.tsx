type LogoProps = {
  className?: string;
  markClassName?: string;
  word?: boolean;
  caption?: boolean;
};

/** House mark: framed Didot M with a burgundy zari diamond. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="3.2" y="3.2" width="57.6" height="57.6" fill="none" stroke="currentColor" strokeWidth="1.35" />
      <path d="M17.2 47.4V16.2h6.6L32 35.6 40.2 16.2h6.6v31.2h-4.7V27.2L33.3 47.6h-2.6L21.9 27.2v20.2h-4.7Z" />
      <rect
        x="-1.5"
        y="-1.5"
        width="3"
        height="3"
        fill="#6E2B3A"
        transform="translate(32 51.2) rotate(45)"
      />
    </svg>
  );
}

export function Logo({ className, markClassName, word = true, caption = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-[0.38em] ${className ?? ""}`}>
      <LogoMark className={`h-[0.92em] w-[0.92em] shrink-0 ${markClassName ?? ""}`} />
      {word && (
        <span className="flex flex-col">
          <span className="font-display leading-none tracking-[0.28em]">MEHR</span>
          {caption && (
            <span className="label-xs mt-1.5 tracking-[0.42em] text-muted-foreground">Lahore</span>
          )}
        </span>
      )}
    </span>
  );
}
