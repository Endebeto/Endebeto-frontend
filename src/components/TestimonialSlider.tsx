import { Star, Quote } from "lucide-react";

export interface Testimonial {
  quote: string;
  name: string;
  sub: string;
  initials?: string;
  rating?: number;
}

interface Props {
  testimonials: Testimonial[];
  /** scroll speed in seconds for one full cycle — default 28 */
  duration?: number;
  variant?: "light" | "dark";
  /** Tailwind bg colour token that matches the section — e.g. "bg-white" or "bg-[#f2f4f6]" */
  sectionBg?: string;
}

function TestimonialCard({
  t,
  variant = "light",
}: {
  t: Testimonial;
  variant?: "light" | "dark";
}) {
  const rating = t.rating ?? 5;

  const cardBg =
    variant === "dark"
      ? "bg-white/10 border-white/15"
      : "bg-white dark:bg-zinc-800 border-outline-variant/20 dark:border-zinc-700";

  const quoteColor =
    variant === "dark"
      ? "text-white/20"
      : "text-primary/20 dark:text-green-400/20";

  const bodyColor =
    variant === "dark"
      ? "text-white/80"
      : "text-on-surface-variant dark:text-zinc-300";

  const nameColor =
    variant === "dark" ? "text-white" : "text-on-surface dark:text-white";

  const subColor =
    variant === "dark" ? "text-white/55" : "text-on-surface-variant dark:text-zinc-400";

  return (
    <div
      className={`shrink-0 w-[270px] rounded-2xl border p-5 shadow-sm ${cardBg}`}
    >
      <Quote className={`h-5 w-5 mb-3 ${quoteColor}`} />

      {/* stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "text-outline-variant/20 dark:text-zinc-600"
            }`}
          />
        ))}
      </div>

      <p className={`text-xs leading-relaxed italic mb-4 ${bodyColor}`}>
        "{t.quote}"
      </p>

      <div className="flex items-center gap-2.5">
        {t.initials ? (
          <div className="w-8 h-8 rounded-full bg-primary/15 dark:bg-primary/30 flex items-center justify-center font-headline font-bold text-[10px] text-primary dark:text-green-300 shrink-0">
            {t.initials}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-zinc-700 shrink-0" />
        )}
        <div>
          <p className={`font-headline font-bold text-xs ${nameColor}`}>
            {t.name}
          </p>
          <p className={`text-[10px] ${subColor}`}>{t.sub}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialSlider({
  testimonials,
  duration = 28,
  variant = "light",
  sectionBg = "bg-white",
}: Props) {
  /* duplicate the list so the loop feels seamless */
  const doubled = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="overflow-hidden relative">
      {/* left fade */}
      <div className={`pointer-events-none absolute left-0 top-0 h-full w-32 z-10 ${sectionBg} [mask-image:linear-gradient(to_right,black_30%,transparent_100%)]`} />
      {/* right fade */}
      <div className={`pointer-events-none absolute right-0 top-0 h-full w-32 z-10 ${sectionBg} [mask-image:linear-gradient(to_left,black_30%,transparent_100%)]`} />
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .marquee-track {
          display: flex;
          gap: 1rem;
          width: max-content;
          animation: marquee ${duration}s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="marquee-track">
        {doubled.map((t, i) => (
          <TestimonialCard key={i} t={t} variant={variant} />
        ))}
      </div>
    </div>
  );
}
