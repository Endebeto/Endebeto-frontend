import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Star,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Experience } from "@/services/experiences.service";

export function ExperienceBrowseCard({ exp }: { exp: Experience }) {
  const soldOut = exp.isSoldOut === true;
  const fewLeft =
    !soldOut &&
    typeof exp.spotsLeft === "number" &&
    exp.spotsLeft > 0 &&
    exp.spotsLeft <= 3;

  const badge = soldOut
    ? null
    : exp.ratingsAverage >= 4.9
      ? "Top Rated"
      : exp.ratingsAverage >= 4.7
        ? "Popular"
        : null;

  return (
    <Link to={`/experiences/${exp._id}`} className="group block cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-2.5 shadow-sm transition-all duration-500 group-hover:shadow-lg">
        <img
          src={exp.imageCover}
          alt={exp.title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-700",
            soldOut
              ? "scale-100 grayscale-[50%] brightness-[0.92]"
              : "group-hover:scale-105",
          )}
        />

        {soldOut ? (
          <div
            className="pointer-events-none absolute inset-0 bg-slate-900/15"
            aria-hidden
          />
        ) : null}

        {soldOut && (
          <div
            className="absolute right-2.5 top-2.5 z-20 flex items-center gap-1 rounded-full bg-slate-900/85 py-1 pl-1.5 pr-2.5 text-white shadow-md backdrop-blur-[2px] sm:right-3 sm:top-3"
            title="Sold out"
          >
            <Ticket className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" strokeWidth={2.5} />
            <span className="font-headline text-[8px] font-bold uppercase leading-none tracking-widest sm:text-[9px]">
              Sold out
            </span>
          </div>
        )}

        {!soldOut && (badge || fewLeft) && (
          <div className="absolute top-3 left-3">
            {badge && (
              <span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                {badge}
              </span>
            )}
            {fewLeft && (
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                {exp.spotsLeft} spot{exp.spotsLeft === 1 ? "" : "s"} left
              </span>
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          {soldOut ? (
            <button
              type="button"
              disabled
              className="w-full bg-white/60 text-gray-500 font-headline font-bold py-1.5 text-xs rounded-lg cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <span className="w-full bg-white text-primary font-headline font-bold py-1.5 text-xs rounded-lg text-center transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
              Book Now
            </span>
          )}
        </div>
      </div>

      <div className="px-0.5">
        <div className="flex justify-between items-start mb-0.5 gap-2">
          <h3 className="font-headline font-bold text-sm text-primary leading-snug line-clamp-2">
            {exp.title}
          </h3>
          <div className="flex items-center gap-0.5 font-bold shrink-0 text-xs text-on-tertiary-container">
            {exp.ratingsAverage !== null ? (
              <>
                <Star className="h-3 w-3 fill-current" />
                {exp.ratingsAverage.toFixed(1)}
              </>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wide">New</span>
            )}
          </div>
        </div>
        <p className="text-on-surface-variant text-xs mb-1.5 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          {exp.city &&
          exp.city.trim() &&
          !exp.location.toLowerCase().includes(exp.city.toLowerCase().trim())
            ? `${exp.location} · ${exp.city}`
            : exp.location}{" "}
          &bull; {exp.duration}
        </p>
        {exp.nextOccurrenceAt && (
          <p className="text-[10px] text-on-surface-variant mb-1 flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0 opacity-70" />
            {new Date(exp.nextOccurrenceAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}
        <div className="flex items-center gap-1">
          <span
            className={`text-sm font-black font-headline ${soldOut ? "text-on-surface-variant" : "text-primary"}`}
          >
            {exp.price.toLocaleString()} ETB
          </span>
          <span className="text-[11px] text-on-surface-variant">/ person</span>
        </div>
      </div>
    </Link>
  );
}
