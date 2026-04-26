import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Landmark,
  UsersRound,
  Wallet,
  PenLine,
  DoorOpen,
  Quote,
  PlayCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const benefits = [
  {
    icon: Landmark,
    title: "Legacy building",
    desc: "Ensure your family's history and architectural treasures are maintained through sustainable cultural tourism.",
    offset: false,
  },
  {
    icon: UsersRound,
    title: "Global connection",
    desc: "Connect with discerning travelers who seek depth, respect, and authentic cultural exchange over standard luxury.",
    offset: true,
  },
  {
    icon: Wallet,
    title: "Financial autonomy",
    desc: "Turn your heritage into a sustainable income stream, allowing for the restoration and upkeep of your ancestral property.",
    offset: false,
  },
];

const chapters = [
  {
    kicker: "Chapter one",
    title: "The calling",
    body: "Document your story. List your space by detailing its history, its architectural soul, and the cultural experiences you can offer, from coffee ceremonies to mountain treks.",
    hint: "Create your heritage listing",
    hintIcon: PenLine,
    image: "/imgs/chapter1-host.jpg",
    imageAlt: "Ethiopian coffee roasting",
    imageOnRight: true,
  },
  {
    kicker: "Chapter two",
    title: "The gathering",
    body: "Welcome guests not as tourists, but as students of your culture. Share the warmth of Ethiopian hospitality and let your home become a bridge between worlds.",
    hint: "Welcome your first guests",
    hintIcon: DoorOpen,
    image: "/imgs/chapter2-host.jpg",
    imageAlt: "Ethiopian hospitality",
    imageOnRight: false,
  },
  {
    kicker: "Chapter three",
    title: "The legacy",
    body: "Receive secure payments that support your community and your heritage. Every stay contributes to the preservation of the culture you represent.",
    hint: "Build your sustainable legacy",
    hintIcon: Wallet,
    image: "/imgs/chapter3-host.jpg",
    imageAlt: "Traditional clothes",
    imageOnRight: true,
  },
];

