import { Link } from "react-router-dom";
import {
  ArrowRight, Star, TrendingUp, Shield, Users, Clock, Globe,
  CheckCircle2, Camera, Banknote, HeartHandshake,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import TestimonialSlider from "@/components/TestimonialSlider";

/* ─── static data ─────────────────────────────────── */
const benefits = [
  {
    icon: Banknote,
    title: "Earn on Your Terms",
    desc: "Set your own price, schedule, and capacity. Our transparent payout system deposits earnings straight to your bank — no hidden fees.",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  {
    icon: Globe,
    title: "Reach Global Travelers",
    desc: "Your experience gets listed in front of thousands of curated travelers actively seeking authentic Ethiopian culture and adventures.",
    color: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  },
  {
    icon: Shield,
    title: "Host with Confidence",
    desc: "Every booking is backed by our booking protection policy, secure payments via Chapa, and dedicated host support.",
    color: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
  {
    icon: HeartHandshake,
    title: "Join a Community",
    desc: "Connect with fellow hosts, share insights, and get tips from Endebeto's growing host community across Ethiopia.",
    color: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    desc: "Tell us about yourself — your background, languages, and the kind of experiences you love sharing.",
  },
  {
    number: "02",
    title: "Describe Your Experience",
    desc: "Add photos, write a compelling description, set your price and availability. We'll guide you every step.",
  },
  {
    number: "03",
    title: "Get Approved & Earn",
    desc: "Our team reviews your listing for quality and authenticity. Once approved, start welcoming guests and earning.",
  },
];

const testimonials = [
  {
    name: "Selamawit T.",
    sub: "Lalibela, Amhara",
    quote: "I started hosting coffee ceremonies two years ago. Now it's my main income — and I've met incredible people from all over the world.",
    initials: "ST",
    rating: 5,
  },
  {
    name: "Dawit M.",
    sub: "Addis Ababa",
    quote: "Endebeto gave me the platform to turn my passion for Ethiopian history into a real business. The application process was smooth and the support team is always there.",
    initials: "DM",
    rating: 5,
  },
  {
    name: "Tigist H.",
    sub: "Gondar, Amhara",
    quote: "What I love most is the freedom. I set my schedule, my prices, and I get to share the culture I'm proud of with visitors who truly appreciate it.",
    initials: "TH",
    rating: 5,
  },
  {
    name: "Biruk A.",
    sub: "Awash, Afar",
    quote: "Within three months of joining Endebeto I was fully booked every weekend. The platform handles payments so I can focus entirely on my guests.",
    initials: "BA",
    rating: 5,
  },
];

/* ─── component ───────────────────────────────────── */
export default function BecomeHost() {
  const revealRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-surface dark:bg-zinc-950 font-body">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/imgs/lalibela-church.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/50 to-black/80" />
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]" />

        {/* decorative circles */}
        <div className="absolute top-20 right-20 w-80 h-80 rounded-full opacity-10 border-[40px] border-white hidden lg:block" />
        <div className="absolute bottom-20 right-40 w-48 h-48 rounded-full opacity-10 border-[24px] border-white hidden lg:block" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32 grid lg:grid-cols-2 gap-12 items-center">
          {/* left copy */}
          <div>
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              Become an Endebeto Host
            </span>
            <h1 className="font-headline font-extrabold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Share Ethiopia's Magic.<br />
              <span className="text-amber-300">Earn Doing It.</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-lg">
              Turn your local knowledge, culture, and passion into a thriving experience business. Join hundreds of Ethiopian hosts already welcoming guests from around the world.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/host/apply"
                className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Apply Now — It's Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 bg-white/15 text-white font-medium px-8 py-3.5 rounded-xl backdrop-blur-sm hover:bg-white/25 transition-all duration-200"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* right stats card */}
          <div className="hidden lg:flex justify-end">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-80 shadow-2xl">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-6">Host Highlights</p>
              {[
                { label: "Average monthly earnings", value: "ETB 18,400" },
                { label: "Active hosts on platform", value: "340+" },
                { label: "Countries guests travel from", value: "52" },
                { label: "Average host rating", value: "4.8 ★" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                  <span className="text-white/70 text-sm">{item.label}</span>
                  <span className="text-white font-bold text-sm">{item.value}</span>
                </div>
              ))}
              <Link
                to="/host/apply"
                className="mt-6 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-primary font-bold text-sm px-6 py-3 rounded-xl transition-colors w-full"
              >
                Start Your Application
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────── */}
      <section ref={revealRef} className="py-24 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal-item">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Why Host With Us</p>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface dark:text-white">
              Everything you need to succeed
            </h2>
            <p className="text-on-surface-variant dark:text-zinc-400 mt-3 max-w-xl mx-auto">
              We've built the tools, trust, and community so you can focus on what matters — creating unforgettable experiences.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className="reveal-item bg-surface dark:bg-zinc-800 rounded-2xl p-6 border border-outline-variant/30 dark:border-zinc-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${b.color}`}>
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-headline font-bold text-base text-on-surface dark:text-white mb-2">{b.title}</h3>
                <p className="text-on-surface-variant dark:text-zinc-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section id="how-it-works" ref={revealRef} className="py-24 bg-surface dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 reveal-item">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">The Process</p>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface dark:text-white">
              Up and running in 3 steps
            </h2>
          </div>

          <div className="relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-0.5 bg-outline-variant/40 dark:bg-zinc-700" />

            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((s, i) => (
                <div
                  key={s.number}
                  className="reveal-item text-center relative"
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="w-20 h-20 rounded-full bg-primary text-white font-headline font-extrabold text-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                    {s.number}
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-surface dark:text-white mb-3">{s.title}</h3>
                  <p className="text-on-surface-variant dark:text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Earnings Highlight ────────────────────────── */}
      <section ref={revealRef} className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal-item">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Earning Potential</p>
            <h2 className="font-headline font-extrabold text-2xl md:text-4xl text-white mb-6">
              Hosts earn an average of<br />
              <span className="text-amber-300">ETB 18,400 / month</span>
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-8">
              Your earnings depend on your experience type, price, and availability. Hosts who list unique, high-quality experiences consistently outperform the average.
            </p>
            <ul className="space-y-3">
              {[
                "You keep 85% of every booking",
                "Instant ETB payouts to any Ethiopian bank",
                "No monthly fees — only a small platform commission",
                "Earn from every guest spot, not just one booking",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/85 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal-item grid grid-cols-2 gap-4">
            {[
              { label: "Coffee Ceremony Host", earning: "ETB 8,000–15,000" },
              { label: "Cultural Walk Host", earning: "ETB 12,000–22,000" },
              { label: "Adventure Trek Host", earning: "ETB 20,000–50,000" },
              { label: "Cooking Class Host", earning: "ETB 6,000–12,000" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/15 transition-colors"
              >
                <TrendingUp className="h-5 w-5 text-amber-300 mb-3" />
                <p className="text-white text-sm font-semibold mb-1">{item.label}</p>
                <p className="text-amber-300 font-bold text-xs">{item.earning}</p>
                <p className="text-white/50 text-[10px] mt-1">per month (est.)</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────── */}
      <section ref={revealRef} className="py-24 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 reveal-item">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Host Stories</p>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface dark:text-white">
              Hear from our hosts
            </h2>
          </div>
          <TestimonialSlider testimonials={testimonials} duration={28} sectionBg="bg-white dark:bg-zinc-900" />
        </div>
      </section>

      {/* ── Requirements ──────────────────────────────── */}
      <section ref={revealRef} className="py-20 bg-surface dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="reveal-item">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Requirements</p>
            <h2 className="font-headline font-extrabold text-3xl text-on-surface dark:text-white mb-4">
              What you'll need to apply
            </h2>
            <p className="text-on-surface-variant dark:text-zinc-400 text-base mb-10">
              Our verification process ensures quality and safety for both hosts and guests.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Valid Ethiopian National ID" },
              { icon: Camera, label: "Photos of your hosting space" },
              { icon: Clock, label: "Ability to host consistently" },
              { icon: Globe, label: "Basic English communication" },
            ].map((r, i) => (
              <div
                key={r.label}
                className="reveal-item bg-white dark:bg-zinc-800 rounded-xl p-5 text-center border border-outline-variant/30 dark:border-zinc-700"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                  <r.icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-on-surface dark:text-white">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────── */}
      <section className="py-24 bg-primary/5 dark:bg-zinc-900 border-t border-outline-variant/20 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface dark:text-white mb-4">
            Ready to start your hosting journey?
          </h2>
          <p className="text-on-surface-variant dark:text-zinc-400 text-base mb-8">
            Join Ethiopia's fastest-growing experience platform. Application takes about 10 minutes.
          </p>
          <Link
            to="/host/apply"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-10 py-4 rounded-xl shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-base"
          >
            Apply to Become a Host
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-on-surface-variant dark:text-zinc-500 text-xs mt-4">
            Free to apply · No credit card required · Reviewed within 3–5 business days
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
