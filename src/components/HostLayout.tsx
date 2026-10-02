import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  PlusCircle,
  Wallet,
  Users,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const navLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/host-dashboard" },
  { icon: Compass, label: "My Experiences", href: "/host/experiences" },
  {
    icon: PlusCircle,
    label: "Create Experience",
    href: "/host/experiences/create",
  },
  { icon: Users, label: "Guest Bookings", href: "/host/bookings" },
  { icon: Wallet, label: "Wallet", href: "/host/wallet" },
];

interface HostLayoutProps {
  children: ReactNode;
  hostName?: string;
  hostTitle?: string;
}

interface SidebarContentProps {
  drawer?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout: () => void;
}

function SidebarContent({
  drawer,
  collapsed = false,
  onToggleCollapse,
  onLogout,
}: SidebarContentProps) {
  const { pathname } = useLocation();

  return (
    <>
      {/* Brand & Collapse Header */}
      <div
        className={cn(
          "px-4 pt-6 pb-4 flex items-center justify-between",
          drawer && "pr-8",
          collapsed && "justify-center px-2",
        )}
      >
        {!collapsed ? (
          <>
            <BrandLogo
              to="/host-dashboard"
              variant="stacked"
              className="justify-center flex-1"
              imgClassName="h-10 w-auto max-w-[7.5rem] object-contain object-center sm:h-11 sm:max-w-[8rem]"
              wordmarkClassName="h-4.5 w-auto max-w-[6.5rem] sm:h-5 sm:max-w-[7.5rem]"
            />
            {!drawer && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors ml-1 shrink-0"
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
              to="/host-dashboard"
              variant="icon"
              className="justify-center"
              imgClassName="h-8 w-auto max-w-[36px] object-contain object-center"
            />
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
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
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navLinks.map((item) => {
          const exactOnly = new Set([
            "/host-dashboard",
            "/host/experiences",
            "/host/bookings",
          ]);
          const isActive =
            pathname === item.href ||
            (!exactOnly.has(item.href) && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              title={item.label}
              className={`flex items-center ${
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
              } rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "text-primary dark:text-green-400 font-bold bg-emerald-50/70 dark:bg-emerald-900/25"
                  : "text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-green-400 hover:bg-surface-container-low dark:hover:bg-zinc-800"
              }`}
            >
              <item.icon
                className={`h-[18px] w-[18px] shrink-0 ${
                  isActive ? "text-primary dark:text-green-400" : ""
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 mt-auto space-y-1 border-t border-outline-variant/15 dark:border-zinc-800">
        <Link
          to="/profile"
          title="Settings"
          className={`flex items-center ${
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          } rounded-lg text-sm text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-green-400 hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors`}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          className={`w-full flex items-center ${
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          } rounded-lg text-sm text-error hover:bg-error-container/20 dark:hover:bg-red-900/20 transition-colors`}
          onClick={onLogout}
          title="Sign Out"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );
}

export default function HostLayout({
  children,
  hostName = "Selamawit T.",
  hostTitle = "Superhost",
}: HostLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const displayName = user?.name || hostName;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("host_sidebar_collapsed") === "true";
    } catch (_err) {
      return false;
    }
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("host_sidebar_collapsed", String(next));
      } catch (_err) {
        // localStorage not available
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface dark:bg-zinc-950 text-on-surface font-body">
      {/* ── Desktop Fixed Sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 h-screen bg-[#f7f9fb] dark:bg-zinc-900 border-r border-outline-variant/15 dark:border-zinc-800 flex-col z-50 transition-all duration-300 ease-in-out",
          collapsed ? "w-[70px]" : "w-[210px]",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-[#f7f9fb] dark:bg-zinc-900 border-r border-outline-variant/15 dark:border-zinc-800 flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent drawer onLogout={handleLogout} />
      </aside>

      {/* ── Main area ── */}
      <div
        className={cn(
          "flex-1 flex flex-col h-screen overflow-hidden min-w-0 transition-all duration-300 ease-in-out",
          collapsed ? "lg:ml-[70px]" : "lg:ml-[210px]",
        )}
      >
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

            <span className="text-sm text-on-surface-variant dark:text-zinc-400 font-medium hidden sm:block">
              Host Portal
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
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
                <p className="text-xs font-bold text-on-surface dark:text-white leading-none">
                  {displayName}
                </p>
                <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 mt-0.5">
                  {hostTitle}
                </p>
              </div>
              <UserAvatar
                name={displayName}
                photo={user?.photo}
                className="w-8 h-8 rounded-full bg-primary shadow-sm ring-0 shrink-0"
                initialsClassName="text-white text-[11px]"
                imgClassName="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Content slot */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
