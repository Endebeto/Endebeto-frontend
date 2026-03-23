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
    <Link to={`/experiences/${id}`} className="group block">
      <div className="overflow-hidden rounded-3xl bg-surface-container-lowest hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {badge && (
            <div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary-fixed px-3 py-1 rounded-lg text-xs font-headline font-bold">
              {badge}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-3">
            <MapPin className="h-4 w-4" />
            {location}
          </div>

          <h3 className="font-headline text-xl font-bold text-primary mb-2 line-clamp-2 leading-snug">
            {title}
          </h3>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-surface-container shrink-0">
              {hostAvatar ? (
                <img src={hostAvatar} alt={hostName} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <span className="text-sm text-on-surface-variant">Host: {hostName}</span>
            <div className="ml-auto flex items-center gap-0.5 text-on-tertiary-container font-bold text-sm">
              <Star className="h-4 w-4 fill-current" />
              {rating}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
            <div>
              <span className="text-sm text-on-surface-variant">Price</span>
              <p className="font-headline font-extrabold text-primary">
                {price.toLocaleString()} {currency}
              </p>
            </div>
            <button className="bg-primary-container text-on-primary-container p-3 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExperienceCard;
