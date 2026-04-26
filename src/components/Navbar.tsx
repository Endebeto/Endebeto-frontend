import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Compass,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import {
  ReviewPendingBanner,
  REVIEW_BANNER_HEIGHT_PX,
} from "@/components/ReviewPendingBanner";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  const { theme, toggle } = useTheme();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviewBannerVisible, setReviewBannerVisible] = useState(false);
  const onReviewBannerVisible = useCallback((visible: boolean) => {
    setReviewBannerVisible(visible);
  }, []);

  const isAdmin = user?.role === "admin";
  const isHost = user?.hostStatus === "approved" || isAdmin;

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

  const promoText = (
    import.meta.env.VITE_PROMO_BANNER_TEXT as string | undefined
  )?.trim();
  const promoUrl = (
    import.meta.env.VITE_PROMO_BANNER_URL as string | undefined
  )?.trim();
  const showPromo = Boolean(promoText);

  /** Main nav row height — keep in sync with outer `container` min-height. */
  const NAV_ROW_HEIGHT_PX = 52;

  useLayoutEffect(() => {
    const px =
      NAV_ROW_HEIGHT_PX +
      (showPromo ? 36 : 0) +
      (reviewBannerVisible ? REVIEW_BANNER_HEIGHT_PX : 0);
    document.documentElement.style.setProperty("--header-stack", `${px}px`);
    return () => {
      document.documentElement.style.setProperty(
        "--header-stack",
        `${NAV_ROW_HEIGHT_PX}px`,
      );
    };
  }, [showPromo, reviewBannerVisible]);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  /* ── nav links change based on role ── */
  const navLinks = [
    { to: "/experiences", label: "Experiences" },
    // Only show for non-host, non-admin users (or unauthenticated)
    ...(!isAuthenticated || (!isHost && !isAdmin)
      ? [{ to: "/become-host", label: "Become a Host" }]
      : []),
    ...(isHost && !isAdmin
      ? [{ to: "/host-dashboard", label: "Host Dashboard" }]
      : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin Dashboard" }] : []),
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50">
        <nav className="w-full bg-transparent" aria-label="Main">
          <div
            className="container flex items-center"
            style={{ minHeight: NAV_ROW_HEIGHT_PX }}
          >
            <div
              className={cn(
                "flex h-10 w-full min-w-0 items-center justify-between gap-3.5 sm:h-11 sm:gap-4",
                "rounded-2xl px-3.5 sm:px-5",
                "border border-white/50 bg-white/40 shadow-sm shadow-slate-900/5",
                "backdrop-blur-xl backdrop-saturate-150",
                "dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/20",
                "ring-1 ring-black/[0.04] dark:ring-white/5",
              )}
            >
              <Link
                to="/"
                className="font-headline shrink-0 text-xl font-black tracking-tighter text-primary drop-shadow-sm"
              >
                Endebeto
              </Link>

              <div className="hidden min-w-0 items-center gap-1 md:flex md:gap-1 lg:gap-1.5 font-headline text-[0.8125rem] sm:text-sm font-semibold tracking-tight">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "shrink-0 rounded-lg px-3 py-2 font-bold transition-colors",
                      isActive(to)
                        ? "text-primary"
                        : "text-slate-900/95 hover:bg-primary/10 hover:text-primary dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block border-b-2 border-transparent pb-0.5",
                        isActive(to) && "border-accent",
                      )}
                    >
                      {label}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={toggle}
                  className="rounded-full p-2 text-slate-700 transition-colors drop-shadow-sm hover:bg-primary/10 hover:text-primary dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-primary"
                  aria-label="Toggle dark mode"
                >
                  {theme === "dark" ? (
                    <Sun className="h-[1.125rem] w-[1.125rem]" />
                  ) : (
                    <Moon className="h-[1.125rem] w-[1.125rem]" />
                  )}
                </button>

                {!loading && (
                  <div className="hidden items-center gap-2.5 md:flex">
                    {isAuthenticated && user ? (
                      <Link
                        to="/profile"
                        className="group flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-primary/5 dark:hover:bg-white/5"
                        title={user.name}
                      >
                        <UserAvatar
                          name={user.name}
                          photo={user.photo}
                          className="h-8 w-8 rounded-full bg-primary text-white text-xs"
                          initialsClassName="text-white text-xs"
                          imgClassName="h-full w-full rounded-full object-cover"
                          alt={user.name}
                        />
                        <span className="max-w-[92px] truncate font-headline text-sm font-bold text-slate-800 transition-colors group-hover:text-primary dark:text-zinc-200 dark:group-hover:text-primary">
                          {user.name.split(" ")[0]}
                        </span>
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className="rounded-xl bg-primary px-3.5 py-2 font-headline text-sm font-bold text-white shadow-sm shadow-primary/20 transition-opacity hover:opacity-90"
                      >
                        Sign In
                      </Link>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="rounded-full p-2 text-slate-700 transition-colors drop-shadow-sm hover:bg-primary/10 hover:text-primary dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-primary md:hidden"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                  {menuOpen ? (
                    <X className="h-[1.375rem] w-[1.375rem]" />
                  ) : (
                    <Menu className="h-[1.375rem] w-[1.375rem]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
        {showPromo && (
          <div className="w-full text-center text-[10px] sm:text-[11px] font-bold leading-snug px-3 py-1.5 bg-tertiary-container text-on-tertiary-container border-b border-outline-variant/20">
            {promoUrl && /^https?:\/\//i.test(promoUrl) ? (
              <a
                href={promoUrl}
                className="underline decoration-2 underline-offset-2 hover:opacity-90"
                target="_blank"
                rel="noopener noreferrer"
              >
                {promoText}
              </a>
            ) : (
              <span>{promoText}</span>
            )}
          </div>
        )}
        <ReviewPendingBanner onVisibleChange={onReviewBannerVisible} />
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute left-0 right-0 bg-white dark:bg-zinc-900 border-b border-outline-variant/20 shadow-xl transition-transform duration-300 ${
            menuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
          style={{ top: "var(--header-stack, 52px)" }}
        >
          <nav className="flex flex-col py-2">
            {/* Main nav links */}
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-6 py-4 font-headline font-bold text-[0.9375rem] transition-colors ${
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
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-6 py-3.5 font-headline font-bold text-[0.9375rem] text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                  >
                    My Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-6 py-3.5 font-headline font-bold text-[0.9375rem] text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                    >
                      <LayoutDashboard className="h-[1.125rem] w-[1.125rem]" />
                      Admin Dashboard
                    </Link>
                  )}
                  {isHost && !isAdmin && (
                    <Link
                      to="/host-dashboard"
                      className="flex items-center gap-3 px-6 py-3.5 font-headline font-bold text-[0.9375rem] text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                    >
                      <Compass className="h-[1.125rem] w-[1.125rem]" />
                      Host Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-6 py-3.5 font-headline font-bold text-[0.9375rem] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <LogOut className="h-[1.125rem] w-[1.125rem]" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center mx-4 mb-3 mt-1 px-4 py-3 bg-primary text-white font-headline font-bold text-[0.9375rem] rounded-xl transition-colors hover:opacity-90"
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
