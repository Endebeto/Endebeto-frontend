import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";

interface DestinationCardProps {
  id: string;
  image: string;
  location: string;
  title: string;
  description: string;
  reviewCount: number;
}

const DestinationCard = ({
  id,
  image,
  location,
  title,
  description,
  reviewCount,
}: DestinationCardProps) => {
  return (
    <Link to={`/experiences/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl h-[400px] shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
        {/* Full-bleed image */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          decoding="async"
        />

        {/* Location pin button — top right */}
        <div className="absolute top-4 right-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
          <MapPin className="h-4 w-4 text-white" />
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-1 text-white/70 text-xs mb-2">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
          <h3 className="font-headline font-bold text-white text-xl leading-snug mb-1">
            {title}
          </h3>
          <p className="text-white/65 text-sm leading-relaxed line-clamp-2 mb-4">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-xs">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
            <div className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/25 group-hover:bg-accent group-hover:border-accent transition-colors duration-300">
              <ArrowRight className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DestinationCard;
