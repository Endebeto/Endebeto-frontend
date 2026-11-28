import { Link } from "react-router-dom";
import { MapPin, Star, ChevronRight } from "lucide-react";

interface ExperienceCardProps {
  id: string;
  image: string;
  location: string;
  title: string;
  hostName: string;
  hostAvatar?: string;
  rating: number;
  price: number;
  currency?: string;
  badge?: string;
}

const ExperienceCard = ({
  id,
  image,
  location,
  title,
  hostName,
  hostAvatar,
  rating,
  price,
  currency = "ETB",
  badge,
}: ExperienceCardProps) => {
  return (
    <Link to={`/experiences/${id}`} className="group block rounded-[1.3rem] focus-visible:outline-none">
      <article className="experience-card overflow-hidden">
        {/* Image */}
        <div className="experience-card__image relative h-56 sm:h-60">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
          {badge && (
            <div className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-[11px] font-headline font-bold text-primary shadow-sm backdrop-blur">
              {badge}
            </div>
          )}
          <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white backdrop-blur-md" aria-hidden="true">
            <MapPin className="h-4 w-4" />
          </span>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            {location}
          </div>

          <h3 className="mb-4 line-clamp-2 font-headline text-lg font-bold leading-snug text-foreground">
            {title}
          </h3>

          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-secondary-container ring-2 ring-card">
              {hostAvatar ? (
                <img src={hostAvatar} alt={hostName} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <span className="min-w-0 truncate text-xs text-on-surface-variant">Hosted by <span className="font-semibold text-foreground">{hostName}</span></span>
            <div className="ml-auto flex shrink-0 items-center gap-1 text-sm font-bold text-on-tertiary-container">
              <Star className="h-4 w-4 fill-current" />
              {rating}
            </div>
          </div>

          <div className="flex items-end justify-between border-t border-border/80 pt-3">
            <div className="leading-tight">
              <span className="text-[11px] text-on-surface-variant">From</span>
              <p className="font-headline text-base font-extrabold text-primary">
                {price.toLocaleString()} <span className="text-xs font-semibold">{currency}</span>
              </p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary-container text-primary transition group-hover:bg-primary group-hover:text-primary-foreground" aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ExperienceCard;
