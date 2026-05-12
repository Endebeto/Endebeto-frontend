import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Compass,
  LayoutDashboard,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { PROFILE_NAV_META, type ProfileTab } from "@/components/profile/profileUtils";
import { UserAvatar } from "@/components/UserAvatar";

const TAB_ICONS: Record<ProfileTab, ReactNode> = {
  personal: <User className="h-4 w-4" />,
  bookings: <BookOpen className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
};

export function ProfileDesktopSidebar({
  displayName,
  userPhoto,
  isAdmin,
  isHost,
  activeTab,
  onSelectTab,
  onSignOut,
}: {
  displayName: string;
  userPhoto?: string;
  isAdmin: boolean;
  isHost: boolean;
  activeTab: ProfileTab;
  onSelectTab: (t: ProfileTab) => void;
  onSignOut: () => void;
}) {
  return (
    <aside className="w-56 shrink-0">
      <div className="sticky top-16 bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-3 mb-5 px-1">
          <UserAvatar
            name={displayName || "User"}
            photo={userPhoto}
            className="w-10 h-10 rounded-full bg-secondary-container text-sm"
            initialsClassName="text-on-secondary-container text-sm"
            imgClassName="w-full h-full rounded-full object-cover"
            alt=""
          />
          <div className="min-w-0">
            <p className="font-headline font-bold text-primary text-sm truncate">{displayName}</p>
            <p className="text-[10px] text-on-surface-variant capitalize">
              {isAdmin ? "Administrator" : isHost ? "Superhost" : "Traveler"}
            </p>
          </div>
        </div>

        <nav className="space-y-0.5">
          {PROFILE_NAV_META.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-headline font-semibold transition-all ${
                activeTab === item.id
                  ? "bg-primary/8 text-primary dark:bg-primary/15"
                  : "text-on-surface-variant hover:bg-surface-container dark:hover:bg-zinc-700 hover:translate-x-0.5"
              }`}
            >
              {TAB_ICONS[item.id]}
              <span className="flex items-center gap-1.5 flex-wrap">
                {item.label}
                {item.id === "notifications" && (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md">
                    Soon
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>

        {(isHost || isAdmin) && (
          <div className="mt-4 pt-4 border-t border-outline-variant/20 dark:border-zinc-600 space-y-0.5">
            <p className="text-[10px] font-bold text-on-surface-variant dark:text-zinc-500 uppercase tracking-widest px-3 mb-2">
              Portals
            </p>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-headline font-semibold text-primary dark:text-green-400 hover:bg-primary/8 dark:hover:bg-primary/15 transition-all hover:translate-x-0.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
            {isHost && !isAdmin && (
              <Link
                to="/host-dashboard"
                className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-headline font-semibold text-primary dark:text-green-400 hover:bg-primary/8 dark:hover:bg-primary/15 transition-all hover:translate-x-0.5"
              >
                <Compass className="h-4 w-4" />
                Host Dashboard
              </Link>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-outline-variant/20 dark:border-zinc-600">
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-headline font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
