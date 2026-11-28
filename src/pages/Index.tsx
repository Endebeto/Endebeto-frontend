import { Link } from "react-router-dom";
import { ArrowRight, Check, Compass, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { experiencesService, type Experience } from "@/services/experiences.service";

const destinations = [
  { name: "Lalibela", note: "Rock-hewn history", image: "/imgs/lalibela-church.jpg" },
  { name: "Addis Ababa", note: "Coffee & culture", image: "/imgs/injera-food.jpg" },
  { name: "Simien Mountains", note: "Highland trails", image: "/imgs/gelada-baboon.jpg" },
  { name: "Danakil Depression", note: "Otherworldly landscapes", image: "/imgs/danakil-depression.jpg" },
];

type MarketplaceCardProps = {
  to: string;
  image: string;
  location: string;
  title: string;
  description: string;
  rating?: number;
  reviews?: number;
  price?: number;
};

function MarketplaceCard({ to, image, location, title, description, rating, reviews, price }: MarketplaceCardProps) {
  return (
    <Link to={to} className="market-card group">
      <div className="market-card__image">
        <img src={image} alt={title} loading="lazy" />
        {rating !== undefined && (
          <span className="market-card__rating"><Star className="h-3.5 w-3.5 fill-current" /> {rating ? rating.toFixed(1) : "New"}</span>
        )}
        <span className="market-card__badge">{location}</span>
      </div>
      <div className="market-card__body">
        <div className="flex items-start justify-between gap-3">
          <h3>{title}</h3>
          <ArrowRight className="market-card__arrow h-4 w-4 shrink-0" />
        </div>
        <p className="market-card__description">{description}</p>
        <div className="market-card__meta">
          <span>{price ? <><strong>{price.toLocaleString()} ETB</strong> / guest</> : reviews ? `${reviews} guest reviews` : "Locally hosted"}</span>
          {rating !== undefined && <span>{reviews ? `${reviews} reviews` : "Authentic local experience"}</span>}
        </div>
      </div>
    </Link>
  );
}

function ExperienceSkeleton() {
  return <div className="animate-pulse"><div className="aspect-[1.08] rounded-2xl bg-surface-container" /><div className="mt-3 h-4 w-3/4 rounded bg-surface-container" /><div className="mt-2 h-3 w-1/2 rounded bg-surface-container" /></div>;
}

const Index = () => {
  const { data: featuredData, isLoading } = useQuery({
    queryKey: ["experiences-featured"],
    queryFn: () => experiencesService.getAll({ limit: 4, sort: "-ratingsAverage" }),
  });
  const featuredExperiences: Experience[] = featuredData?.data.data.data ?? [];

  const cards: MarketplaceCardProps[] = featuredExperiences.length
    ? featuredExperiences.map((experience) => ({
        to: `/experiences/${experience._id}`,
        image: experience.imageCover,
        location: experience.location,
        title: experience.title,
        description: experience.summary || experience.description,
        rating: experience.ratingsAverage,
        reviews: experience.ratingsQuantity,
        price: experience.price,
      }))
    : destinations.map((destination) => ({
        to: `/experiences?location=${encodeURIComponent(destination.name)}`,
        image: destination.image,
        location: destination.name,
        title: destination.note,
        description: `Discover ${destination.note.toLowerCase()} with a local host.`,
      }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="marketplace-page">
        <section className="marketplace-intro">
          <div className="marketplace-intro__copy">
            <p className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Local stories, thoughtfully hosted</p>
            <h1>Find your story<br /><span>in Ethiopia.</span></h1>
            <p className="marketplace-intro__description">
              Meet the people, places, and traditions that make Ethiopia unforgettable.
              Choose a journey shaped by the people who call it home.
            </p>
            <div className="marketplace-proof">
              <span><ShieldCheck className="h-4 w-4" /> Trusted local hosts</span>
              <span><Check className="h-4 w-4" /> Easy, secure booking</span>
            </div>
          </div>
          <div className="marketplace-intro__visual">
            <img className="marketplace-intro__main-image" src="/imgs/hero-1.jpg" alt="Travelers exploring an Ethiopian landscape at golden hour" />
          </div>
        </section>

        <section className="marketplace-section marketplace-section--featured">
          <div className="marketplace-section__heading">
            <div><p className="eyebrow">Picked for curious travelers</p><h2>Experiences worth the journey</h2><p>Small-group moments, guided by people who know these places best.</p></div>
            <Link to="/experiences" className="text-link">Explore all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="market-card-grid">
            {isLoading ? Array.from({ length: 4 }).map((_, index) => <ExperienceSkeleton key={index} />) : cards.slice(0, 4).map((card, index) => <MarketplaceCard key={`${card.title}-${index}`} {...card} />)}
          </div>
        </section>

        <section className="marketplace-section">
          <div className="marketplace-section__heading">
            <div><p className="eyebrow">Choose your next chapter</p><h2>Explore Ethiopia by place</h2><p>From ancient stonework to highland air, find the setting for your story.</p></div>
          </div>
          <div className="destination-grid">
            {destinations.map((destination) => (
              <Link key={destination.name} to={`/experiences?location=${encodeURIComponent(destination.name)}`} className="destination-tile">
                <img src={destination.image} alt={destination.name} loading="lazy" />
                <span className="destination-tile__overlay" />
                <span className="destination-tile__copy"><strong>{destination.name}</strong><small>{destination.note}</small></span>
                <span className="destination-tile__arrow"><ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="host-invitation">
          <div><p className="eyebrow">For the people who make Ethiopia</p><h2>Your story could be someone’s favorite journey.</h2><p>Welcome travelers into your world and earn by sharing the places and traditions you love.</p></div>
          <Link to="/become-host" className="host-invitation__button">Become a host <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
