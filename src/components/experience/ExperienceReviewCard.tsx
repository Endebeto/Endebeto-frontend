import { Star } from "lucide-react";
import type { Review } from "@/services/experiences.service";

/* ─── helpers ─────────────────────────────────────────────── */

export function fmtDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

export function fmtTime(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

/* ─── Stars ───────────────────────────────────────────────── */

export function Stars({ rating = 5 }: { rating?: number }) {
  const full  = Math.floor(rating);
  const items = Array.from({ length: 5 }, (_, i) => i < full);
  return (
    <div className="flex gap-0.5">
      {items.map((filled, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${filled ? "fill-current text-on-tertiary-container" : "text-outline-variant/40"}`}
        />
      ))}
    </div>
  );
}

/* ─── ReviewCard ──────────────────────────────────────────── */

const AVATAR_COLORS = [
  "bg-secondary-container text-on-secondary-container",
  "bg-primary/10 text-primary",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-accent/20 text-accent",
];

export function ReviewCard({ review, index }: { review: Review; index: number }) {
  const initials = review.user?.name
    ? review.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const date  = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";
  return (
    <div className="bg-surface-container-low dark:bg-zinc-900 p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-headline font-bold text-[10px] shrink-0 ${color}`}>
            {initials}
          </div>
          <div>
            <p className="font-headline font-bold text-xs text-on-surface dark:text-white">{review.user?.name ?? "Guest"}</p>
            {date && <p className="text-[9px] text-on-surface-variant dark:text-zinc-500">{date}</p>}
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 italic leading-relaxed">"{review.review}"</p>
    </div>
  );
}