/* ─── page ─────────────────────────────────────────── */
export default function BecomeHost() {
  const benefitsReveal = useScrollReveal<HTMLDivElement>(0.12);
  const journeyReveal = useScrollReveal<HTMLDivElement>(0.1);
  const earningsReveal = useScrollReveal<HTMLDivElement>(0.12);
  const quoteReveal = useScrollReveal<HTMLDivElement>(0.12);
  const finalReveal = useScrollReveal<HTMLDivElement>(0.12);

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />

      <main className="become-host-parchment pt-[var(--header-stack)]">
        {/* ── Hero: curated gallery ───────────────────── */}
        <section className="mx-auto max-w-[1280px] px-6 pb-16 pt-0 md:px-12 md:pb-24 md:pt-0 lg:px-16">
          <div className="grid grid-cols-12 items-center gap-8 lg:gap-10 pt-0">
            <div className="z-10 col-span-12 lg:col-span-5">
              <span className="mb-6 block font-headline text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                Become a curator
              </span>
              <h1 className="mb-8 font-headline text-4xl font-bold leading-[1.1] tracking-tight text-primary md:text-5xl lg:text-6xl">
                Host a story,
                <br />
                preserve a{" "}
                <span className="italic text-primary-container dark:text-primary">
                  legacy
                </span>
                .
              </h1>
              <p className="mb-12 max-w-md text-lg leading-relaxed text-muted-foreground">
                Open your doors to the world and become a guardian of
                Ethiopia&apos;s timeless traditions. Your home is more than a
                stay, it&apos;s a chapter of history waiting to be shared.
              </p>
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <Button
                  asChild
                  className="h-auto rounded-2xl bg-primary-container px-10 py-5 font-headline text-base font-semibold text-white shadow-lg transition-all hover:brightness-110"
                >
                  <Link to="/host/apply">
                    Begin your journey
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <a
                  href="#curator-journey"
                  className="group inline-flex cursor-pointer items-center gap-2 font-headline text-sm font-semibold text-primary"
                >
                  <PlayCircle className="h-6 w-6 transition-transform group-hover:translate-x-0.5" />
                  Watch the story
                </a>
              </div>
            </div>

            <div className="relative col-span-12 lg:col-span-7">
              <div className="grid grid-cols-2 items-end gap-6">
                <div className="space-y-6">
                  <div className="h-[280px] overflow-hidden rounded-2xl sm:h-[340px] lg:h-[400px] become-host-asymmetric-shadow">
                    <img
                      src="/imgs/host-hero1.jpg"
                      alt="Axum ancient city"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl bg-primary-container p-6 text-white md:p-8">
                    <h3 className="mb-2 font-headline text-3xl font-bold text-primary-foreground md:text-4xl">
                      3.2k+
                    </h3>
                    <p className="font-headline text-sm font-semibold uppercase tracking-wide text-on-primary-container">
                      Heritage hosts sharing stories across the highlands.
                    </p>
                  </div>
                </div>
                <div className="space-y-6 pt-8 lg:pt-12">
                  <div className="h-[360px] overflow-hidden rounded-2xl sm:h-[420px] lg:h-[500px] become-host-asymmetric-shadow">
                    <img
                      src="/imgs/host-hero2.jpg"
                      alt="Basket weaving in Ethiopia"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-[200px] overflow-hidden rounded-2xl sm:h-[220px] lg:h-[250px] become-host-asymmetric-shadow">
                    <img
                      src="/imgs/host-hero3.jpg"
                      alt="Harar old city"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Benefits: cultural guardianship ───────────── */}
        <section className="overflow-hidden bg-surface-container py-16 dark:bg-zinc-900/50 md:py-20">
          <div className="mx-auto max-w-[1280px] px-6 md:px-12 lg:px-16">
            <div
              ref={benefitsReveal.ref}
              className={cn(
                "mb-12 flex flex-col items-end justify-between gap-8 md:mb-14 md:flex-row",
                "reveal",
                benefitsReveal.isVisible && "visible",
              )}
            >
              <div className="max-w-2xl">
                <h2 className="mb-6 font-headline text-3xl font-bold leading-tight text-primary md:text-4xl lg:text-[2.5rem] lg:leading-[3rem]">
                  Beyond hospitality:
                  <br />
                  cultural guardianship
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Hosting on Endebeto isn&apos;t just about space. It&apos;s
                  about the preservation of the soul. We empower you to protect
                  and promote the heritage that makes your offering unique.
                </p>
              </div>
              <div className="hidden pb-2 md:block">
                <span className="font-headline text-6xl font-bold text-muted-foreground/40 lg:text-7xl">
                  01
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className={cn(
                    "group rounded-2xl border border-outline-variant/25 bg-card p-8 transition-all hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-950 md:p-10",
                    b.offset && "md:translate-y-8",
                  )}
                >
                  <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container transition-colors group-hover:bg-primary-container group-hover:text-primary-foreground dark:bg-zinc-800">
                    <b.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="mb-4 font-headline text-2xl font-semibold text-primary md:text-[1.75rem]">
                    {b.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Earning potential (existing product content) ─ */}
        <section
          ref={earningsReveal.ref}
          className={cn(
            "bg-primary py-16 md:py-20",
            "reveal",
            earningsReveal.isVisible && "visible",
          )}
        >
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 lg:grid-cols-2 md:px-12 lg:px-16">
            <div className="text-primary-foreground">
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary-foreground">
                Earning potential
              </p>
              <h2 className="mb-6 font-headline text-2xl font-bold md:text-4xl">
                Hosts earn an average of
                <br />
                <span className="text-accent">ETB 18,400 / month</span>
              </h2>
              <p className="mb-8 text-base leading-relaxed text-primary-foreground/90">
                Your earnings depend on your experience type, price, and
                availability. Hosts who list unique, high-quality experiences
                consistently outperform the average.
              </p>
              <ul className="space-y-3">
                {[
                  "You keep 85% of every booking",
                  "Instant ETB payouts to any Ethiopian bank",
                  "No monthly fees, only a small platform commission",
                  "Earn from every guest spot, not just one booking",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-primary-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Coffee ceremony host", earning: "ETB 8,000–15,000" },
                { label: "Cultural walk host", earning: "ETB 12,000–22,000" },
                { label: "Adventure trek host", earning: "ETB 20,000–50,000" },
                { label: "Cooking class host", earning: "ETB 6,000–12,000" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/25 bg-white/15 p-5 text-primary-foreground backdrop-blur-sm transition-colors hover:bg-white/20 dark:border-primary-foreground/30 dark:bg-primary-foreground/12 dark:hover:bg-primary-foreground/18"
                >
                  <TrendingUp className="mb-3 h-5 w-5 text-accent" />
                  <p className="mb-1 text-sm font-semibold leading-snug text-primary-foreground">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-accent">
                    {item.earning}
                  </p>
                  <p className="mt-1.5 text-xs text-primary-foreground/80 dark:text-primary-foreground/90">
                    per month (est.)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Curator's journey (3 chapters) ──────────── */}
        <section id="curator-journey" className="py-16 md:py-20">
          <div className="mx-auto max-w-[1280px] px-6 md:px-12 lg:px-16">
            <div
              ref={journeyReveal.ref}
              className={cn(
                "mb-16 text-center",
                "reveal",
                journeyReveal.isVisible && "visible",
              )}
            >
              <h2 className="mb-4 font-headline text-3xl font-bold text-primary md:text-4xl lg:text-[2.5rem]">
                The curator&apos;s journey
              </h2>
              <div className="mx-auto h-px w-24 bg-accent" />
            </div>

            <div className="relative space-y-16 md:space-y-24 lg:space-y-28">
              {chapters.map((ch) => (
                <div
                  key={ch.title}
                  className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20"
                >
                  <div
                    className={cn(
                      "flex-1",
                      ch.imageOnRight
                        ? "order-2 lg:order-1"
                        : "order-2 lg:order-2",
                    )}
                  >
                    <span className="mb-4 block font-headline text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                      {ch.kicker}
                    </span>
                    <h3 className="mb-6 font-headline text-4xl font-bold capitalize text-primary md:text-5xl lg:text-6xl">
                      {ch.title}
                    </h3>
                    <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                      {ch.body}
                    </p>
                    <div className="flex items-center gap-3 font-headline font-bold text-primary-container dark:text-primary">
                      <ch.hintIcon className="h-6 w-6 shrink-0" />
                      <span>{ch.hint}</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex-1",
                      ch.imageOnRight
                        ? "order-1 lg:order-2"
                        : "order-1 lg:order-1",
                    )}
                  >
                    <div className="relative h-[320px] overflow-hidden rounded-2xl sm:h-[380px] lg:h-[450px] become-host-asymmetric-shadow">
                      <img
                        src={ch.image}
                        alt={ch.imageAlt}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured curator quote ──────────────────── */}
        <section className="mx-auto max-w-5xl px-6 py-16 md:px-12 md:py-20 lg:px-16">
          <div
            ref={quoteReveal.ref}
            className={cn(
              "flex flex-col items-stretch overflow-hidden rounded-2xl bg-primary-container shadow-2xl md:flex-row",
              "reveal",
              quoteReveal.isVisible && "visible",
            )}
          >
            <div className="min-h-[280px] w-full md:min-h-[400px] md:w-1/2">
              <img
                src="/imgs/dorze.jpg"
                alt="Historic architecture in Ethiopia"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex w-full flex-col justify-center bg-primary-container p-10 text-primary-foreground md:w-1/2 md:p-16">
              <Quote
                className="mb-8 h-14 w-14 text-accent"
                strokeWidth={1.25}
              />
              <blockquote className="mb-10 font-headline text-xl font-medium italic leading-relaxed md:text-2xl">
                &ldquo;Endebeto allowed me to restore my
                great-grandfather&apos;s house in the Dorze region. Now, I
                don&apos;t just provide a bed. I provide a doorway into the 16th
                century for every guest who walks through.&rdquo;
              </blockquote>
              <div>
                <p className="mb-1 text-xl font-bold">Tsige Tokalo</p>
                <p className="font-headline text-sm font-semibold uppercase tracking-widest text-on-primary-container">
                  Master curator, Dorze
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final invitation ────────────────────────── */}
        <section className="border-t border-outline-variant/30 bg-surface-container py-16 dark:border-zinc-800 dark:bg-zinc-900/40 md:py-20">
          <div
            ref={finalReveal.ref}
            className={cn(
              "mx-auto max-w-4xl px-6 text-center md:px-12",
              "reveal",
              finalReveal.isVisible && "visible",
            )}
          >
            <h2 className="mb-8 font-headline text-4xl font-bold text-primary md:text-5xl lg:text-6xl">
              Ready to write your next chapter?
            </h2>
            <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
              Join a community of curators dedicated to the soul of Ethiopia.
              Start your hosting journey today and help us preserve the heritage
              of tomorrow.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
              <Button
                asChild
                className="h-auto rounded-2xl bg-primary-container px-12 py-5 font-headline text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:brightness-110"
              >
                <Link to="/host/apply">Apply to host</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
