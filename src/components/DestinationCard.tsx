import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
      <div className="market-card__image">
        <img src={image} alt={title} loading="lazy" />
        <span className="market-card__badge">{location}</span>
      </div>
      <div className="market-card__body">
        <div className="flex items-start justify-between gap-3">
          <h3>{title}</h3>
          <ArrowRight className="market-card__arrow h-4 w-4 shrink-0" />
        </div>
        <p>{description}</p>
        <div className="market-card__meta"><span>{reviewCount ? `${reviewCount} guest reviews` : "Curated by local hosts"}</span><span>Discover the story</span></div>
      </div>
    </Link>
  );
};

export default DestinationCard;
