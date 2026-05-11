import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Send, Globe, Camera, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const FOOTER_NAV_LINK_CLASS =
  "text-xs md:text-sm text-on-surface-variant hover:text-primary transition-colors";

function FooterNavLink({
  to,
  href,
  children,
}: {
  to?: string;
  href?: string;
  children: ReactNode;
}) {
  if (href) {
    return (
      <a href={href} className={FOOTER_NAV_LINK_CLASS}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to ?? "/"} className={FOOTER_NAV_LINK_CLASS}>
      {children}
    </Link>
  );
}

const EXPLORE_LINKS: { label: string; to: string }[] = [
  { label: "All Experiences", to: "/experiences" },
  {
    label: "Lalibela",
    to: `/experiences?q=${encodeURIComponent("Lalibela")}`,
  },
  {
    label: "Gondar",
    to: `/experiences?q=${encodeURIComponent("Gondar")}`,
  },
  {
    label: "Addis Ababa",
    to: `/experiences?q=${encodeURIComponent("Addis Ababa")}`,
  },
];

const SUPPORT_LINKS: { label: string; to?: string; href?: string }[] = [
  { label: "About Us", to: "/about" },
  { label: "Safety", to: "/safety" },
  { label: "Terms", to: "/terms" },
  { label: "Privacy", to: "/privacy" },
  { label: "Contact", href: "mailto:support@endebeto.com" },
];

const Footer = () => {
  const websiteUrl =
    typeof import.meta.env.VITE_SOCIAL_WEBSITE === "string"
      ? import.meta.env.VITE_SOCIAL_WEBSITE.trim()
      : "";
  const instagramUrl =
    typeof import.meta.env.VITE_SOCIAL_INSTAGRAM === "string"
      ? import.meta.env.VITE_SOCIAL_INSTAGRAM.trim()
      : "";
  const linkedinUrl =
    typeof import.meta.env.VITE_SOCIAL_LINKEDIN === "string"
      ? import.meta.env.VITE_SOCIAL_LINKEDIN.trim()
      : "";

  const socialItems: { Icon: LucideIcon; href: string; label: string }[] = [];
  if (websiteUrl) {
    socialItems.push({ Icon: Globe, href: websiteUrl, label: "Website" });
  }
  if (instagramUrl) {
    socialItems.push({
      Icon: Camera,
      href: instagramUrl,
      label: "Instagram",
    });
  }
  if (linkedinUrl) {
    socialItems.push({
      Icon: Radio,
      href: linkedinUrl,
      label: "LinkedIn",
    });
  }

  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/30 w-full">

      {/* ── Main grid ── */}
      <div className="container py-8 md:py-14">
        <div className="grid gap-6 md:gap-10 grid-cols-2 md:grid-cols-4">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-2 md:mb-4">
              <BrandLogo imgClassName="h-9 max-w-[10.5rem] sm:h-10 sm:max-w-[12rem]" />
            </div>
            <p className="text-xs md:text-sm text-on-surface-variant max-w-xs leading-relaxed">
              Curating the finest heritage experiences across the Horn of Africa.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-headline font-bold text-primary text-xs md:text-sm mb-3 md:mb-5">Explore</h4>
            <ul className="space-y-2 md:space-y-3">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.label}>
                  <FooterNavLink to={item.to}>{item.label}</FooterNavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-headline font-bold text-primary text-xs md:text-sm mb-3 md:mb-5">Support</h4>
            <ul className="space-y-2 md:space-y-3">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.label}>
                  <FooterNavLink to={item.to} href={item.href}>
                    {item.label}
                  </FooterNavLink>
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
              <button
                type="button"
                className="bg-primary text-white rounded-lg px-3 py-2 shrink-0 hover:bg-primary/90 transition-colors"
              >
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
            © {year} Endebeto
          </p>
          {socialItems.length > 0 ? (
            <div className="flex gap-4">
              {socialItems.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
