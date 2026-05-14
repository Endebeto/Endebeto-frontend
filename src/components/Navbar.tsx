import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  LogIn,
  LayoutDashboard,
  Compass,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { ReviewPendingBanner } from "@/components/ReviewPendingBanner";
import { REVIEW_BANNER_HEIGHT_PX } from "@/components/reviewPendingBannerConstants";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  const { theme, toggle } = useTheme();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviewBannerVisible, setReviewBannerVisible] = useState(false);
  const isLanding = location.pathname === "/";
  const [navFilled, setNavFilled] = useState(!isLanding);
  const onReviewBannerVisible = useCallback((visible: boolean) => {
    setReviewBannerVisible(visible);
  }, []);

  // Role must follow server-confirmed auth only — cached `user` from localStorage
  // must not drive host/admin nav links until GET /users/me succeeds (§3.5).
  const isAdmin = isAuthenticated && user?.role === "admin";
  const isHost =
    isAuthenticated &&
    (user?.hostStatus === "approved" || user?.role === "admin");

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
  /** Show nav background after this many px of vertical scroll */
  const SCROLL_Y_FOR_NAV_BG = 48;

  useEffect(() => {
    if (!isLanding) {
      setNavFilled(true);
      return;
    }
    const onScroll = () => {
      setNavFilled(window.scrollY >= SCROLL_Y_FOR_NAV_BG);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

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
    { to: "/", label: "Home" },
    { to: "/experiences", label: "Experiences" },
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
      <header className="fixed top-0 z-50 w-full bg-transparent">
        <nav
          className={cn(
            "w-full transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ease-out",
            navFilled &&
              "border-b border-white/45 bg-white/40 shadow-sm shadow-slate-900/5 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-black/25",
          )}
          aria-label="Main"
        >
          <div
            className="container flex items-center"
            style={{ minHeight: NAV_ROW_HEIGHT_PX }}
          >
            <div className="flex h-10 w-full min-w-0 items-center justify-between gap-2 sm:h-11 sm:gap-3">
              <BrandLogo className="drop-shadow-sm" />

              <div className="hidden min-w-0 items-center gap-1 md:flex md:gap-1 lg:gap-1.5 font-headline text-[0.8125rem] sm:text-sm font-semibold tracking-tight">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "shrink-0 rounded-lg px-3 py-2 font-semibold transition-colors",
                      !navFilled && "drop-shadow-sm",
                      isActive(to)
                        ? navFilled
                          ? "text-primary"
                          : "text-white"
                        : navFilled
                          ? "text-slate-900/95 hover:bg-primary/10 hover:text-primary dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-primary"
                          : "text-white/90 hover:bg-white/10 hover:text-white",
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
                  className={cn(
                    "rounded-full p-2 transition-colors",
                    navFilled
                      ? "text-slate-700 hover:bg-primary/10 hover:text-primary dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-primary"
                      : "text-white drop-shadow-sm hover:bg-white/10",
                  )}
                  aria-label="Toggle dark mode"
                >
                  {theme === "dark" ? (
                    <Sun className="h-[1.125rem] w-[1.125rem]" />
                  ) : (
                    <Moon className="h-[1.125rem] w-[1.125rem]" />
                  )}
                </button>

                {loading ? (
                  <div
                    className="hidden h-9 w-[7.25rem] animate-pulse rounded-xl bg-slate-200/70 dark:bg-zinc-700/70 md:block"
                    aria-busy="true"
                    aria-label="Loading account"
                  />
                ) : (
                  <div className="hidden items-center gap-2.5 md:flex">
                    {isAuthenticated && user ? (
                      <Link
                        to="/profile"
                        className={cn(
                          "group flex items-center gap-2 rounded-xl px-2 py-1 transition-colors",
                          navFilled
                            ? "hover:bg-primary/5 dark:hover:bg-white/5"
                            : "text-white drop-shadow-sm hover:bg-white/10",
                        )}
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
                        <span
                          className={cn(
                            "max-w-[92px] truncate font-headline text-sm font-bold transition-colors",
                            navFilled
                              ? "text-slate-800 group-hover:text-primary dark:text-zinc-200 dark:group-hover:text-primary"
                              : "text-white group-hover:text-white",
                          )}
                        >
                          {user.name?.split(" ")[0] ?? "Account"}
                        </span>
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className={cn(
                          "inline-flex items-center justify-center gap-1.5 rounded-full font-headline text-sm font-semibold transition-[transform,box-shadow,background-color,border-color] duration-200",
                          navFilled
                            ? "bg-primary px-4 py-2 text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/92 hover:shadow-lg active:scale-[0.98]"
                            : "border border-white/45 bg-white/15 px-4 py-2 text-white backdrop-blur-md ring-1 ring-inset ring-white/25 drop-shadow-sm hover:bg-white/25 hover:ring-white/35",
                        )}
                      >
                        <LogIn className="h-[0.9375rem] w-[0.9375rem] shrink-0 opacity-95" aria-hidden />
                        Sign In
                      </Link>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className={cn(
                    "rounded-full p-2 transition-colors md:hidden",
                    navFilled
                      ? "text-slate-700 hover:bg-primary/10 hover:text-primary dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-primary"
                      : "text-white drop-shadow-sm hover:bg-white/10",
                  )}
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
                className={`flex items-center gap-3 px-6 py-4 font-headline font-semibold text-[0.9375rem] transition-colors ${
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
              {loading ? (
                <div
                  className="mx-4 mb-3 mt-1 h-12 animate-pulse rounded-xl bg-slate-200/70 dark:bg-zinc-700/70"
                  aria-busy="true"
                  aria-label="Loading account"
                />
              ) : isAuthenticated && user ? (
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
                  className="mx-4 mb-3 mt-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-headline text-[0.9375rem] font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/92"
                >
                  <LogIn className="h-4 w-4 shrink-0" aria-hidden />
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
