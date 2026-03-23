import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, LogOut, LayoutDashboard, Compass } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

const Navbar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const isActive  = (path: string) => location.pathname === path;
  const { theme, toggle } = useTheme();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const isHost  = user?.hostStatus === "approved" || isAdmin;

  /* close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  /* lock body scroll when menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  /* ── nav links change based on role ── */
  const navLinks = [
    { to: "/experiences", label: "Experiences" },
    // Only show for non-host, non-admin users (or unauthenticated)
    ...(!isAuthenticated || (!isHost && !isAdmin) ? [{ to: "/become-host", label: "Become a Host" }] : []),
    ...(isHost  && !isAdmin ? [{ to: "/host-dashboard", label: "Host Dashboard" }] : []),
    ...(isAdmin             ? [{ to: "/admin",           label: "Admin Dashboard" }] : []),
  ];

  const initials = user ? getInitials(user.name) : "";

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm shadow-emerald-900/5">
        <div className="container flex h-12 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-headline text-lg font-black tracking-tighter text-primary">
            Endebeto
          </Link>

          {/* Desktop nav links */}
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

          {/* Right side */}
          <div className="flex items-center gap-0.5">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-1.5 rounded-full text-on-surface-variant hover:bg-primary/5 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Desktop — auth area */}
            {!loading && (
              <div className="hidden md:flex items-center gap-2 ml-1">
                {isAuthenticated && user ? (
                  /* Avatar linked to profile */
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-primary/5 transition-colors group"
                    title={user.name}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-headline font-bold text-xs select-none">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className="text-xs font-headline font-bold text-on-surface-variant group-hover:text-primary transition-colors max-w-[80px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                  </Link>
                ) : (
                  /* Sign In button */
                  <Link
                    to="/login"
                    className="px-3 py-1.5 bg-primary text-white font-headline font-bold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-1.5 rounded-full text-on-surface-variant hover:bg-primary/5 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-outline-variant/30" />
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />

        {/* Panel */}
        <div
          className={`absolute top-12 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-outline-variant/20 shadow-xl transition-transform duration-300 ${
            menuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <nav className="flex flex-col py-2">
            {/* Main nav links */}
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

            {/* Auth section */}
            <div className="border-t border-outline-variant/20 mt-2 pt-2">
              {isAuthenticated && user ? (
                <>
                  {/* User identity */}
                  <div className="flex items-center gap-3 px-6 py-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-headline font-bold text-sm shrink-0">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-headline font-bold text-sm text-on-surface truncate">{user.name}</p>
                      <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-6 py-3 font-headline font-bold text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                  >
                    My Profile
                  </Link>

                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-3 px-6 py-3 font-headline font-bold text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors">
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  {isHost && !isAdmin && (
                    <Link to="/host-dashboard" className="flex items-center gap-3 px-6 py-3 font-headline font-bold text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors">
                      <Compass className="h-4 w-4" />
                      Host Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-6 py-3 font-headline font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center mx-4 mb-3 mt-1 px-4 py-2.5 bg-primary text-white font-headline font-bold text-sm rounded-xl transition-colors hover:opacity-90"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
