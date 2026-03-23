import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {  User, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  /* close menu on route change */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* lock body scroll when menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = [
    { to: "/experiences", label: "Experiences" },
    { to: "/become-host", label: "Become a Host" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm shadow-emerald-900/5">
        <div className="container flex h-12 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-headline text-lg font-black tracking-tighter text-primary"
          >
            Endebeto
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex font-headline font-bold text-xs tracking-tight">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`transition-colors ${
                  isActive(to)
                    ? "text-primary border-b-2 border-accent pb-0.5"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={toggle}
              className="p-1.5 rounded-full text-on-surface-variant hover:bg-primary/5 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <Link to="/profile" className="hidden md:flex">
              <button className="p-1.5 rounded-full text-primary hover:bg-primary/5 transition-colors">
                <User className="h-4 w-4" />
              </button>
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-1.5 rounded-full text-on-surface-variant hover:bg-primary/5 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-outline-variant/30" />
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* panel */}
        <div
          className={`absolute top-12 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-outline-variant/20 shadow-xl transition-transform duration-300 ${
            menuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <nav className="flex flex-col py-2">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-6 py-3.5 font-headline font-bold text-sm transition-colors ${
                  isActive(to)
                    ? "text-primary bg-primary/5"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-outline-variant/20 mt-2 pt-2">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-6 py-3.5 font-headline font-bold text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-3 mx-4 mb-3 mt-1 px-4 py-2.5 bg-primary text-white font-headline font-bold text-sm rounded-xl transition-colors"
              >
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
