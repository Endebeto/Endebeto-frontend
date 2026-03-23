import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Calendar,
  Sparkles,
  Globe,
  Users,
  Award,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DestinationCard from "@/components/DestinationCard";
import { experiencesService } from "@/services/experiences.service";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ctaBg from "@/assets/cta-bg.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import TestimonialSlider from "@/components/TestimonialSlider";

/* ─── static data ─────────────────────────────────────── */

const heroSlides = [
  {
    image: "/imgs/hero-1.jpg",
    title: "Discover Ethiopia's Hidden Experiences",
    subtitle:
      "Journey beyond the map. Connect with local curators and experience the soul of the highlands.",
  },
  {
    image: "/imgs/lalibela-church.jpg",
    title: "Walk Among Ancient Rock-Hewn Churches",
    subtitle:
      "Step inside the 900-year-old monolithic churches of Lalibela — a living UNESCO World Heritage site.",
  },
  {
    image: "/imgs/danakil-depression.jpg",
    title: "Explore Earth's Most Alien Landscape",
    subtitle:
      "Witness sulfur springs and salt flats of the Danakil Depression — one of the hottest places on Earth.",
  },
  {
    image: "/imgs/hero-2.jpg",
    title: "Experience Authentic Ethiopian Culture",
    subtitle:
      "Immerse yourself in ancient traditions — from sacred coffee ceremonies to vibrant local markets.",
  },
  {
    image: "/imgs/ethiopian-highlands.jpg",
    title: "Journey Through the Ethiopian Highlands",
    subtitle:
      "Breathe in the crisp mountain air as you traverse lush valleys and terraced hillsides carved by time.",
  },
  {
    image: "/imgs/hero-3.jpg",
    title: "Journey Through Ancient History",
    subtitle:
      "Explore rock-hewn churches, royal castles, and breathtaking landscapes that tell Ethiopia's story.",
  },
];

const howItWorks = [
  {
    icon: TrendingUp,
    title: "Discover",
    desc: "Browse unique heritage experiences curated by local experts across Ethiopia's diverse regions.",
  },
  {
    icon: Calendar,
    title: "Book",
    desc: "Secure your spot instantly through our seamless booking system with verified local hosts.",
  },
  {
    icon: Sparkles,
    title: "Experience",
    desc: "Immerse yourself in heritage, create memories, and support local communities directly.",
  },
];

const whyFeatures = [
  {
    icon: Globe,
    title: "Discover Ethiopia",
    desc: "Explore the rich tapestry of Ethiopian cultures, from ancient traditions to modern marvels.",
  },
  {
    icon: Users,
    title: "Verified Local Hosts",
    desc: "Connect with knowledgeable hosts who bring history and culture to life for every guest.",
  },
  {
    icon: Award,
    title: "Authentic Experiences",
    desc: "Immerse yourself in genuine cultural exchanges and unforgettable personal adventures.",
  },
  {
    icon: Sparkles,
    title: "Sustainable Travel",
    desc: "Support local communities while preserving cultural heritage and natural beauty.",
  },
];

const statsData = [
  { target: 12, suffix: "+", label: "Experiences" },
  { target: 1, suffix: "+", label: "Countries" },
  { target: 20, suffix: "+", label: "Happy Travelers" },
  { target: 4.5, suffix: "", label: "Average Rating" },
];

const testimonials = [
  {
    quote:
      "Lalibela was beyond words, but seeing it through the eyes of Dawit was a transformative experience. We didn't just see ruins; we lived history.",
    name: "Sarah J.",
    sub: "Traveler from London",
    rating: 5,
  },
  {
    quote:
      "The coffee ceremony in Addis felt so personal. It wasn't a tourist trap — it was an invitation into someone's home and culture. Highly recommend.",
    name: "Marc L.",
    sub: "Photographer from Paris",
    rating: 5,
  },
  {
    quote:
      "Booking was effortless. We found a guide for the Simien trek last minute and it turned out to be the highlight of our three-month trip across Africa.",
    name: "Elena R.",
    sub: "Journalist from Rome",
    rating: 5,
  },
  {
    quote:
      "I've traveled to 40 countries and Ethiopia stood out precisely because of the connections Endebeto made possible. Genuine, warm, and unforgettable.",
    name: "Kenji T.",
    sub: "Architect from Tokyo",
    rating: 5,
  },
];

/* ─── count-up stat item ──────────────────────────────── */

function StatItem({
  target,
  suffix,
  label,
  start,
}: {
  target: number;
  suffix: string;
  label: string;
  start: boolean;
}) {
  const display = useCountUp(target, 1800, start);
  return (
    <div className="text-center">
      <p className="font-headline text-4xl font-extrabold text-primary mb-2">
        {display}
        {suffix}
      </p>
      <p className="text-on-surface-variant">{label}</p>
    </div>
  );
}

