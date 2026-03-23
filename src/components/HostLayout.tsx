import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Compass, PlusCircle, Wallet,
  Settings, LogOut, Search, Bell, HelpCircle, Menu, X,
} from "lucide-react";

const navLinks = [
  { icon: LayoutDashboard, label: "Dashboard",         href: "/host-dashboard" },
  { icon: Compass,         label: "My Experiences",    href: "/host/experiences" },
  { icon: PlusCircle,      label: "Create Experience", href: "/host/experiences/create" },
  { icon: Wallet,          label: "Wallet",            href: "/host/wallet" },
];

interface HostLayoutProps {
  children: ReactNode;
  hostName?: string;
  hostInitials?: string;
  hostTitle?: string;
  searchValue?: string;
  onSearch?: (v: string) => void;
}

export default function HostLayout({
  children,
  hostName = "Selamawit T.",
  hostInitials = "ST",
  hostTitle = "Superhost",
  searchValue = "",
  onSearch,
}: HostLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <Compass className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-headline font-extrabold text-primary dark:text-green-400 tracking-tighter leading-none">
              Endebeto
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant dark:text-zinc-500 mt-0.5 font-semibold">
              Host Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navLinks.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/host-dashboard" &&
             item.href !== "/host/experiences" &&
             pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "text-primary dark:text-green-400 font-bold border-r-4 border-primary/70 dark:border-green-400/70 bg-emerald-50/60 dark:bg-emerald-900/20 translate-x-1"
                  : "text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-green-300 hover:bg-surface-container-low dark:hover:bg-zinc-800 hover:translate-x-0.5"
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-primary dark:text-green-400" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 mt-auto space-y-0.5 border-t border-outline-variant/15 dark:border-zinc-800">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-green-300 hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors"
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          Settings
        </Link>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-error hover:bg-error-container/20 dark:hover:bg-red-900/20 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface dark:bg-zinc-950 text-on-surface font-body">

      {/* ── Desktop Fixed Sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-[#f7f9fb] dark:bg-zinc-900 border-r border-outline-variant/15 dark:border-zinc-800 flex-col z-50">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-72 bg-[#f7f9fb] dark:bg-zinc-900 border-r border-outline-variant/15 dark:border-zinc-800 flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main area ── */}
      <div className="lg:ml-64 flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="shrink-0 h-14 md:h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-outline-variant/10 dark:border-zinc-800 shadow-[0_20px_40px_-10px_rgba(0,53,39,0.04)] z-40">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="text-sm text-on-surface-variant dark:text-zinc-400 font-medium hidden sm:block">Host Portal</span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Search — tablet+ */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant dark:text-zinc-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearch?.(e.target.value)}
                placeholder="Search experiences or bookings…"
                className="pl-9 pr-4 py-2 bg-surface-container-low dark:bg-zinc-800 border-0 rounded-full w-56 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500 dark:text-white"
              />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2 text-on-surface-variant dark:text-zinc-400">
              <button className="p-1.5 rounded-full hover:text-primary dark:hover:text-green-400 hover:bg-surface-container dark:hover:bg-zinc-800 transition-colors">
                <Bell className="h-[18px] w-[18px]" />
              </button>
              <button className="hidden sm:flex p-1.5 rounded-full hover:text-primary dark:hover:text-green-400 hover:bg-surface-container dark:hover:bg-zinc-800 transition-colors">
                <HelpCircle className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* User chip */}
            <div className="flex items-center gap-2 pl-3 md:pl-5 border-l border-outline-variant/30 dark:border-zinc-700">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-surface dark:text-white leading-none">{hostName}</p>
                <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 mt-0.5">{hostTitle}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-headline font-bold text-white text-[11px] shadow-sm shrink-0">
                {hostInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Content slot */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
