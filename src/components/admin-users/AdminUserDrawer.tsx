import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LockKeyhole, ShieldOff, X } from "lucide-react";
import {
  effectiveRole,
  formatUserDate,
  HOST_BADGE,
  loginMethodLabel,
  ROLE_BADGE,
} from "@/components/admin-users/adminUsersUtils";
import { UserAvatar } from "@/components/UserAvatar";
import type { AdminUser } from "@/services/admin.service";

export function AdminUserDrawer({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex pointer-events-auto">
      <button
        type="button"
        className="absolute inset-0 bg-black/20 backdrop-blur-sm border-0 cursor-default"
        aria-label="Close user details"
        onClick={onClose}
      />
      <aside className="w-96 h-full ml-auto relative bg-white dark:bg-[#2d3133] shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
          <h3 className="font-headline font-extrabold text-base text-primary">
            User Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-6 border-b border-outline-variant/10">
          <UserAvatar
            name={user.name}
            photo={user.photo}
            className="w-20 h-20 rounded-2xl bg-secondary-container shadow-md mb-4"
            initialsClassName="text-3xl text-on-secondary-container font-black"
            imgClassName="w-full h-full object-cover"
          />
          <p className="font-headline font-extrabold text-lg text-primary">{user.name}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">{user.email}</p>
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${ROLE_BADGE[effectiveRole(user)] ?? ""}`}
            >
              {effectiveRole(user)}
            </span>
            {user.hostStatus && user.hostStatus !== "none" && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${HOST_BADGE[user.hostStatus] ?? ""}`}
              >
                {user.hostStatus}
              </span>
            )}
            {user.active === false && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-red-100 text-red-700">
                Suspended
              </span>
            )}
            {user.hostStatus === "approved" && user.hostListingSuspended && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Listings on hold
              </span>
            )}
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: "Login method", value: loginMethodLabel(user) },
            { label: "Verified", value: user.isVerified ? "Yes" : "No" },
            { label: "Member Since", value: formatUserDate(user.createdAt, user._id) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2.5 border-b border-outline-variant/10 last:border-none"
            >
              <span className="text-xs text-on-surface-variant font-medium">{label}</span>
              <span className="text-xs font-bold text-on-surface">{value}</span>
            </div>
          ))}
        </div>

        {user.hostStatus === "approved" && user.hostListingSuspended && (
          <div className="px-6 pb-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 space-y-2">
              <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5" /> Host listing suspension
              </p>
              {user.hostListingSuspendedReason && (
                <p className="text-sm text-amber-950 dark:text-amber-100 leading-relaxed">
                  {user.hostListingSuspendedReason}
                </p>
              )}
              <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80">
                {user.hostListingSuspendedAt
                  ? new Date(user.hostListingSuspendedAt).toLocaleString()
                  : "—"}
                {user.hostListingSuspendedBy?.name &&
                  ` · by ${user.hostListingSuspendedBy.name}`}
              </p>
            </div>
          </div>
        )}

        {user.active === false && (
          <div className="px-6 pb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4 space-y-2">
              <p className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldOff className="h-3.5 w-3.5" /> Suspension details
              </p>
              {user.suspensionReason && (
                <p className="text-sm text-red-900 dark:text-red-100 leading-relaxed">
                  {user.suspensionReason}
                </p>
              )}
              <p className="text-[11px] text-red-800/80 dark:text-red-400/90">
                {user.suspendedAt
                  ? new Date(user.suspendedAt).toLocaleString()
                  : "Unknown date"}
                {user.suspendedBy?.name && ` · by ${user.suspendedBy.name}`}
              </p>
              {!user.suspensionReason && !user.suspendedAt && (
                <p className="text-[11px] text-red-800/80 dark:text-red-400/90">
                  Legacy suspension — no audit trail was captured.
                </p>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
