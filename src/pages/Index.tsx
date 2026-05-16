import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Globe,
  Users,
  Award,
  Compass,
  Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DestinationCard from "@/components/DestinationCard";
import {
  experiencesService,
  type Experience,
} from "@/services/experiences.service";
import { normalizeApiList } from "@/lib/normalizeApiList";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ctaBg from "@/assets/cta-bg.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import TestimonialSlider from "@/components/TestimonialSlider";
import EthiopiaExploreMap from "@/components/landing/EthiopiaExploreMap";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

/* ─── static data ─────────────────────────────────────── */

const HERO_SLIDE_INTERVAL_MS = 8000;
/** Photo crossfade between stacked hero layers */
const HERO_CROSSFADE_MS = 750;
/** Hero headline/subtitle fade (opacity + slight vertical shift) */
const HERO_TEXT_TRANSITION_MS = 420;
/** Hold full fade-out before swapping copy so change isn’t a hard snap */
const HERO_TEXT_SWAP_DELAY_MS = 170;

const heroSlides = [
  {
    image: "/imgs/hero.jpg",
    title: "The Ethiopian Coffee Ceremony",
    subtitle:
      "Sit with local hosts who pour from the traditional jebena. Weave conversation into every cup, and experience warmth like never before.",
  },
  {
    image: "/imgs/hero-1.jpg",
    title: "Journey Across the Savanna",
    subtitle:
      "Follow local guides across vast golden plains. Encounter breathtaking wildlife, deep heritage, and stories carried through generations.",
  },
  {
    image: "/imgs/hero-2.png",
    title: "Deep Cultural Encounters",
    subtitle:
      "Experience the profound heritage of Ethiopia's diverse communities. Share intimate moments and learn traditions passed down for centuries.",
  },
  {
    image: "/imgs/hero-3.png",
    title: "Addis Ababa After Dark",
    subtitle:
      "From dazzling city lights to hidden garden paths, discover urban stays and experiences that pair modern energy with authentic Ethiopian hospitality.",
  },
];

const whyFeatures = [
  {
    icon: Globe,
    title: "Beyond Generic Tours",
    desc: "Every listing is a meticulously defined experience. Know the exact duration and activities, so you book exactly what resonates with you.",
  },
  {
    icon: Users,
    title: "Passionate Local Hosts",
    desc: "Learn from specialists and locals who host intimate groups, sharing their culture, craft, and stories with pure intention.",
  },
  {
    icon: Award,
    title: "Authentic Connections",
    desc: "We spotlight hidden gems: food, rituals, and breathtaking landscapes that you simply won't find in a standard brochure.",
  },
  {
    icon: Sparkles,
    title: "Seamless Journey",
    desc: "Easily check availability and message your host. Spend less time planning and more time enjoying unforgettable moments.",
  },
];

const featureImages = [
  "/imgs/why-you-choose-us-4.jpg",
  "/imgs/why-you-choose-us-3.jpg",
  "/imgs/why-you-choose-us.jpg",
  "/imgs/why-you-choose-us-2.jpg",
];

const statsData = [
  { target: 12, suffix: "+", label: "Experiences", icon: Compass },
  { target: 1, suffix: "+", label: "Countries", icon: Globe },
  { target: 20, suffix: "+", label: "Happy Travelers", icon: Users },
  { target: 4.5, suffix: "", label: "Average Rating", icon: Star },
];

const testimonials = [
  {
    quote:
      "We booked a small-group church walk on Endebeto and the listing matched the day perfectly. Our host’s stories turned a sightseeing slot into a real experience.",
    name: "Sarah J.",
    sub: "Booked in London",
    rating: 5,
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote:
      "The coffee-ceremony experience page spelled out timing, group size, and what was included. Showing up felt like visiting a friend, not ticking a tour box.",
    name: "Marc L.",
    sub: "Booked from Paris",
    rating: 5,
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote:
      "Needed a trek experience last minute. Filters and instant booking made it easy. It became the best day we’d scheduled on the whole trip.",
    name: "Elena R.",
    sub: "Booked from Rome",
    rating: 5,
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    quote:
      "Endebeto is where we found hosts offering experiences we couldn’t piece together elsewhere, with clear descriptions, fair pricing, and people who clearly care.",
    name: "Kenji T.",
    sub: "Booked from Tokyo",
    rating: 5,
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
  },
];

