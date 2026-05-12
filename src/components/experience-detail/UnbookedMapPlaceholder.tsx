import type { ReactNode } from "react";

/** Lightweight map look for guests who have not booked: one static image (no iframe/JS) or a CSS grid fallback. */
export function UnbookedMapPlaceholder({
  mapImageUrl,
  children,
}: {
  mapImageUrl: string | null;
  children: ReactNode;
}) {
  return (
    <div className="relative h-full w-full">
      {mapImageUrl ? (
        <img
          src={mapImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px] opacity-90 dark:opacity-80"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(90deg, rgba(100, 116, 139, 0.09) 0 1px, transparent 1px 20px),
              repeating-linear-gradient(0deg, rgba(100, 116, 139, 0.09) 0 1px, transparent 1px 20px),
              linear-gradient(155deg, rgb(207 250 254 / 0.9) 0%, rgb(209 250 229 / 0.85) 38%, rgb(231 229 228 / 0.95) 100%)
            `,
          }}
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-background/88 via-background/40 to-transparent dark:from-zinc-950/92 dark:via-zinc-950/45"
        aria-hidden
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6">
        {children}
      </div>
    </div>
  );
}
