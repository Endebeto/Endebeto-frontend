import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import {
  Bell,
  BookOpen,
  ChevronRight,
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

export function ProfileMobileMenu({
  displayName,
  userEmail,
  userPhoto,
  isAdmin,
  isHost,
  onSelectTab,
  onSignOut,
}: {
  displayName: string;
  userEmail?: string;
  userPhoto?: string;
  isAdmin: boolean;
  isHost: boolean;
  onSelectTab: (t: ProfileTab) => void;
  onSignOut: () => void;
}) {
  return (
    <div className="px-4 pt-5 pb-10 space-y-4">
      <div className="bg-primary rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-primary/20">
        <UserAvatar
          name={displayName || "User"}
          photo={userPhoto}
          className="w-14 h-14 rounded-2xl bg-white/15 border-2 border-white/20"
          initialsClassName="text-white text-xl font-black"
          imgClassName="w-full h-full object-cover"
          alt=""
        />
        <div className="min-w-0">
          <p className="font-headline font-extrabold text-white text-base truncate">
            {displayName}
          </p>
          <p className="text-white/60 text-xs mt-0.5">{userEmail}</p>
          <span className="inline-block mt-1.5 bg-white/15 text-white/90 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            {isAdmin ? "Administrator" : isHost ? "Superhost" : "Traveler"}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm overflow-hidden">
        {PROFILE_NAV_META.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`flex items-center gap-3 w-full px-4 py-4 text-left transition-colors hover:bg-surface-container-low dark:hover:bg-zinc-700 ${
              i < PROFILE_NAV_META.length - 1
                ? "border-b border-outline-variant/10 dark:border-zinc-700"
                : ""
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-green-400 shrink-0">
              {TAB_ICONS[item.id]}
            </div>
            <span className="flex-1 font-headline font-semibold text-sm text-on-surface dark:text-white flex items-center gap-1.5 flex-wrap">
              {item.label}
              {item.id === "notifications" && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 bg-amber-100/90 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md">
                  Soon
                </span>
              )}
            </span>
            <ChevronRight className="h-4 w-4 text-on-surface-variant/40" />
          </button>
        ))}
      </div>

      {(isHost || isAdmin) && (
        <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm overflow-hidden">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-4 pt-3 pb-1">
            Portals
          </p>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 w-full px-4 py-4 transition-colors hover:bg-surface-container-low dark:hover:bg-zinc-700 border-t border-outline-variant/10 dark:border-zinc-700"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span className="flex-1 font-headline font-semibold text-sm text-on-surface dark:text-white">
                Admin Dashboard
              </span>
              <ChevronRight className="h-4 w-4 text-on-surface-variant/40" />
            </Link>
          )}
          {isHost && !isAdmin && (
            <Link
              to="/host-dashboard"
              className="flex items-center gap-3 w-full px-4 py-4 transition-colors hover:bg-surface-container-low dark:hover:bg-zinc-700 border-t border-outline-variant/10 dark:border-zinc-700"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-green-400 shrink-0">
                <Compass className="h-4 w-4" />
              </div>
              <span className="flex-1 font-headline font-semibold text-sm text-on-surface dark:text-white">
                Host Dashboard
              </span>
              <ChevronRight className="h-4 w-4 text-on-surface-variant/40" />
            </Link>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-4 py-4 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="font-headline font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
