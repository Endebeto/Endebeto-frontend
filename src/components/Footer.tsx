import { Link } from "react-router-dom";
import { Send, Globe, Camera, Radio } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/30 w-full">

      {/* ── Main grid ── */}
      <div className="container py-8 md:py-14">
        <div className="grid gap-6 md:gap-10 grid-cols-2 md:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-headline text-xl font-black text-primary mb-2 md:mb-4">Endebeto</h3>
            <p className="text-xs md:text-sm text-on-surface-variant max-w-xs leading-relaxed">
              Curating the finest heritage experiences across the Horn of Africa.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-headline font-bold text-primary text-xs md:text-sm mb-3 md:mb-5">Explore</h4>
            <ul className="space-y-2 md:space-y-3">
              {["All Experiences", "Lalibela", "Gondar", "Addis Ababa"].map((item) => (
                <li key={item}>
                  <Link
                    to="/experiences"
                    className="text-xs md:text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-headline font-bold text-primary text-xs md:text-sm mb-3 md:mb-5">Support</h4>
            <ul className="space-y-2 md:space-y-3">
              {["About Us", "Safety", "Terms", "Privacy", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-xs md:text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-headline font-bold text-primary text-xs md:text-sm mb-2 md:mb-4">Newsletter</h4>
            <p className="text-xs text-on-surface-variant mb-3 hidden md:block">
              Get curated heritage stories in your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 text-xs bg-white dark:bg-zinc-800 border border-outline-variant/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <button className="bg-primary text-white rounded-lg px-3 py-2 shrink-0 hover:bg-primary/90 transition-colors">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-outline-variant/30">
        <div className="container py-4 flex flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-on-surface-variant">
            © 2024 Endebeto
          </p>
          <div className="flex gap-4">
            {[Globe, Camera, Radio].map((Icon, i) => (
              <a key={i} href="#" className="text-on-surface-variant hover:text-primary transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