/* ─── count-up stat item ──────────────────────────────── */

function StatItem({
  target,
  suffix,
  label,
  icon: Icon,
  start,
}: {
  target: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
  start: boolean;
}) {
  const display = useCountUp(target, 1800, start);
  return (
    <div className="text-center">
      <Icon className="mx-auto mb-2 h-6 w-6 text-accent/70" />
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
  const { user } = useAuth();
  /** Landing CTA is for guests / non-hosts; hide for admins and approved hosts */
  const showBecomeHostCta = !(
    user?.role === "admin" || user?.hostStatus === "approved"
  );

  const [current, setCurrent] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  /** Rear layer (opaque) slide index when crossfade is enabled */
  const [baseIdx, setBaseIdx] = useState(0);
  /** Front layer slide index (fades in over base) */
  const [overlayIdx, setOverlayIdx] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);
  /** Which slide copy is shown (crossfades separately from `current` for smoother text). */
  const [heroCopyIdx, setHeroCopyIdx] = useState(0);
  const [heroCopyVisible, setHeroCopyVisible] = useState(true);
  /** Last slide index used for crossfade logic (avoids bogus fades / Strict Mode quirks). */
  const lastCrossfadeAt = useRef<number | null>(null);
  /** When true, wait for overlay `<img>` decode then start opacity fade (sync with bitmap). */
  const pendingHeroFadeRef = useRef(false);
  const heroOverlayImgRef = useRef<HTMLImageElement | null>(null);

  const beginHeroOverlayFade = () => {
    requestAnimationFrame(() => setOverlayVisible(true));
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!reduceMotion) return;
    setOverlayVisible(false);
    setBaseIdx(current);
    setOverlayIdx(current);
    lastCrossfadeAt.current = current;
    setHeroCopyIdx(current);
    setHeroCopyVisible(true);
  }, [reduceMotion, current]);

  /** Hero title/subtitle: fade out, swap index, fade in (no instant content swap). */
  useEffect(() => {
    if (reduceMotion) return;
    if (heroCopyIdx === current) return;
    setHeroCopyVisible(false);
    const swapId = window.setTimeout(() => {
      setHeroCopyIdx(current);
      requestAnimationFrame(() => setHeroCopyVisible(true));
    }, HERO_TEXT_SWAP_DELAY_MS);
    return () => window.clearTimeout(swapId);
  }, [current, reduceMotion, heroCopyIdx]);

  // featured experiences from API (fetch extra, then take top-rated with spots left for display)
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["experiences-featured"],
    queryFn: () =>
      experiencesService.getAll({ limit: 16, sort: "-ratingsAverage" }),
  });
  const rawFeatured = normalizeApiList<Experience>(featuredData?.data).items;
  const featuredExperiences = useMemo(
    () => rawFeatured.filter((e) => e.isSoldOut !== true).slice(0, 4),
    [rawFeatured],
  );

  // hero auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % heroSlides.length);
    }, HERO_SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  /** Start crossfade when `current` advances (no-op on initial paint or duplicate runs). */
  useEffect(() => {
    if (reduceMotion) return;
    if (lastCrossfadeAt.current === null) {
      lastCrossfadeAt.current = current;
      return;
    }
    if (lastCrossfadeAt.current === current) return;
    lastCrossfadeAt.current = current;
    setOverlayVisible(false);
    pendingHeroFadeRef.current = true;
    setOverlayIdx(current);
  }, [current, reduceMotion]);

  /** Cached decode: start fade same frame when bitmap is already ready. */
  useLayoutEffect(() => {
    if (reduceMotion || !pendingHeroFadeRef.current) return;
    const el = heroOverlayImgRef.current;
    if (el?.complete && el.naturalHeight > 0) {
      pendingHeroFadeRef.current = false;
      beginHeroOverlayFade();
    }
  }, [overlayIdx, reduceMotion]);

  /** Decode path: start fade when overlay slide finishes loading. */
  const onHeroOverlayImgLoad = () => {
    if (!pendingHeroFadeRef.current || reduceMotion) return;
    pendingHeroFadeRef.current = false;
    beginHeroOverlayFade();
  };

  const onHeroOverlayImgError = () => {
    if (!pendingHeroFadeRef.current || reduceMotion) return;
    pendingHeroFadeRef.current = false;
    beginHeroOverlayFade();
  };

  /** After fade-in completes, promote overlay to base and hide overlay layer. */
  useEffect(() => {
    if (reduceMotion || !overlayVisible) return;
    const id = window.setTimeout(() => {
      setBaseIdx(overlayIdx);
      setOverlayVisible(false);
    }, HERO_CROSSFADE_MS);
    return () => window.clearTimeout(id);
  }, [overlayVisible, overlayIdx, reduceMotion]);

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
  const statsReveal = useScrollReveal<HTMLDivElement>(0.3);
  const featTitle = useScrollReveal<HTMLDivElement>(0.2);
  const featCards = useScrollReveal<HTMLDivElement>(0.1);
  const testiTitle = useScrollReveal<HTMLDivElement>(0.2);
  const testiCards = useScrollReveal<HTMLDivElement>(0.1);
  const ctaReveal = useScrollReveal<HTMLDivElement>(0.2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero: dual-layer crossfade (two images max; rest preloaded via Image()) ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" aria-hidden />
        <div className="absolute inset-0 z-0">
          {reduceMotion ? (
            <img
              src={heroSlides[current].image}
              alt={heroSlides[current].title}
              className="h-full w-full object-cover object-[center_35%] lg:object-[26%_center]"
              loading="eager"
              decoding="async"
              sizes="100vw"
            />
          ) : (
            <>
              <img
                src={heroSlides[baseIdx].image}
                alt=""
                aria-hidden
                className="absolute inset-0 z-0 h-full w-full object-cover object-[center_35%] lg:object-[26%_center]"
                loading={baseIdx === 0 ? "eager" : "lazy"}
                decoding="async"
                sizes="100vw"
              />
              <img
                ref={heroOverlayImgRef}
                src={heroSlides[overlayIdx].image}
                alt=""
                aria-hidden
                className={cn(
                  "absolute inset-0 z-10 h-full w-full object-cover object-[center_35%] lg:object-[26%_center] ease-in-out motion-reduce:transition-none",
                  overlayVisible ? "opacity-100" : "opacity-0",
                )}
                style={{
                  transitionDuration: `${HERO_CROSSFADE_MS}ms`,
                  transitionProperty: "opacity",
                }}
                loading="lazy"
                decoding="async"
                sizes="100vw"
                onLoad={onHeroOverlayImgLoad}
                onError={onHeroOverlayImgError}
              />
            </>
          )}
        </div>

        {/* Dark scrim above photo stack so tint and hero copy stay aligned with the visible slide */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-black/55"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-[100svh] w-full flex-col justify-center pt-[calc(var(--header-stack)+0.75rem)] pb-8 md:min-h-[118vh] md:pb-12">
          <div className="container w-full">
            <div className="mx-auto max-w-2xl text-center text-white lg:mx-0 lg:max-w-3xl lg:text-left">
              <div
                className={cn(
                  "motion-reduce:transform-none motion-reduce:transition-none",
                  !reduceMotion &&
                    "transition-[opacity,transform] ease-out will-change-[opacity,transform]",
                  heroCopyVisible
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-1 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
                )}
                style={
                  reduceMotion
                    ? undefined
                    : { transitionDuration: `${HERO_TEXT_TRANSITION_MS}ms` }
                }
              >
                <h1 className="mb-4 font-headline text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl md:mb-5 md:text-5xl lg:text-6xl xl:text-7xl">
                  {heroSlides[heroCopyIdx].title}
                </h1>
                <p className="mb-6 max-w-xl font-body text-sm leading-relaxed text-white/90 sm:mx-auto sm:text-base md:mb-8 md:text-lg lg:mx-0">
                  {heroSlides[heroCopyIdx].subtitle}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center justify-center lg:justify-start">
                <Link to="/experiences" className="group w-full sm:w-auto">
                  <Button className="h-auto w-full gap-2 rounded-2xl bg-accent px-7 py-3.5 font-headline text-sm font-bold text-accent-foreground shadow-md shadow-black/10 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-md sm:w-auto sm:text-base md:px-9 md:py-4">
                    Browse Experiences{" "}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 md:h-5 md:w-5" />
                  </Button>
                </Link>
                {showBecomeHostCta && (
                  <Link to="/become-host" className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      className="h-auto w-full rounded-2xl border border-white/45 bg-white/15 px-8 py-3.5 font-headline text-sm font-normal text-white shadow-sm shadow-black/20 backdrop-blur-md ring-1 ring-inset ring-white/25 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/15 hover:text-white hover:ring-white/25 hover:shadow-lg active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto sm:text-base md:px-10 md:py-4"
                    >
                      Become a Host
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="relative overflow-hidden bg-surface-container-low py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 motion-reduce:hidden"
          aria-hidden
        >
          <div className="absolute -top-40 left-[12%] h-[420px] w-[420px] rounded-full bg-primary/[0.09] blur-3xl dark:bg-primary/20" />
          <div className="absolute -bottom-32 right-[-8%] h-[480px] w-[480px] rounded-full bg-accent/[0.07] blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(0,53,39,0.07),transparent_55%)] dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_-10%,rgba(74,222,128,0.06),transparent_55%)]" />
        </div>
        <p
          className="pointer-events-none absolute left-1/2 top-24 z-0 hidden -translate-x-1/2 select-none font-headline text-[clamp(4.5rem,14vw,11rem)] font-black leading-none tracking-tighter text-white/[0.04] motion-reduce:hidden dark:block"
          aria-hidden
        >
          Why here
        </p>
        <div className="absolute top-0 left-0 right-0 h-16 fade-top pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 fade-bottom pointer-events-none z-10" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-5xl">
            {/* Main column */}
            <div
              ref={whyLeft.ref}
              className={`reveal-left ${whyLeft.isVisible ? "visible" : ""}`}
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/50 bg-background/80 px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-on-secondary-container shadow-sm backdrop-blur-md md:text-sm dark:border-white/10 dark:bg-black/25 dark:text-on-secondary-container">
                <Compass className="h-3.5 w-3.5 text-accent shrink-0 md:h-4 md:w-4" />
                Why book experiences here
              </span>
              <h2 className="mb-6 font-headline text-3xl font-extrabold leading-[1.06] text-primary sm:text-4xl md:text-5xl lg:text-6xl">
                Step into stories you can actually live
              </h2>
              <p className="mb-10 max-w-xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
                Endebeto is your gateway to living culture. Our hosts design each day with care, setting honest expectations for small groups. Explore clear itineraries, find what suits you best, and secure your spot effortlessly.
              </p>
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 reveal-stagger ${whyLeft.isVisible ? "visible" : ""}`}
              >
                {whyFeatures.map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={title}
                    className="group relative min-h-[300px] overflow-hidden rounded-[1.35rem] shadow-lg ring-1 ring-black/[0.06] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/15 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:ring-white/[0.08]"
                  >
                    <img
                      src={featureImages[i]}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-[1100ms] ease-out group-hover:scale-[1.07] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 transition-opacity duration-500 group-hover:via-black/55 motion-reduce:transition-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.07)_50%,transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:opacity-0" />
                    <div className="absolute top-3 left-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/15 backdrop-blur-md icon-float">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <h3 className="mb-2 font-headline text-lg font-bold text-white md:text-xl">
                        {title}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/80 transition-[color] duration-300 line-clamp-3 group-hover:line-clamp-none group-hover:text-white/95 md:text-[0.9375rem]">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
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
            {statsData.map(({ target, suffix, label, icon }) => (
              <StatItem
                key={label}
                target={target}
                suffix={suffix}
                label={label}
                icon={icon}
                start={statsReveal.isVisible}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Let’s Explore Ethiopia — copy + Ethiopia map ── */}
      <section className="relative flex min-h-0 w-full items-center justify-center overflow-hidden bg-primary py-20 md:min-h-[min(100svh,52rem)] md:py-24">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[#042f26] dark:bg-[#061f19]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
          <img
            src="/imgs/map.svg"
            alt=""
            className="h-full w-full object-cover opacity-[0.42] motion-reduce:opacity-[0.32] dark:opacity-[0.38]"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[2] bg-primary/35 dark:bg-primary/45"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-br from-black/25 via-transparent to-black/35"
          aria-hidden
        />

        <div className="container relative z-20 w-full">
          <div
            ref={howRef.ref}
            className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14 reveal ${howRef.isVisible ? "visible" : ""}`}
          >
            <div className="flex flex-col space-y-7 lg:col-span-7 lg:space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <Sparkles
                  className="h-6 w-6 shrink-0 text-accent md:h-7 md:w-7"
                  aria-hidden
                />
                <h2 className="font-headline text-lg font-extrabold uppercase tracking-wide text-accent md:text-2xl lg:text-3xl">
                  Let&apos;s Explore Ethiopia
                </h2>
              </div>
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-white/10 px-4 py-1.5 font-headline text-xs font-semibold uppercase tracking-wider text-accent">
                <Globe className="h-4 w-4 shrink-0" aria-hidden />
                Open to travelers worldwide
              </p>
              <h3 className="font-headline text-[clamp(2.75rem,8vw,5.5rem)] font-extrabold italic leading-[0.98] tracking-tight text-white">
                The world is
                <br />
                <span className="text-accent">invited.</span>
              </h3>
              <p className="max-w-xl font-body text-base leading-relaxed text-white/90 md:text-lg">
                From every continent, curious travelers are discovering Ethiopia: ancient
                kingdoms, living traditions, and landscapes you won&apos;t find in a
                brochure.{" "}
                <span className="font-medium text-accent">
                  Plan from home, fly in with confidence,
                </span>{" "}
                and meet hosts who are proud to welcome the global community.
              </p>

              <div className="pt-2">
                <Link
                  to="/experiences"
                  className="group inline-flex h-auto items-center justify-center gap-2 rounded-full border-2 border-accent bg-transparent px-8 py-4 font-headline text-sm font-bold uppercase tracking-wider text-accent transition-all duration-200 ease-out hover:gap-3 hover:bg-accent/15 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#042f26] md:gap-2.5 md:px-10 md:text-base md:hover:gap-3.5 motion-reduce:transition-colors motion-reduce:hover:gap-2"
                >
                  Discover Ethiopia
                  <ArrowRight
                    className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1 md:h-[1.125rem] md:w-[1.125rem] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    aria-hidden
                  />
                </Link>
              </div>

            </div>

            <div className="lg:col-span-5">
              <EthiopiaExploreMap className="mx-auto max-w-lg lg:max-w-none" />
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
              Unforgettable Experiences
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              Discover top-rated adventures and cultural deep-dives, ready for you to book today.
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
                  className="h-[340px] rounded-2xl bg-surface-container animate-pulse"
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
              Hear From Our Travelers
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

      {showBecomeHostCta && (
        <>
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
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-black/70" />
                </div>
                <div className="relative z-10 mx-auto max-w-3xl">
                  <h2 className="mb-4 font-headline text-3xl font-extrabold text-primary-foreground sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
                    Have a Story to Tell?
                  </h2>
                  <p className="mb-7 text-base text-on-primary-container sm:text-lg md:mb-10 md:text-xl">
                    Share your heritage, guide travelers through your city, and
                    earn by hosting unique experiences on Endebeto.
                  </p>
                  <Link to="/become-host">
                    <Button className="h-auto rounded-2xl bg-tertiary-fixed px-8 py-4 font-headline text-base font-semibold text-on-tertiary-fixed shadow-lg shadow-black/15 transition-shadow hover:bg-tertiary-fixed hover:text-on-tertiary-fixed hover:shadow-xl md:px-10 md:py-5 md:text-lg">
                      Become a Host
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Index;