/* ─── page ─────────────────────────────────────────────── */

const Index = () => {
  const [current, setCurrent] = useState(0);

  // featured experiences from API
  const { data: featuredData } = useQuery({
    queryKey: ["experiences-featured"],
    queryFn: () => experiencesService.getAll({ limit: 4, sort: "-ratingsAverage" }),
  });
  const featuredExperiences = featuredData?.data.data.data ?? [];

  // hero auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // scroll reveal refs
  const howRef = useScrollReveal(0.1);
  const whyLeft = useScrollReveal(0.15);
  const whyRight = useScrollReveal(0.15);
  const statsReveal = useScrollReveal(0.3);
  const featTitle = useScrollReveal(0.2);
  const featCards = useScrollReveal(0.1);
  const testiTitle = useScrollReveal(0.2);
  const testiCards = useScrollReveal(0.1);
  const ctaReveal = useScrollReveal(0.2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero Slider ── */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* SVG dashed path decoration */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <path
            d="M 300,200 Q 420,360 520,410 T 730,570"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="10,10"
            fill="none"
            opacity="0.35"
          />
          <circle cx="300" cy="200" r="8" fill="#f69f0d" opacity="0.8" />
          <circle cx="730" cy="570" r="8" fill="#f69f0d" opacity="0.8" />
        </svg>

        <div className="relative h-full flex items-center z-10">
          <div className="container">
            <div className="max-w-2xl mx-auto text-white text-center">
              <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 leading-[1.05] tracking-tight">
                {heroSlides[current].title}
              </h1>
              <p className="text-sm sm:text-lg md:text-xl mb-7 md:mb-10 text-white/80 leading-relaxed">
                {heroSlides[current].subtitle}
              </p>
              <div className="flex justify-center">
                <Link to="/experiences">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-headline font-bold px-6 py-2.5 rounded-xl text-sm gap-1.5 h-auto">
                    Browse Experiences <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 md:py-28 bg-primary overflow-hidden">
        <div className="container">
          <div
            ref={howRef.ref as React.RefObject<HTMLDivElement>}
            className={`reveal ${howRef.isVisible ? "visible" : ""}`}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14 md:mb-20">
              <div>
                <span className="inline-block text-accent font-headline font-bold text-xs uppercase tracking-[0.2em] mb-3">
                  Simple Process
                </span>
                <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                  How it works
                </h2>
              </div>
              <p className="text-white/60 max-w-xs text-sm leading-relaxed sm:text-right">
                Three simple steps to start your authentic Ethiopian journey.
              </p>
            </div>

            {/* Steps */}
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 rounded-3xl overflow-hidden reveal-stagger ${
                howRef.isVisible ? "visible" : ""
              }`}
            >
              {howItWorks.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="group relative bg-primary hover:bg-white/5 transition-colors duration-300 p-8 md:p-10 flex flex-col gap-6"
                >
                  {/* Step number watermark */}
                  <span className="absolute top-6 right-7 font-headline font-black text-6xl md:text-8xl text-white/[0.06] select-none leading-none pointer-events-none">
                    0{i + 1}
                  </span>

                  {/* Icon badge */}
                  <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>

                  {/* Step label */}
                  <div>
                    <p className="text-accent font-headline font-bold text-xs uppercase tracking-widest mb-2">
                      Step 0{i + 1}
                    </p>
                    <h3 className="font-headline text-xl md:text-2xl font-extrabold text-white mb-3 leading-snug">
                      {title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  {/* Arrow connector (desktop only, not last item) */}
                  {i < howItWorks.length - 1 && (
                    <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-24 bg-surface-container-low relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 fade-top pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 fade-bottom pointer-events-none z-10" />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left */}
            <div
              ref={whyLeft.ref as React.RefObject<HTMLDivElement>}
              className={`reveal-left ${whyLeft.isVisible ? "visible" : ""}`}
            >
              <span className="inline-block px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-headline font-bold uppercase tracking-widest mb-6">
                Why Choose Us
              </span>
              <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-primary mb-6">
                Experience the Heart of Ethiopia
              </h2>
              <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
                Embark on a journey through Ethiopia's most captivating
                destinations. From the ancient rock-hewn churches of Lalibela to
                highland coffee plantations, every experience is crafted to be
                authentic and meaningful.
              </p>
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-6 reveal-stagger ${whyLeft.isVisible ? "visible" : ""}`}
              >
                {whyFeatures.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-primary mb-1">
                        {title}
                      </h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — staggered image mosaic (hidden on mobile) */}
            <div
              ref={whyRight.ref as React.RefObject<HTMLDivElement>}
              className={`hidden lg:grid grid-cols-2 gap-4 reveal-right ${whyRight.isVisible ? "visible" : ""}`}
            >
              <div className="space-y-4">
                <div className="h-48 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/imgs/gelada-baboon.jpg"
                    alt="Gelada baboon in Simien Mountains"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="h-64 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/imgs/lalibela-church.jpg"
                    alt="Rock-hewn church of Lalibela"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/imgs/injera-food.jpg"
                    alt="Traditional Ethiopian injera feast"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="h-48 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/imgs/danakil-depression.jpg"
                    alt="Danakil Depression aerial view"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats row — count-up on scroll */}
          <div
            ref={statsReveal.ref as React.RefObject<HTMLDivElement>}
            className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-outline-variant/20 pt-16 reveal-stagger ${
              statsReveal.isVisible ? "visible" : ""
            }`}
          >
            {statsData.map(({ target, suffix, label }) => (
              <StatItem
                key={label}
                target={target}
                suffix={suffix}
                label={label}
                start={statsReveal.isVisible}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Experiences ── */}
      <section className="py-24 bg-background">
        <div className="container">
          <div
            ref={featTitle.ref as React.RefObject<HTMLDivElement>}
            className={`text-center mb-16 reveal ${featTitle.isVisible ? "visible" : ""}`}
          >
            <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-primary mb-4">
              Featured African Destinations
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              Discover the breathtaking beauty and rich cultural heritage of
              Africa's most iconic locations.
            </p>
          </div>
          <div
            ref={featCards.ref as React.RefObject<HTMLDivElement>}
            className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 reveal-stagger ${
              featCards.isVisible ? "visible" : ""
            }`}
          >
            {featuredExperiences.length > 0
              ? featuredExperiences.map((exp) => (
                  <DestinationCard
                    key={exp._id}
                    id={exp._id}
                    image={exp.imageCover}
                    location={exp.location}
                    title={exp.title}
                    description={exp.summary || exp.description}
                    reviewCount={exp.ratingsQuantity}
                  />
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[400px] rounded-2xl bg-surface-container animate-pulse" />
                ))
            }
          </div>
          <div
            className={`text-center mt-10 reveal ${featTitle.isVisible ? "visible" : ""}`}
            style={{ transitionDelay: "300ms" }}
          >
            <Link
              to="/experiences"
              className="inline-flex items-center gap-2 text-primary font-headline font-bold hover:gap-3 transition-all"
            >
              Explore all destinations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-surface-container-low relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 fade-top pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 fade-bottom pointer-events-none z-10" />
        <div className="container relative z-10">
          <div
            ref={testiTitle.ref as React.RefObject<HTMLDivElement>}
            className={`reveal ${testiTitle.isVisible ? "visible" : ""}`}
          >
            <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-primary text-center mb-10 md:mb-16">
              Stories from the Road
            </h2>
          </div>
          <div
            ref={testiCards.ref as React.RefObject<HTMLDivElement>}
            className={`reveal ${testiCards.isVisible ? "visible" : ""}`}
          >
            <TestimonialSlider
              testimonials={testimonials}
              duration={32}
              sectionBg="bg-surface-container-low dark:bg-[#1f2325]"
            />
          </div>
        </div>
      </section>

      {/* ── Become a Host CTA ── */}
      <section className="py-24">
        <div className="container">
          <div
            ref={ctaReveal.ref as React.RefObject<HTMLDivElement>}
            className={`relative bg-primary-container rounded-3xl md:rounded-[3rem] overflow-hidden p-8 sm:p-12 md:p-20 text-center reveal ${
              ctaReveal.isVisible ? "visible" : ""
            }`}
          >
            <div className="absolute inset-0">
              <img
                src={ctaBg}
                alt=""
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-black/70" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-headline text-2xl sm:text-4xl md:text-5xl font-extrabold text-primary-foreground mb-4 md:mb-6">
                Have a Story to Tell?
              </h2>
              <p className="text-on-primary-container text-sm sm:text-lg mb-7 md:mb-10">
                Share your heritage, guide travelers through your city, and earn
                by hosting unique experiences on Endebeto.
              </p>
              <Link to="/become-host">
                <Button className="bg-tertiary-fixed text-on-tertiary-fixed font-headline font-bold px-6 py-2.5 rounded-xl text-sm hover:scale-105 transition-all shadow-lg shadow-black/15 h-auto">
                  Become a Host
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
