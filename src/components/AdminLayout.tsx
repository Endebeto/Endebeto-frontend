import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Compass,
  FileText,
  CreditCard,
  Bell,
  Search,
  Menu,
  X,
  Home,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

function adminInitials(name?: string): string {
  if (!name?.trim()) return "AD";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "AD"
  );
}

const navLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  {
    icon: Compass,
    label: "Experiences",
    href: "/admin/experiences",
    title: "Experiences (catalog management)",
  },
  {
    icon: CalendarCheck,
    label: "Bookings",
    href: "/admin/bookings",
    title: "Platform Bookings Management",
  },
  { icon: MessageSquare, label: "Reviews", href: "/admin/reviews" },
  {
    icon: FileText,
    label: "Host Applications",
    href: "/admin/host-applications",
  },
  { icon: CreditCard, label: "Payouts", href: "/admin/payouts" },
];

interface AdminLayoutProps {
  children: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (v: string) => void;
}

interface SidebarContentProps {
  drawer?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  drawer,
  collapsed = false,
  onToggleCollapse,
}: SidebarContentProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const displayName = user?.name || "Admin";
  const initials = adminInitials(user?.name);

  return (
    <>
      {/* Brand & Collapse Header */}
      <div
        className={cn(
          "mb-6 flex items-center justify-between",
          drawer && "pr-8",
          collapsed && "justify-center",
        )}
      >
        {!collapsed ? (
          <>
            <BrandLogo
              to="/admin"
              variant="stacked"
              className="justify-center flex-1"
              imgClassName="h-10 w-auto max-w-[7.5rem] object-contain object-center drop-shadow-[0_2px_14px_rgba(0,0,0,0.42)] sm:h-11 sm:max-w-[8rem]"
              wordmarkClassName="h-4.5 w-auto max-w-[6.5rem] sm:h-5 sm:max-w-[7.5rem]"
            />
            {!drawer && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors ml-1 shrink-0"
                title="Minimize sidebar"
                aria-label="Minimize sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <BrandLogo
              to="/admin"
              variant="icon"
              className="justify-center"
              imgClassName="h-8 w-auto max-w-[36px] object-contain object-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
            />
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
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
              title={item.label}
              className={`flex items-center ${
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3.5 py-2.5"
              } rounded-xl text-sm font-headline font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white/15 text-white shadow-inner"
                  : "text-white/55 hover:bg-white/8 hover:text-white/85"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-tertiary-fixed shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/"
        className={`mt-4 flex items-center ${
          collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-3.5 py-2"
        } rounded-xl text-xs font-headline font-semibold text-white/50 hover:text-white/85 hover:bg-white/8 transition-colors`}
        title="Back to the public site"
      >
        <Home className="h-4 w-4 shrink-0" />
        {!collapsed && <span>View site</span>}
      </Link>

      {/* Admin chip */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-2.5 px-1"
          }`}
        >
          <div
            className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center font-headline font-bold text-white text-xs shrink-0"
            title={displayName}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-headline font-bold text-white text-xs truncate">
                {displayName}
              </p>
              <p className="text-[9px] text-white/45 truncate">
                {user?.email || "Administrator"}
              </p>
            </div>
          )}
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
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("admin_sidebar_collapsed") === "true";
    } catch (_err) {
      return false;
    }
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch (_err) {
        // localStorage not available
      }
      return next;
    });
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  const displayName = user?.name || "Admin";
  const initials = adminInitials(user?.name);

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
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 h-screen bg-primary flex-col z-50 shadow-[8px_0_32px_-4px_rgba(0,53,39,0.3)] transition-all duration-300 ease-in-out",
          collapsed ? "w-[70px] p-3" : "w-[210px] p-4",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Drawer panel */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-[240px] bg-primary flex flex-col p-4 z-50 shadow-[8px_0_32px_-4px_rgba(0,53,39,0.3)] transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
      <div
        className={cn(
          "flex-1 flex flex-col h-screen overflow-hidden min-w-0 transition-all duration-300 ease-in-out",
          collapsed ? "lg:ml-[70px]" : "lg:ml-[210px]",
        )}
      >
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

            {/* Search — rendered only when the current admin page registers an onSearch handler */}
            {onSearch && (
              <div className="relative flex-1 min-w-0 max-w-md md:max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSearch(searchValue);
                    }
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-surface-container"
              title="Open public marketplace"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Marketplace</span>
            </Link>

            {/* Notifications */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-zinc-900" />
            </button>

            {/* Admin identity pill */}
            <div
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-outline-variant/15"
              title={user?.email || displayName}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary dark:bg-primary/20 font-headline font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-primary/15">
                {initials}
              </div>
              <div className="hidden md:flex flex-col min-w-0 max-w-[130px] lg:max-w-[160px] text-left">
                <span className="text-xs font-headline font-bold text-on-surface truncate leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-on-surface-variant truncate">
                  {user?.email || "Administrator"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest dark:bg-zinc-950 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
