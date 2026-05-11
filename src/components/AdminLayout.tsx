import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Compass,
  FileText,
  CreditCard,
  Bell,
  Settings,
  Search,
  Menu,
  X,
  Home,
  MessageSquare,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const navLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  {
    icon: Compass,
    label: "Experiences",
    href: "/admin/experiences",
    title: "Experiences (catalog management)",
  },
  { icon: MessageSquare, label: "Reviews", href: "/admin/reviews" },
  { icon: FileText, label: "Host Applications", href: "/admin/host-applications" },
  { icon: CreditCard, label: "Payouts", href: "/admin/payouts" },
];

interface AdminLayoutProps {
  children: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (v: string) => void;
}

function SidebarContent({ drawer }: { drawer?: boolean }) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Brand — logo sits on the panel without a white tile (reads on dark primary) */}
      <div className={drawer ? "mb-8 pr-10" : "mb-8"}>
        <Link
          to="/admin"
          className="group block rounded-2xl bg-black/15 p-3 ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-colors hover:bg-black/20 hover:ring-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-fixed/60 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          aria-label="Admin dashboard home"
        >
          <div className="flex items-center gap-3">
            <BrandLogo
              nested
              className="min-w-0 shrink-0"
              imgClassName="h-8 w-auto max-w-[9rem] object-contain object-left opacity-[0.97] drop-shadow-[0_2px_14px_rgba(0,0,0,0.42)] sm:h-[2.125rem] sm:max-w-[10rem]"
            />
            <div className="flex min-w-0 flex-col gap-1 items-start">
              <span className="rounded-md bg-white/[0.09] px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-tertiary-fixed ring-1 ring-white/12">
                Admin
              </span>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/38 leading-none">
                Portal
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navLinks.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              title={"title" in item ? item.title : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-headline font-semibold transition-all duration-200 ${isActive
                ? "bg-white/15 text-white shadow-inner translate-x-1"
                : "text-white/55 hover:bg-white/8 hover:text-white/85 hover:translate-x-0.5"
                }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-tertiary-fixed shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/"
        className="mt-4 flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-headline font-semibold text-white/50 hover:text-white/85 hover:bg-white/8 transition-colors"
        title="Back to the public site"
      >
        <Home className="h-4 w-4 shrink-0" />
        <span>View site</span>
      </Link>

      {/* Admin chip */}
      <div className="mt-auto pt-5 border-t border-white/10">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center font-headline font-bold text-white text-xs shrink-0">
            AD
          </div>
          <div className="min-w-0">
            <p className="font-headline font-bold text-white text-sm truncate">Admin</p>
            <p className="text-[10px] text-white/45">Superuser</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminLayout({
  children,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearch,
}: AdminLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* close drawer on route change */
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  /* lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface">

      {/* ── Desktop Fixed Sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[260px] bg-primary flex-col p-5 z-50 shadow-[8px_0_32px_-4px_rgba(0,53,39,0.3)]">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Drawer panel */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-[272px] bg-primary flex flex-col p-5 z-50 shadow-[8px_0_32px_-4px_rgba(0,53,39,0.3)] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent drawer />
      </aside>

      {/* ── Main area ── */}
      <div className="lg:ml-[260px] flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="shrink-0 min-h-14 flex items-center justify-between gap-3 px-4 md:px-6 py-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-outline-variant/15 z-40 shadow-sm shadow-black/[0.03]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden shrink-0 p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Compact logo — mobile / tablet when drawer hidden */}
            <Link
              to="/admin"
              className="lg:hidden shrink-0 rounded-xl px-1.5 py-1 hover:bg-surface-container/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              aria-label="Admin dashboard home"
            >
              <BrandLogo
                nested
                imgClassName="h-[1.35rem] w-auto max-w-[6.25rem] object-contain object-left sm:h-7 sm:max-w-[7.25rem]"
              />
            </Link>

            {/* Search — hidden on small mobile */}
            <div className="relative hidden sm:block flex-1 max-w-md md:max-w-lg min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearch?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile search icon */}
            <button
              type="button"
              className="sm:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-primary border border-primary/25 hover:bg-primary/[0.06] transition-colors"
              title="Back to the public site"
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span>View site</span>
            </Link>
            <Link
              to="/"
              className="sm:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
              aria-label="View site"
              title="View site"
            >
              <Home className="h-[18px] w-[18px] text-primary" />
            </Link>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
              title="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/payouts")}
              className="hidden sm:flex p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
              title="Settings / Payouts"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
            <div className="h-8 w-px bg-outline-variant/35 mx-0.5 hidden sm:block" />
            <div className="flex items-center gap-2 pl-0.5">
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-[11px] font-headline font-bold text-primary">Console</p>
                <p className="text-[10px] text-on-surface-variant">Superuser</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-headline font-bold text-white text-[11px] shadow-md shadow-primary/25 shrink-0 ring-2 ring-white dark:ring-zinc-900">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content slot — each page manages its own scroll/overflow */}
        <div className="flex-1 min-h-0 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
