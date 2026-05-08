import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";

/* ─── helpers ─────────────────────────────────────────────── */

const GALLERY_PREVIEW_MAX = 4;

/** Cover first, then gallery URLs, deduped in order */
export function buildGalleryUrls(imageCover: string, images?: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of [imageCover, ...(images ?? [])]) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

/** Up to 4 thumbnails; when total > 4, last tile shows 4th image + "+N" (N = not shown on page) */
export function getGalleryPreviewSlots(urls: string[]) {
  if (urls.length === 0) return [];
  const len = Math.min(GALLERY_PREVIEW_MAX, urls.length);
  const slots: { imageIndex: number; src: string; moreCount: number }[] = [];
  for (let i = 0; i < len; i++) {
    const isLastSlot = i === GALLERY_PREVIEW_MAX - 1;
    const moreCount =
      isLastSlot && urls.length > GALLERY_PREVIEW_MAX ? urls.length - GALLERY_PREVIEW_MAX : 0;
    slots.push({ imageIndex: i, src: urls[i], moreCount });
  }
  return slots;
}

/* ─── GalleryMoreOverlay ──────────────────────────────────── */

export function GalleryMoreOverlay({ moreCount, compact }: { moreCount: number; compact?: boolean }) {
  if (moreCount <= 0) return null;
  return (
    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-0.5 sm:gap-1 backdrop-blur-[2px]">
      <div
        className={`flex items-center justify-center rounded-full bg-white/20 border border-white/50 text-white shadow-lg ${
          compact ? "w-9 h-9" : "w-11 h-11 sm:w-12 sm:h-12"
        }`}
      >
        <Plus className={compact ? "h-4 w-4 stroke-[2.5]" : "h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]"} />
      </div>
      <span
        className={`text-white font-headline font-extrabold leading-none ${
          compact ? "text-sm" : "text-base sm:text-lg"
        }`}
      >
        +{moreCount}
      </span>
      <span className="text-white/80 text-[8px] sm:text-[9px] uppercase tracking-widest font-bold">
        photos
      </span>
    </div>
  );
}

/* ─── GalleryLightbox ─────────────────────────────────────── */

interface GalleryLightboxProps {
  images: string[];
  index: number;
  title: string;
  onClose: () => void;
}

export function GalleryLightbox({ images, index, title, onClose }: GalleryLightboxProps) {
  const [i, setI] = useState(index);
  useEffect(() => { setI(index); }, [index]);

  const goPrev = useCallback(() => {
    setI((x) => (x > 0 ? x - 1 : images.length - 1));
  }, [images.length]);
  const goNext = useCallback(() => {
    setI((x) => (x < images.length - 1 ? x + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (images.length === 0) return null;
  const safe = Math.min(Math.max(i, 0), images.length - 1);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Photo gallery"
    >
      <button
        type="button"
        aria-label="Close gallery"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex flex-col w-full max-w-3xl max-h-[min(88vh,820px)] rounded-2xl overflow-hidden bg-zinc-950 border border-white/15 shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 shrink-0 border-b border-white/10 bg-black/40">
          <p className="text-white/90 text-xs sm:text-sm font-headline font-semibold truncate min-w-0">
            {title}
            <span className="text-white/45 font-normal ml-2 whitespace-nowrap">
              {safe + 1} / {images.length}
            </span>
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <span className="hidden sm:inline text-[10px] text-white/40 mr-1">← →</span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-0 p-2 sm:p-4 relative bg-black/50">
          {images.length > 1 && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-1 sm:left-2 z-20 p-2 sm:p-2.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          )}
          <img
            src={images[safe]}
            alt={`${title} — photo ${safe + 1}`}
            className="max-h-[min(62vh,520px)] sm:max-h-[min(68vh,560px)] w-full object-contain select-none"
          />
          {images.length > 1 && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-1 sm:right-2 z-20 p-2 sm:p-2.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
