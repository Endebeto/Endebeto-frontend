import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import { persistRefParam } from "@/lib/referral";

/* ─── static data ─────────────────────────────────────── */

const heroSlides = [
  {
    image: "/imgs/hero.jpg",
    title: "The coffee ceremony, shared the Ethiopian way",
    subtitle:
      "Sit with hosts who pour from the jebena, weave conversation into every cup, and welcome you like family.",
  },
  {
    image: "/imgs/hero-1.jpg",
    title: "Golden-hour walks with keepers of the savanna",
    subtitle:
      "Follow local guides across open grasslands in Maasai lands, with heritage, beadwork, and stories carried for generations.",
  },
  {
    image: "/imgs/hero-2.jpg",
    title: "Stand inside living tradition",
    subtitle:
      "Circle dances, colour, and community, with experiences that put you at the heart of the celebration, not on the sidelines.",
  },
  {
    image: "/imgs/hero-3.jpg",
    title: "Addis after dark. Modern Ethiopia, still unmistakably home",
    subtitle:
      "From lit towers to garden paths, discover city stays and urban experiences that pair energy with Ethiopian warmth.",
  },
];

const howItWorks = [
  {
    icon: TrendingUp,
    title: "Discover",
    desc: "Explore bookable experiences. Each listing shows schedule, group size, and what’s included before you commit.",
  },
  {
    icon: Calendar,
    title: "Book",
    desc: "Pick a date, pay securely, and get confirmation from your host so your spot is locked in.",
  },
  {
    icon: Sparkles,
    title: "Experience",
    desc: "Show up for the day you booked with culture, nature, food, or city, hosted by people who designed the experience.",
  },
];

const whyFeatures = [
  {
    icon: Globe,
    title: "Experiences, not generic tours",
    desc: "Every listing is a defined experience with clear duration, group size, and what you’ll do, so you book exactly what you want.",
  },
  {
    icon: Users,
    title: "Hosts who live the story",
    desc: "Learn from locals and specialists who host small groups and share culture, craft, and place with intention.",
  },
  {
    icon: Award,
    title: "Built for authentic moments",
    desc: "We spotlight heritage, food, ritual, and landscape experiences you can’t replicate from a brochure.",
  },
  {
    icon: Sparkles,
    title: "Simple booking, real support",
    desc: "Check availability, reserve your spot, and message your host for fewer surprises and more time enjoying the experience.",
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
      "We booked a small-group church walk on Endebeto and the listing matched the day perfectly. Our host’s stories turned a sightseeing slot into a real experience.",
    name: "Sarah J.",
    sub: "Booked in London",
    rating: 5,
  },
  {
    quote:
      "The coffee-ceremony experience page spelled out timing, group size, and what was included. Showing up felt like visiting a friend, not ticking a tour box.",
    name: "Marc L.",
    sub: "Booked from Paris",
    rating: 5,
  },
  {
    quote:
      "Needed a trek experience last minute. Filters and instant booking made it easy. It became the best day we’d scheduled on the whole trip.",
    name: "Elena R.",
    sub: "Booked from Rome",
    rating: 5,
  },
  {
    quote:
      "Endebeto is where we found hosts offering experiences we couldn’t piece together elsewhere, with clear descriptions, fair pricing, and people who clearly care.",
    name: "Kenji T.",
    sub: "Booked from Tokyo",
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
      <p className="font-headline text-4xl font-extrabold text-primary mb-2 sm:text-5xl md:text-6xl">
        {display}
        {suffix}
      </p>
      <p className="text-base text-on-surface-variant md:text-lg">{label}</p>
    </div>
  );
}

/* ─── page ─────────────────────────────────────────────── */

