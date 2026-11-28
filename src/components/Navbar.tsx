import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, LogOut, LayoutDashboard, Compass, Search } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";

const Navbar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const isActive  = (path: string) => path === "/experiences"
    ? location.pathname.startsWith(path)
    : location.pathname === path;
  const { theme, toggle } = useTheme();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(location.search).get("location") ?? "");

  const isAdmin = user?.role === "admin";
  const isHost  = user?.hostStatus === "approved" || isAdmin;

  /* close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    setSearchQuery(new URLSearchParams(location.search).get("location") ?? "");
  }, [location.search]);

  /* lock body scroll when menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("location", searchQuery.trim());
    const query = params.toString();
    navigate(`/experiences${query ? `?${query}` : ""}`);
  };

  /* ── nav links change based on role ── */
  const navLinks = [
    { to: "/experiences", label: "Experiences" },
    // Only show for non-host, non-admin users (or unauthenticated)
    ...(!isAuthenticated || (!isHost && !isAdmin) ? [{ to: "/become-host", label: "Become a Host" }] : []),
    ...(isHost  && !isAdmin ? [{ to: "/host-dashboard", label: "Host Dashboard" }] : []),
    ...(isAdmin             ? [{ to: "/admin",           label: "Admin Dashboard" }] : []),
  ];

  return (
    <>
      <nav className="site-navbar fixed top-0 z-50 w-full glass-nav">
        <div className="container flex h-[76px] items-center justify-between gap-5 px-5 sm:px-8">
          {/* Logo */}
          <Link to="/" className="brand-mark" aria-label="Endebeto home">
            <span className="brand-symbol"><Compass className="h-4 w-4" /></span>
            <span className="font-headline text-lg font-extrabold tracking-tight">Endebeto</span>
          </Link>

          <form className="nav-search-pill" role="search" onSubmit={handleSearch}>
            <label htmlFor="navbar-experience-search" className="sr-only">Search by destination</label>
            <input
              id="navbar-experience-search"
              className="nav-search-pill__input"
              type="search"
              placeholder="Where to?"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button type="submit" className="nav-search-pill__icon" aria-label="Search experiences">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-7 md:flex font-headline font-semibold text-sm tracking-tight">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(to) ? "page" : undefined}
                className="nav-link"
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
              className="p-2 rounded-full text-on-surface-variant hover:bg-primary/5 transition-colors"
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
                    <UserAvatar
                      name={user.name}
                      photo={user.photo}
                      className="w-7 h-7 rounded-full bg-primary text-white text-xs"
                      initialsClassName="text-white text-xs"
                      imgClassName="w-full h-full rounded-full object-cover"
                      alt={user.name}
                    />
                    <span className="text-xs font-headline font-bold text-on-surface-variant group-hover:text-primary transition-colors max-w-[80px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                  </Link>
                ) : (
                  /* Sign In button */
                  <Link
                    to="/login"
                    className="rounded-full bg-primary px-4 py-2 text-sm font-headline font-bold text-primary-foreground shadow-sm shadow-primary/15 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-full text-on-surface-variant hover:bg-primary/5 transition-colors"
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
          className={`absolute top-16 left-0 right-0 bg-card border-b border-outline-variant/50 shadow-xl transition-transform duration-300 ${
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
                    <UserAvatar
                      name={user.name}
                      photo={user.photo}
                      className="w-8 h-8 rounded-full bg-primary text-white text-sm"
                      initialsClassName="text-white text-sm"
                      imgClassName="w-full h-full rounded-full object-cover"
                      alt={user.name}
                    />
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
