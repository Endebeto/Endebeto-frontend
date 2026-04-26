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
      className={`w-[min(100vw-2rem,320px)] shrink-0 rounded-2xl border p-6 shadow-sm sm:w-[300px] md:w-[320px] md:p-7 md:rounded-3xl ${cardBg}`}
    >
      <Quote className={`mb-3.5 h-6 w-6 md:mb-4 md:h-7 md:w-7 ${quoteColor}`} />

      {/* stars */}
      <div className="mb-3.5 flex gap-0.5 md:mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 md:h-4 md:w-4 ${
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "text-outline-variant/20 dark:text-zinc-600"
            }`}
          />
        ))}
      </div>

      <p className={`mb-5 text-sm leading-relaxed italic md:mb-6 md:text-base ${bodyColor}`}>
        "{t.quote}"
      </p>

      <div className="flex items-center gap-3">
        {t.initials ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-headline text-xs font-bold text-primary dark:bg-primary/30 dark:text-green-300 md:h-11 md:w-11">
            {t.initials}
          </div>
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-full bg-surface-container dark:bg-zinc-700 md:h-11 md:w-11" />
        )}
        <div>
          <p className={`font-headline text-sm font-bold md:text-base ${nameColor}`}>
            {t.name}
          </p>
          <p className={`text-xs md:text-sm ${subColor}`}>{t.sub}</p>
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
          gap: 1.25rem;
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
