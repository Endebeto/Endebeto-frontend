import { Link } from "react-router-dom";
import {
  Ban,
  CalendarCheck,
  Compass,
  ExternalLink,
  LockKeyhole,
  RotateCcw,
  Trash2,
  Unlock,
} from "lucide-react";
import type { AdminUser } from "@/services/admin.service";

export function AdminUsersActionMenu({
  user,
  canSuspend,
  onSuspend,
  onDelete,
  onClose,
  canManageHostListings,
  onSuspendHostListings,
  onReinstateHostListings,
}: {
  user: AdminUser;
  canSuspend: boolean;
  onSuspend: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
  onClose: () => void;
  canManageHostListings: boolean;
  onSuspendHostListings: (u: AdminUser) => void;
  onReinstateHostListings: (u: AdminUser) => void;
}) {
  return (
    <div className="absolute right-4 top-full mt-1 z-50 w-52 bg-white dark:bg-[#2d3133] rounded-xl shadow-xl border border-outline-variant/20 py-1 overflow-hidden">
      <Link
        to={`/admin/bookings?search=${encodeURIComponent(user.email)}`}
        onClick={onClose}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          <CalendarCheck className="h-3.5 w-3.5" /> Bookings
        </span>
        <ExternalLink className="h-2.5 w-2.5 opacity-50" />
      </Link>
      {(user.role === "host" ||
        (user.hostStatus && user.hostStatus !== "none")) && (
        <Link
          to={`/admin/experiences?search=${encodeURIComponent(user.name || user.email)}`}
          onClick={onClose}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Compass className="h-3.5 w-3.5" /> Experiences
          </span>
          <ExternalLink className="h-2.5 w-2.5 opacity-50" />
        </Link>
      )}
      <div className="my-1 border-t border-outline-variant/10" />
      {canSuspend ? (
        <button
          type="button"
          onClick={() => {
            onSuspend(user);
            onClose();
          }}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
        >
          {user.active === false ? (
            <RotateCcw className="h-3.5 w-3.5" />
          ) : (
            <Ban className="h-3.5 w-3.5" />
          )}
          {user.active === false ? "Reinstate Account" : "Suspend User"}
        </button>
      ) : (
        <div
          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-outline-variant cursor-not-allowed"
          title="Admins and your own account cannot be suspended from here."
        >
          <Ban className="h-3.5 w-3.5" /> Suspend User
        </div>
      )}
      {canManageHostListings &&
        user.hostStatus === "approved" &&
        (user.hostListingSuspended ? (
          <button
            type="button"
            onClick={() => {
              onReinstateHostListings(user);
              onClose();
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-emerald-700 dark:text-green-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
          >
            <Unlock className="h-3.5 w-3.5" /> Reinstate host listings
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onSuspendHostListings(user);
              onClose();
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300/90 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
          >
            <LockKeyhole className="h-3.5 w-3.5" /> Suspend host listings
          </button>
        ))}
      <div className="my-1 border-t border-outline-variant/10" />
      <button
        type="button"
        onClick={() => {
          onDelete(user);
          onClose();
        }}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete Account
      </button>
    </div>
  );
}
