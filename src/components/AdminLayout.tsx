import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Compass, FileText, CreditCard,
  Bell, Settings, Search, Menu, X,
} from "lucide-react";

const navLinks = [
  { icon: LayoutDashboard, label: "Dashboard",         href: "/admin" },
  { icon: Users,           label: "Users",             href: "/admin/users" },
  { icon: Compass,         label: "Experience Management", href: "/admin/experiences" },
  { icon: FileText,        label: "Host Applications", href: "/admin/host-applications" },
  { icon: CreditCard,      label: "Payouts",           href: "/admin/payouts" },
];

interface AdminLayoutProps {
  children: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (v: string) => void;
}

export default function AdminLayout({
  children,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearch,
}: AdminLayoutProps) {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* close drawer on route change */
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  /* lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="mb-8 px-2 pt-1">
        <h1 className="font-headline text-xl font-black text-white tracking-tighter">Endebeto</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">Admin Portal</p>
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
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-headline font-semibold transition-all duration-200 ${
                isActive
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

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface">

      {/* ── Desktop Fixed Sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-primary flex-col p-5 z-50 shadow-[8px_0_32px_-4px_rgba(0,53,39,0.3)]">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Drawer panel */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-primary flex flex-col p-5 z-50 shadow-[8px_0_32px_-4px_rgba(0,53,39,0.3)] transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main area ── */}
      <div className="lg:ml-60 flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="shrink-0 h-14 flex items-center justify-between px-4 md:px-6 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-b border-outline-variant/10 z-40">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search — hidden on small mobile */}
            <div className="relative hidden sm:block w-48 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearch?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border-none rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile search icon */}
            <button className="sm:hidden p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button className="relative p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button className="hidden sm:flex p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
              <Settings className="h-[18px] w-[18px]" />
            </button>
            <div className="h-6 w-px bg-outline-variant/30 mx-1 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-primary leading-none">Admin Portal</p>
                <p className="text-[10px] text-on-surface-variant">Superuser</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-headline font-bold text-white text-xs shadow-sm shrink-0">
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
