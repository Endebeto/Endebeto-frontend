import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin, Star, Clock, Users, Globe,
  AlertCircle, ArrowRight, ChevronLeft, ExternalLink, X,
  Share2, Heart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { experiences } from "@/data/experiences";
import detailHero from "@/assets/detail-hero.jpg";
import heroCoffee from "@/assets/hero-coffee.jpg";

/* ─── static reviews ────────────────────────────────────── */
const REVIEWS = [
  {
    initials: "MT",
    name: "Marcus Thorne",
    date: "February 2024",
    text: "An unforgettable afternoon. The hospitality is unparalleled. The smell of roasting coffee in the highlands is something I'll never forget.",
    color: "bg-secondary-container text-on-secondary-container",
  },
  {
    initials: "EL",
    name: "Elena L.",
    date: "January 2024",
    text: "The authentic ceremony is far better than anything you find in the city. Highly recommend this for culture lovers.",
    color: "bg-primary/10 text-primary",
  },
];

/* ─── small star row ────────────────────────────────────── */
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(count)].map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-current text-on-tertiary-container" />
      ))}
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────── */
const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const exp = experiences.find((e) => e.id === id);
  const [guests, setGuests] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!exp) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-headline text-2xl font-bold text-primary">Experience not found</h1>
          <Link to="/experiences" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to Experiences
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const fee = 120;
  const totalBase = exp.price * guests;
  const total = totalBase + fee;

  /* gallery images — reuse what we have */
  const gallery = [exp.image, detailHero, heroCoffee, exp.image];

  return (
    <div className="min-h-screen bg-background">

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT  (hidden on lg+)
      ══════════════════════════════════════════ */}
      <div className="lg:hidden">

        {/* ── Full-bleed hero ── */}
        <div className="relative h-[52vh] w-full overflow-hidden">
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />

          {/* Floating nav buttons */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 pt-12 z-20">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
            >
              <ChevronLeft className="h-5 w-5 text-on-surface" />
            </button>
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                <Share2 className="h-4 w-4 text-on-surface" />
              </button>
              <button
                onClick={() => setSaved(s => !s)}
                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
              >
                <Heart className={`h-4 w-4 transition-colors ${saved ? "fill-red-500 text-red-500" : "text-on-surface"}`} />
              </button>
            </div>
          </div>

          {/* Badge overlay on hero */}
          {exp.badge && (
            <span className="absolute bottom-16 left-4 z-10 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {exp.badge}
            </span>
          )}
        </div>

        {/* ── White content card slides up over hero ── */}
        <div className="relative -mt-8 bg-white dark:bg-zinc-950 rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)] pb-28">

          {/* handle bar */}
          <div className="w-10 h-1 bg-outline-variant/30 rounded-full mx-auto mt-3 mb-4" />

          <div className="px-5">

            {/* Title */}
            <h1 className="font-headline font-extrabold text-2xl text-on-surface dark:text-white leading-tight mb-2">
              {exp.title}
            </h1>

            {/* Location + rating */}
            <div className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                {exp.location}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <strong className="text-on-surface dark:text-white">{exp.rating}</strong>
                <span>({exp.reviewCount} reviews)</span>
              </span>
            </div>

            {/* Host row */}
            <div className="flex items-center justify-between py-4 mt-3 border-t border-b border-outline-variant/15 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-headline font-bold text-on-secondary-container text-sm shrink-0 ring-2 ring-white dark:ring-zinc-900">
                  {exp.hostName.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant dark:text-zinc-500 uppercase tracking-wider">Hosted by</p>
                  <p className="font-headline font-bold text-sm text-on-surface dark:text-white">{exp.hostName}</p>
                </div>
              </div>
              <button className="text-xs font-bold text-primary dark:text-green-400 border border-primary/30 dark:border-green-400/30 px-4 py-1.5 rounded-full hover:bg-primary/5 transition-colors">
                Message
              </button>
            </div>

            {/* Gallery strip — horizontal scroll */}
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-5 px-5 py-4">
              {gallery.map((src, i) => (
                <div key={i} className="relative h-28 w-36 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === gallery.length - 1 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-headline font-bold text-xs">+{exp.reviewCount}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 pb-5 border-b border-outline-variant/15 dark:border-zinc-800">
              {[
                { icon: Clock,  label: "DURATION",   value: exp.duration },
                { icon: Users,  label: "GROUP SIZE",  value: `Up to ${exp.maxGuests}` },
                { icon: Globe,  label: "LANGUAGES",   value: exp.languages },
                { icon: Star,   label: "RATING",      value: `${exp.rating} / 5.0` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5 py-2">
                  <Icon className="h-4 w-4 text-on-surface-variant dark:text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-500">{label}</p>
                    <p className="font-headline font-bold text-sm text-on-surface dark:text-white mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="py-5 border-b border-outline-variant/15 dark:border-zinc-800">
              <h2 className="font-headline font-extrabold text-base text-on-surface dark:text-white mb-3">About this Experience</h2>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 leading-relaxed">{exp.description}</p>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 leading-relaxed mt-2">
                Your host will share stories of their ancestors and the heritage of the region — connecting you with centuries of living tradition.
              </p>
            </div>

            {/* Location / Map */}
            <div className="py-5 border-b border-outline-variant/15 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-headline font-extrabold text-base text-on-surface dark:text-white">Where you'll meet</h2>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.location + ", Ethiopia")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-bold text-primary dark:text-green-400 flex items-center gap-1"
                >
                  Open Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-3 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary shrink-0" /> {exp.location} · Exact point shared after booking
              </p>
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-surface-container">
                <iframe
                  title={`Map of ${exp.location}`}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(exp.location + ", Ethiopia")}&output=embed&z=13`}
                />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(exp.location + ", Ethiopia")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="absolute bottom-2.5 right-2.5 bg-white dark:bg-zinc-800 text-primary text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1"
                >
                  <MapPin className="h-2.5 w-2.5" /> Directions
                </a>
              </div>
            </div>

            {/* Reviews */}
            <div className="py-5">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-headline font-extrabold text-base text-on-surface dark:text-white">Guest Reviews</h2>
                <span className="text-xs text-on-surface-variant dark:text-zinc-400 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <strong className="text-on-surface dark:text-white">{exp.rating}</strong> · {exp.reviewCount}
                </span>
              </div>
              <div className="space-y-3">
                {REVIEWS.map((r, i) => (
                  <div key={i} className="bg-surface-container-low dark:bg-zinc-900 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-headline font-bold text-[10px] ${r.color}`}>{r.initials}</div>
                        <div>
                          <p className="font-headline font-bold text-xs text-on-surface dark:text-white">{r.name}</p>
                          <p className="text-[9px] text-on-surface-variant dark:text-zinc-500">{r.date}</p>
                        </div>
                      </div>
                      <Stars />
                    </div>
                    <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 italic leading-relaxed">"{r.text}"</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-xs font-bold text-primary dark:text-green-400 flex items-center gap-1 hover:translate-x-1 transition-transform">
                Show all {exp.reviewCount} reviews <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile sticky bottom bar ── */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-outline-variant/20 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div>
            <p className="text-[10px] text-on-surface-variant dark:text-zinc-500">Price per guest</p>
            <p className="font-headline font-extrabold text-lg text-primary dark:text-green-400 leading-tight">
              {exp.price.toLocaleString()} ETB
            </p>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex-1 max-w-[180px] py-2.5 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-md shadow-primary/20"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT  (hidden on mobile)
      ══════════════════════════════════════════ */}
      <div className="hidden lg:block">
        <Navbar />

        {/* Hero */}
        <section className="relative h-[420px] w-full overflow-hidden">
          <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-full px-6 pb-8">
            <div className="max-w-7xl mx-auto">
              {exp.badge && (
                <span className="inline-block bg-tertiary-container text-on-tertiary-container px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                  {exp.badge}
                </span>
              )}
              <h1 className="text-white font-headline font-extrabold text-4xl max-w-2xl leading-snug" style={{ textShadow: "0 2px 12px rgba(0,53,39,0.3)" }}>
                {exp.title}
              </h1>
              <div className="flex items-center gap-4 mt-3 text-white/90 text-sm">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 fill-current text-on-tertiary-container" />{exp.location}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current text-on-tertiary-container" /><strong>{exp.rating}</strong><span className="opacity-70">({exp.reviewCount} reviews)</span></span>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery strip */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((src, i) => (
              <div key={i} className="h-36 rounded-xl overflow-hidden shadow-lg ring-2 ring-white relative">
                <img src={src} alt="" className="w-full h-full object-cover" />
                {i === 3 && (
                  <div className="absolute inset-0 bg-primary/50 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-white font-headline font-bold text-sm">+{exp.reviewCount} Photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-3 gap-10">
          <div className="col-span-2 space-y-8">

            {/* Host card */}
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-headline font-bold text-on-secondary-container text-sm shrink-0">{exp.hostName.charAt(0)}</div>
                <div>
                  <p className="text-on-surface-variant text-xs">Hosted by</p>
                  <p className="font-headline font-bold text-primary">{exp.hostName}</p>
                </div>
              </div>
              <button className="text-xs font-bold text-primary border border-outline-variant/40 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">Contact Host</button>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Clock, label: "Duration", value: exp.duration },
                { icon: Users, label: "Max Guests", value: `Up to ${exp.maxGuests}` },
                { icon: Globe, label: "Languages", value: exp.languages },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white dark:bg-[#2d3133] p-4 rounded-xl shadow-sm">
                  <Icon className="h-4 w-4 text-primary mb-1.5" />
                  <p className="text-xs text-on-surface-variant">{label}</p>
                  <p className="font-headline font-bold text-sm mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* About */}
            <div>
              <h2 className="font-headline font-extrabold text-lg text-primary mb-3">About this Experience</h2>
              <div className="space-y-3 text-on-surface-variant text-sm leading-relaxed">
                <p>{exp.description}</p>
                <p>While the experience unfolds, your host will share stories of their ancestors and the heritage of the region.</p>
                <p>To conclude, you'll take a short walk through the surrounding landscape, gaining an appreciation for how local culture is woven into everyday life.</p>
              </div>
            </div>

            {/* Location */}
            <div className="pt-6 border-t border-outline-variant/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline font-extrabold text-lg text-primary flex items-center gap-2"><MapPin className="h-5 w-5" />Where you'll meet</h2>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.location + ", Ethiopia")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                  Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><MapPin className="h-3.5 w-3.5 text-primary" /></div>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface">{exp.location}</p>
                  <p className="text-xs text-on-surface-variant">Exact meetup point shared after booking</p>
                </div>
              </div>
              <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm bg-surface-container">
                <iframe title={`Map of ${exp.location}`} className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(exp.location + ", Ethiopia")}&output=embed&z=13`} />
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(exp.location + ", Ethiopia")}`} target="_blank" rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white dark:bg-zinc-800 text-primary text-xs font-bold px-3 py-1.5 rounded-lg shadow-md border border-outline-variant/20">
                  <MapPin className="h-3 w-3" /> Get Directions
                </a>
              </div>
            </div>

            {/* Reviews */}
            <div className="pt-6 border-t border-outline-variant/20">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-headline font-extrabold text-lg text-primary">Guest Reviews</h2>
                <span className="flex items-center gap-1 text-sm text-on-surface-variant">
                  <Star className="h-3.5 w-3.5 fill-current text-on-tertiary-container" />
                  <strong className="text-foreground">{exp.rating}</strong> · {exp.reviewCount} reviews
                </span>
              </div>
              <div className="space-y-4">
                {REVIEWS.map((r, i) => (
                  <div key={i} className="bg-surface-container-low/50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-headline font-bold text-xs ${r.color}`}>{r.initials}</div>
                        <div>
                          <p className="font-headline font-bold text-sm text-primary">{r.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{r.date}</p>
                        </div>
                      </div>
                      <Stars />
                    </div>
                    <p className="text-on-surface-variant text-xs italic leading-relaxed">"{r.text}"</p>
                  </div>
                ))}
              </div>
              <button className="mt-5 text-sm font-bold text-primary flex items-center gap-1.5 hover:translate-x-1 transition-transform">
                Show all {exp.reviewCount} reviews <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Booking card */}
          <div className="col-span-1">
            <div className="sticky top-14 bg-white dark:bg-[#2d3133] p-5 rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-on-surface-variant">Price per guest</p>
                  <p className="font-headline font-extrabold text-2xl text-primary">{exp.price.toLocaleString()} ETB</p>
                </div>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-tight px-2.5 py-1 rounded-lg">Rare Find</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 mb-3">
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">Next Occurrence</p>
                <p className="font-headline font-bold text-sm">Sat, Feb 28, 2026</p>
                <p className="text-xs text-on-surface-variant">2:00 PM — 6:30 PM</p>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-tertiary-fixed/30 rounded-xl mb-4 text-xs font-medium text-on-tertiary-fixed-variant">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Only 3 spots left for this date!
              </div>
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-xs font-bold text-on-surface-variant">Guests</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white transition-colors">−</button>
                  <span className="font-headline font-bold w-4 text-center text-sm">{guests}</span>
                  <button onClick={() => setGuests(g => Math.min(exp.maxGuests, g + 1))} className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white transition-colors">+</button>
                </div>
              </div>
              <button className="w-full py-3 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-md shadow-primary/20 hover:scale-[0.98] transition-transform">Book Now</button>
              <p className="text-center text-[10px] text-on-surface-variant mt-2">You won't be charged yet</p>
              <div className="mt-4 pt-4 border-t border-outline-variant/20 space-y-2.5 text-xs">
                <div className="flex justify-between text-on-surface-variant"><span>{exp.price.toLocaleString()} ETB × {guests} guest{guests > 1 ? "s" : ""}</span><span>{totalBase.toLocaleString()} ETB</span></div>
                <div className="flex justify-between text-on-surface-variant"><span>Heritage preservation fee</span><span>{fee} ETB</span></div>
                <div className="flex justify-between font-headline font-bold text-primary text-sm pt-1.5 border-t border-outline-variant/20"><span>Total</span><span>{total.toLocaleString()} ETB</span></div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* ── Mobile booking bottom sheet ── */}
      {showBookingModal && (
        <div className="lg:hidden fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
          <div className="relative w-full bg-white dark:bg-zinc-900 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="w-10 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5" />
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-on-surface-variant">Price per guest</p>
                <p className="font-headline font-extrabold text-2xl text-primary">{exp.price.toLocaleString()} ETB</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-1.5 rounded-full hover:bg-surface-container">
                <X className="h-4 w-4 text-on-surface-variant" />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 mb-3">
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">Next Occurrence</p>
              <p className="font-headline font-bold text-sm">Sat, Feb 28, 2026</p>
              <p className="text-xs text-on-surface-variant">2:00 PM — 6:30 PM</p>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-tertiary-fixed/30 rounded-xl mb-4 text-xs font-medium text-on-tertiary-fixed-variant">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Only 3 spots left for this date!
            </div>
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-xs font-bold text-on-surface-variant">Guests</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white transition-colors">−</button>
                <span className="font-headline font-bold w-4 text-center text-sm">{guests}</span>
                <button onClick={() => setGuests(g => Math.min(exp.maxGuests, g + 1))} className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold hover:bg-primary hover:text-white transition-colors">+</button>
              </div>
            </div>
            <div className="mb-4 pt-3 border-t border-outline-variant/20 space-y-2 text-xs">
              <div className="flex justify-between text-on-surface-variant"><span>{exp.price.toLocaleString()} ETB × {guests}</span><span>{(exp.price * guests).toLocaleString()} ETB</span></div>
              <div className="flex justify-between text-on-surface-variant"><span>Heritage preservation fee</span><span>120 ETB</span></div>
              <div className="flex justify-between font-headline font-bold text-primary text-sm pt-1.5 border-t border-outline-variant/20"><span>Total</span><span>{(exp.price * guests + 120).toLocaleString()} ETB</span></div>
            </div>
            <button className="w-full py-3 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-md">Confirm Booking</button>
            <p className="text-center text-[10px] text-on-surface-variant mt-2">You won't be charged yet</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceDetail;
