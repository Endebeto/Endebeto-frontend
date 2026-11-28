import { Link } from "react-router-dom";
import { ArrowRight, Check, Compass, Globe2, HeartHandshake, ShieldCheck, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const benefits = [
  { icon: Wallet, title: "Set your own terms", desc: "Choose your price, schedule, and group size. Your experience should work for you." },
  { icon: Globe2, title: "Meet curious travelers", desc: "Reach guests looking for real connections with Ethiopia and its people." },
  { icon: ShieldCheck, title: "Host with confidence", desc: "Secure booking and dedicated support help you focus on your guests." },
  { icon: HeartHandshake, title: "Keep culture close", desc: "Share what matters to you while helping your community benefit from tourism." },
];

const steps = [
  { number: "01", title: "Tell us about you", desc: "Create your host profile and share your background, languages, and local knowledge." },
  { number: "02", title: "Shape your experience", desc: "Add photos, describe the journey, and choose your price and availability." },
  { number: "03", title: "Welcome your first guest", desc: "After review, your listing goes live and travelers can book directly with you." },
];

export default function BecomeHost() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="host-marketplace">
        <section className="host-hero">
          <div className="host-hero__copy">
            <p className="eyebrow"><Compass className="h-4 w-4" /> A platform for local hosts</p>
            <h1>Share what you love about <span>Ethiopia.</span></h1>
            <p className="host-hero__description">
              Turn your knowledge, traditions, and favorite places into meaningful journeys for travelers.
              You bring the story. We’ll help you welcome the guests.
            </p>
            <div className="host-hero__actions">
              <Link to="/host/apply" className="host-primary-action">Start your application <ArrowRight className="h-4 w-4" /></Link>
              <a href="#host-steps" className="host-secondary-action">See how it works</a>
            </div>
            <div className="host-hero__assurances">
              <span><Check className="h-4 w-4" /> Free to apply</span>
              <span><Check className="h-4 w-4" /> You choose your schedule</span>
              <span><Check className="h-4 w-4" /> Local host support</span>
            </div>
          </div>
          <div className="host-hero__visual">
            <img src="/imgs/lalibela-church.jpg" alt="The rock-hewn churches of Lalibela" />
          </div>
        </section>

        <section className="host-benefits">
          <div className="host-section-heading">
            <p className="eyebrow">A better way to host</p>
            <h2>Good tools. Your point of view.</h2>
            <p>We take care of the platform so you can focus on creating a welcoming experience.</p>
          </div>
          <div className="host-benefit-grid">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="host-benefit-card">
                <span className="host-benefit-card__icon"><Icon className="h-5 w-5" /></span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="host-steps" className="host-steps">
          <div className="host-section-heading">
            <p className="eyebrow">Getting started</p>
            <h2>From idea to first booking</h2>
            <p>A clear application, with guidance at every step.</p>
          </div>
          <div className="host-step-grid">
            {steps.map((step) => (
              <article key={step.number} className="host-step-card">
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="host-final-cta">
          <div>
            <p className="eyebrow">Your experience starts here</p>
            <h2>Ready to welcome travelers?</h2>
            <p>Tell us what you would love to share. The application takes about 10 minutes.</p>
          </div>
          <Link to="/host/apply" className="host-primary-action">Apply to host <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