const Index = () => {
  const [current, setCurrent] = useState(0);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    persistRefParam(searchParams.get("ref") ?? undefined);
  }, [searchParams]);

  // featured experiences from API (fetch extra, then take top-rated with spots left for display)
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["experiences-featured"],
    queryFn: () =>
      experiencesService.getAll({ limit: 16, sort: "-ratingsAverage" }),
  });
  const rawFeatured = featuredData?.data.data.data ?? [];
  const featuredExperiences = useMemo(
    () => rawFeatured.filter((e) => e.isSoldOut !== true).slice(0, 4),
    [rawFeatured],
  );

  // hero auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  /** Warm the next slide so auto-advance doesn’t wait on the network. */
  useEffect(() => {
    const next = (current + 1) % heroSlides.length;
    const url = heroSlides[next].image;
    const im = new Image();
    im.src = url;
  }, [current]);

  // scroll reveal refs
  const howRef = useScrollReveal<HTMLDivElement>(0.1);
  const whyLeft = useScrollReveal<HTMLDivElement>(0.15);
  const whyRight = useScrollReveal<HTMLDivElement>(0.15);
  const statsReveal = useScrollReveal<HTMLDivElement>(0.3);
  const featTitle = useScrollReveal<HTMLDivElement>(0.2);
  const featCards = useScrollReveal<HTMLDivElement>(0.1);
  const testiTitle = useScrollReveal<HTMLDivElement>(0.2);
  const testiCards = useScrollReveal<HTMLDivElement>(0.1);
  const ctaReveal = useScrollReveal<HTMLDivElement>(0.2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero: single active image (avoids loading/decoding 4 full-bleed photos on every visit) ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" aria-hidden />
        <div className="absolute inset-0">
          <img
            src={heroSlides[current].image}
            alt={heroSlides[current].title}
            className="h-full w-full object-cover object-[center_30%] md:object-center transition-opacity duration-1000"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            sizes="100vw"
          />
        </div>

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

        <div className="relative z-10 flex min-h-[100svh] w-full flex-col justify-center pt-[calc(var(--header-stack)+0.75rem)] pb-8 md:min-h-[118vh] md:pb-12">
          <div className="container w-full">
            <div className="mx-auto max-w-2xl text-center text-white">
              <h1 className="mb-4 font-headline text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl md:mb-5 md:text-5xl lg:text-6xl xl:text-7xl">
                {heroSlides[current].title}
              </h1>
              <p className="mb-6 max-w-xl text-sm leading-relaxed text-white/88 sm:mx-auto sm:text-base md:mb-8 md:text-lg">
                {heroSlides[current].subtitle}
              </p>
              <div className="flex justify-center">
                <Link to="/experiences">
                  <Button className="h-auto gap-2 rounded-2xl bg-accent px-7 py-3.5 font-headline text-sm font-bold text-accent-foreground hover:bg-accent/90 sm:text-base md:px-9 md:py-4">
                    Browse Experiences{" "}
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="relative overflow-hidden bg-surface-container-low py-20 md:py-28">
        <div className="absolute top-0 left-0 right-0 h-16 fade-top pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 fade-bottom pointer-events-none z-10" />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left */}
            <div
              ref={whyLeft.ref}
              className={`reveal-left ${whyLeft.isVisible ? "visible" : ""}`}
            >
              <span className="mb-6 inline-block rounded-full bg-secondary-container px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-on-secondary-container md:text-sm">
                Why book experiences here
              </span>
              <h2 className="mb-6 font-headline text-3xl font-extrabold leading-tight text-primary sm:text-4xl md:text-5xl lg:text-6xl">
                A platform for real experiences, not just places
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-on-surface-variant md:text-xl">
                Endebeto connects you with bookable cultural, outdoor, and city
                experiences led by hosts who design their own offerings. You see
                what’s included, who it’s for, and when it runs, then reserve
                your spot in a few steps.
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
                      <h3 className="mb-2 font-headline text-lg font-bold text-primary md:text-xl">
                        {title}
                      </h3>
                      <p className="text-base leading-relaxed text-on-surface-variant">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: staggered image mosaic (hidden on mobile) */}
            <div
              ref={whyRight.ref}
              className={`hidden lg:grid grid-cols-2 gap-4 reveal-right ${whyRight.isVisible ? "visible" : ""}`}
            >
              <div className="space-y-4">
                <div className="h-48 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/imgs/why-you-choose-us-4.jpg"
                    alt="Ethiopian highlands landscape"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="h-64 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/imgs/why-you-choose-us-3.jpg"
                    alt="Ethiopian heritage and scenery"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/imgs/why-you-choose-us.jpg"
                    alt="Traditional dance and culture"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="h-48 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/imgs/why-you-choose-us-2.jpg"
                    alt="Ethiopian travel destination"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats row: count-up on scroll */}
          <div
            ref={statsReveal.ref}
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

      {/* ── How It Works ── */}
      <section className="py-20 bg-primary overflow-hidden md:py-28 lg:py-32">
        <div className="container">
          <div
            ref={howRef.ref}
            className={`reveal ${howRef.isVisible ? "visible" : ""}`}
          >
            {/* Header */}
            <div className="mb-14 flex flex-col gap-4 sm:mb-16 sm:flex-row sm:items-end sm:justify-between md:mb-20">
              <div>
                <span className="mb-3 inline-block font-headline text-xs font-bold uppercase tracking-[0.2em] text-accent md:text-sm">
                  Simple Process
                </span>
                <h2 className="font-headline text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                  How it works
                </h2>
              </div>
              <p className="max-w-md text-base leading-relaxed text-white/65 sm:text-right md:text-lg">
                Three steps from browsing to walking into your next booked
                experience.
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
                  <span className="pointer-events-none absolute right-7 top-6 select-none font-headline text-7xl font-black leading-none text-white/[0.06] md:text-8xl lg:text-9xl">
                    0{i + 1}
                  </span>

                  {/* Icon badge */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/20 md:h-16 md:w-16">
                    <Icon className="h-7 w-7 text-accent md:h-8 md:w-8" />
                  </div>

                  {/* Step label */}
                  <div>
                    <p className="mb-2 font-headline text-xs font-bold uppercase tracking-widest text-accent md:text-sm">
                      Step 0{i + 1}
                    </p>
                    <h3 className="mb-3 font-headline text-2xl font-extrabold leading-snug text-white md:text-3xl lg:text-4xl">
                      {title}
                    </h3>
                    <p className="text-base leading-relaxed text-white/65 md:text-lg">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Experiences ── */}
      <section className="py-20 bg-background md:py-28">
        <div className="container">
          <div
            ref={featTitle.ref}
            className={`mb-14 text-center reveal md:mb-16 ${featTitle.isVisible ? "visible" : ""}`}
          >
            <h2 className="mb-4 font-headline text-3xl font-extrabold text-primary sm:text-4xl md:text-5xl lg:text-[2.5rem] lg:leading-tight">
              Featured experiences
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              Hand-picked bookable experiences from our community. Browse by
              place, pace, and passion, then lock in a date that works for you.
            </p>
          </div>
          <div
            ref={featCards.ref}
            className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 reveal-stagger ${
              featCards.isVisible ? "visible" : ""
            }`}
          >
            {featuredLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] rounded-2xl bg-surface-container animate-pulse"
                />
              ))
            ) : featuredExperiences.length > 0 ? (
              featuredExperiences.map((exp) => (
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
            ) : (
              <p className="col-span-full py-8 text-center text-sm text-on-surface-variant">
                No featured experiences are available to book right now. Open
                the full catalog to see everything hosts are offering.
              </p>
            )}
          </div>
          <div
            className={`text-center mt-10 reveal ${featTitle.isVisible ? "visible" : ""}`}
            style={{ transitionDelay: "300ms" }}
          >
            <Link
              to="/experiences"
              className="inline-flex items-center gap-2 font-headline text-base font-bold text-primary transition-all hover:gap-3 md:text-lg"
            >
              Browse all experiences <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative overflow-hidden bg-surface-container-low py-20 md:py-28">
        <div className="absolute top-0 left-0 right-0 h-16 fade-top pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 fade-bottom pointer-events-none z-10" />
        <div className="container relative z-10">
          <div
            ref={testiTitle.ref}
            className={`reveal ${testiTitle.isVisible ? "visible" : ""}`}
          >
            <h2 className="mb-10 text-center font-headline text-3xl font-extrabold text-primary sm:text-4xl md:mb-16 md:text-5xl lg:text-6xl">
              What guests say about their bookings
            </h2>
          </div>
          <div
            ref={testiCards.ref}
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
      <section className="py-20 md:py-28">
        <div className="container">
          <div
            ref={ctaReveal.ref}
            className={`relative overflow-hidden rounded-3xl bg-primary-container p-8 text-center reveal sm:p-12 md:rounded-[3rem] md:p-20 lg:p-24 ${
              ctaReveal.isVisible ? "visible" : ""
            }`}
          >
            <div className="absolute inset-0">
              <img
                src={ctaBg}
                alt=""
                className="w-full h-full object-cover opacity-40"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-black/70" />
            </div>
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="mb-4 font-headline text-3xl font-extrabold text-primary-foreground sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
                Have a Story to Tell?
              </h2>
              <p className="mb-7 text-base text-on-primary-container sm:text-lg md:mb-10 md:text-xl">
                Share your heritage, guide travelers through your city, and earn
                by hosting unique experiences on Endebeto.
              </p>
              <Link to="/become-host">
                <Button className="h-auto rounded-2xl bg-tertiary-fixed px-8 py-4 font-headline text-base font-bold text-on-tertiary-fixed shadow-lg shadow-black/15 transition-all hover:scale-105 md:px-10 md:py-5 md:text-lg">
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
