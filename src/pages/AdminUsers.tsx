import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, CheckCircle, MoreVertical,
  ChevronLeft, ChevronRight, Leaf, Mail,
  X, Ban, Trash2, Loader2, AlertCircle, ShieldOff, RotateCcw, Layers, LockKeyhole, Unlock,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { adminService, type AdminUser } from "@/services/admin.service";
import { useAuth } from "@/context/AuthContext";
import { getFriendlyErrorMessage } from "@/lib/errors";

type StatusFilter = "all" | "active" | "suspended";

/* ─── types ─────────────────────────────────────────────── */
type Role = "admin" | "host" | "user";
type HostStatus = "approved" | "pending" | "rejected" | null;
type Provider = "email" | "google" | "facebook";

/* ─── badge helpers ─────────────────────────────────────── */
const ROLE_BADGE: Record<Role, string> = {
  admin: "bg-primary text-white",
  host: "bg-secondary-container text-on-secondary-container",
  user: "bg-surface-container text-on-surface-variant",
};
const HOST_BADGE: Record<string, string> = {
  approved: "bg-tertiary-fixed text-on-tertiary-fixed",
  pending: "bg-surface-variant text-outline",
  rejected: "bg-red-100 text-red-700",
};

/** Maps backend authProvider + legacy provider */
function authProviderRaw(u: AdminUser): string {
  return (u.authProvider ?? u.provider ?? "local").toLowerCase();
}

function loginMethodLabel(u: AdminUser): string {
  if (u.googleId) return "Google";
  if (u.facebookId) return "Facebook";
  const p = authProviderRaw(u);
  if (p === "google") return "Google";
  if (p === "facebook") return "Facebook";
  return "Email & password";
}

function providerIconKey(u: AdminUser): string {
  if (u.googleId) return "google";
  if (u.facebookId) return "facebook";
  return authProviderRaw(u);
}

function formatUserDate(iso?: string | null, userId?: string): string {
  if (iso != null && iso !== "") {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
  }
  if (userId && /^[a-f\d]{24}$/i.test(userId)) {
    const ts = parseInt(userId.slice(0, 8), 16) * 1000;
    const d = new Date(ts);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
  }
  return "—";
}

/** Display role: approved hosts are shown as host regardless of stored role string */
function effectiveRole(u: AdminUser): Role {
  if (u.hostStatus === "approved") return "host";
  if (u.role === "admin") return "admin";
  return "user";
}

function ProviderIcon({ p }: { p?: string }) {
  if (p === "google") return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
  if (p === "facebook") return (
    <svg className="h-3.5 w-3.5" fill="#1877F2" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
  return <Mail className="h-3.5 w-3.5 text-on-surface-variant" />;
}

/* ─── confirm dialog ─────────────────────────────────────── */
function ConfirmDialog({
  title, message, confirmLabel, confirmClass, onConfirm, onClose, loading,
}: {
  title: string; message: string; confirmLabel: string;
  confirmClass?: string; onConfirm: () => void; onClose: () => void; loading?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#2d3133] rounded-2xl w-full max-w-sm p-6 shadow-2xl pointer-events-auto">
        <h3 className="font-headline font-extrabold text-lg text-primary mb-1">{title}</h3>
        <p className="text-sm text-on-surface-variant mb-6">{message}</p>
        <div className="flex gap-3 justify-end items-center">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 disabled:opacity-60 ${confirmClass ?? "bg-primary"}`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── action menu ───────────────────────────────────────── */
function ActionMenu({
  user, canSuspend, onSuspend, onDelete, onClose,
  canManageHostListings, onSuspendHostListings, onReinstateHostListings,
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
      {canSuspend ? (
        <button
          onClick={() => { onSuspend(user); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
        >
          {user.active === false ? <RotateCcw className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
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
      {canManageHostListings && user.hostStatus === "approved" && (
        user.hostListingSuspended ? (
          <button
            onClick={() => { onReinstateHostListings(user); onClose(); }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
          >
            <Unlock className="h-3.5 w-3.5" /> Reinstate host listings
          </button>
        ) : (
          <button
            onClick={() => { onSuspendHostListings(user); onClose(); }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300/90 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
          >
            <LockKeyhole className="h-3.5 w-3.5" /> Suspend host listings
          </button>
        )
      )}
      <div className="my-1 border-t border-outline-variant/10" />
      <button
        onClick={() => { onDelete(user); onClose(); }}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete Account
      </button>
    </div>
  );
}

/* ─── suspend dialog with reason ─────────────────────────── */
function SuspendUserDialog({
  user, onClose, onConfirm, loading,
}: {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#2d3133] rounded-2xl w-full max-w-md p-6 shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Ban className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-headline font-extrabold text-lg text-primary">Suspend Account</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate">{user.name} · {user.email}</p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant mb-3">
          Suspending will block this user from logging in, signing up with the same email, or using OAuth. They'll be notified by email if SMTP is configured.
        </p>
        <label className="block text-xs font-bold text-primary mb-2">
          Reason (shown to the user) <span className="text-outline-variant font-medium">— optional</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="e.g. Repeated violations of our community guidelines."
          className="w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-1"
        />
        <p className="text-[10px] text-on-surface-variant text-right mb-5">{reason.length}/500</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-amber-600 flex items-center gap-1.5 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Suspend
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── suspend host listings (reason) ─────────────────────── */
function SuspendHostListingsDialog({
  user, onClose, onConfirm, loading,
}: {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#2d3133] rounded-2xl w-full max-w-md p-6 shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Layers className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-headline font-extrabold text-lg text-primary">Suspend host listings</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate">{user.name} · {user.email}</p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant mb-3">
          The host stays signed in and can view their dashboard, but they cannot create or edit experiences until reinstated. They will be emailed if SMTP is configured.
        </p>
        <label className="block text-xs font-bold text-primary mb-2">
          Note (optional, shown in email) <span className="text-outline-variant font-medium">— max 500</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="e.g. Policy review; please contact support for details."
          className="w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl px-4 py-3 text-sm text-on-surface dark:text-white outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-1"
        />
        <p className="text-[10px] text-on-surface-variant text-right mb-5">{reason.length}/500</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-amber-700 flex items-center gap-1.5 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Suspend listings
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── user detail drawer ─────────────────────────────────── */
function UserDrawer({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex pointer-events-auto">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <aside className="w-96 h-full ml-auto relative bg-white dark:bg-[#2d3133] shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
          <h3 className="font-headline font-extrabold text-base text-primary">User Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
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
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${ROLE_BADGE[effectiveRole(user)] ?? ""}`}>
              {effectiveRole(user)}
            </span>
            {user.hostStatus && user.hostStatus !== "none" && (
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${HOST_BADGE[user.hostStatus] ?? ""}`}>
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
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-outline-variant/10 last:border-none">
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
                {user.hostListingSuspendedBy?.name && ` · by ${user.hostListingSuspendedBy.name}`}
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
                {user.suspendedAt ? new Date(user.suspendedAt).toLocaleString() : "Unknown date"}
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
    document.body
  );
}

/* ─── page ──────────────────────────────────────────────── */
const PAGE_SIZE = 10;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All Users" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
];

export default function AdminUsers() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerUser, setDrawerUser] = useState<AdminUser | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [hostListingSuspendTarget, setHostListingSuspendTarget] = useState<AdminUser | null>(null);
  const [hostListingReinstateTarget, setHostListingReinstateTarget] = useState<AdminUser | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", page, search, statusFilter],
    queryFn: () =>
      adminService.getUsers({ page, limit: PAGE_SIZE, search: search || undefined, status: statusFilter })
        .then(r => r.data),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const users: AdminUser[] = data?.data?.data ?? [];
  const totalUsers = data?.results ?? 0;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminService.suspendUser(id, reason),
    onSuccess: (res) => {
      const { emailConfigured, userEmailed } = res.data.data.notifications;
      if (emailConfigured && userEmailed) {
        toast.success("Account suspended. User notified by email.");
      } else if (emailConfigured) {
        toast.success("Account suspended. Email notification could not be delivered.");
      } else {
        toast.success("Account suspended. Email notifications skipped — SMTP not configured.");
      }
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setSuspendTarget(null);
    },
    onError: (err: unknown) => {
      toast.error(getFriendlyErrorMessage(err, "Failed to suspend user"));
    },
  });

  const reinstateMutation = useMutation({
    mutationFn: (id: string) => adminService.reinstateUser(id),
    onSuccess: (res) => {
      const { emailConfigured, userEmailed } = res.data.data.notifications;
      if (emailConfigured && userEmailed) {
        toast.success("Account reinstated. User notified by email.");
      } else if (emailConfigured) {
        toast.success("Account reinstated. Email notification could not be delivered.");
      } else {
        toast.success("Account reinstated. Email notifications skipped — SMTP not configured.");
      }
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setSuspendTarget(null);
    },
    onError: (err: unknown) => {
      toast.error(getFriendlyErrorMessage(err, "Failed to reinstate user"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const suspendHostListingsMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminService.suspendHostListings(id, reason),
    onSuccess: (res) => {
      const { emailConfigured, userEmailed } = res.data.data.notifications;
      if (emailConfigured && userEmailed) {
        toast.success("Host listing access suspended. User notified by email.");
      } else if (emailConfigured) {
        toast.success("Host listing access suspended. Email may not have been delivered.");
      } else {
        toast.success("Host listing access suspended. Email notifications skipped — SMTP not configured.");
      }
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setHostListingSuspendTarget(null);
    },
    onError: (err: unknown) => {
      toast.error(getFriendlyErrorMessage(err, "Failed to suspend host listings"));
    },
  });

  const reinstateHostListingsMutation = useMutation({
    mutationFn: (id: string) => adminService.reinstateHostListings(id),
    onSuccess: (res) => {
      const { emailConfigured, userEmailed } = res.data.data.notifications;
      if (emailConfigured && userEmailed) {
        toast.success("Host listings reinstated. User notified by email.");
      } else {
        toast.success("Host listings reinstated.");
      }
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setHostListingReinstateTarget(null);
    },
    onError: (err: unknown) => {
      toast.error(getFriendlyErrorMessage(err, "Failed to reinstate host listings"));
    },
  });

  return (
    <AdminLayout
      searchPlaceholder="Search users by name or email..."
      searchValue={search}
      onSearch={(v) => { setSearch(v); setPage(1); }}
    >
      <div className="flex-1 overflow-y-auto">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mb-1.5">
                  <span>Admin</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="font-semibold text-primary">Users Management</span>
                </nav>
                <h2 className="font-headline font-extrabold text-3xl text-primary tracking-tight">User Directory</h2>
                <p className="text-on-surface-variant text-sm mt-0.5">Manage platform users, roles, and host approval status.</p>
              </div>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
              {STATUS_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setStatusFilter(key); setPage(1); }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === key
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                    }`}
                >
                  {key === "suspended" && <ShieldOff className="h-3.5 w-3.5" />}
                  {label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#2d3133] rounded-3xl shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center gap-2 py-16 text-red-500">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm">Failed to load users.</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
                    {statusFilter === "suspended" ? <ShieldOff className="h-7 w-7 text-outline-variant" /> : <Users className="h-7 w-7 text-outline-variant" />}
                  </div>
                  <p className="font-headline font-bold text-base text-primary mb-1">
                    {statusFilter === "suspended" ? "No suspended users" : "No users found"}
                  </p>
                  <p className="text-xs text-on-surface-variant max-w-xs">
                    {statusFilter === "suspended"
                      ? "There are no suspended accounts at the moment."
                      : "No users match your current search. Try adjusting your terms."}
                  </p>
                  {search && (
                    <button onClick={() => setSearch("")} className="mt-5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90">
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-low/50">
                          {["Name", "Email", "Role", "Host Status", "Verified", "Provider", "Joined", ""].map((h, i) => (
                            <th
                              key={i}
                              className={`px-5 py-3.5 text-[9px] font-bold uppercase tracking-widest text-primary ${i === 7 ? "text-right" : ""}`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container">
                        {users.map((user) => (
                          <tr
                            key={user._id}
                            className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                            onClick={() => { if (!openMenu) setDrawerUser(user); }}
                          >
                            {/* Name */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <UserAvatar
                                  name={user.name}
                                  photo={user.photo}
                                  className="w-9 h-9 rounded-full bg-secondary-container"
                                  initialsClassName="text-xs text-on-secondary-container"
                                />
                                <div>
                                  <p className="text-sm font-bold text-primary leading-none">{user.name}</p>
                                  {user.active === false && (
                                    <span className="text-[9px] text-red-500 font-bold uppercase">Suspended</span>
                                  )}
                                  {user.hostStatus === "approved" && user.hostListingSuspended && (
                                    <span className="text-[9px] text-amber-700 font-bold uppercase ml-1">Listings on hold</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            {/* Email */}
                            <td className="px-5 py-4 text-xs text-on-surface-variant">{user.email}</td>
                            {/* Role */}
                            <td className="px-5 py-4">
                              <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${ROLE_BADGE[effectiveRole(user)] ?? "bg-surface-container text-on-surface-variant"}`}>
                                {effectiveRole(user)}
                              </span>
                            </td>
                            {/* Host Status */}
                            <td className="px-5 py-4">
                              {user.hostStatus && user.hostStatus !== "none" ? (
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${HOST_BADGE[user.hostStatus] ?? ""}`}>
                                  {user.hostStatus}
                                </span>
                              ) : (
                                <span className="text-xs text-outline-variant">N/A</span>
                              )}
                            </td>
                            {/* Verified */}
                            <td className="px-5 py-4 text-center">
                              <CheckCircle
                                className={`inline h-[18px] w-[18px] ${user.isVerified ? "text-primary fill-primary" : "text-outline-variant"}`}
                              />
                            </td>
                            {/* Provider */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5">
                                <ProviderIcon p={providerIconKey(user)} />
                                <span className="text-xs text-on-surface-variant">{loginMethodLabel(user)}</span>
                              </div>
                            </td>
                            {/* Joined */}
                            <td className="px-5 py-4 text-xs text-on-surface-variant font-medium whitespace-nowrap">
                              {formatUserDate(user.createdAt, user._id)}
                            </td>
                            {/* Actions ⋮ */}
                            <td
                              className="px-5 py-4 text-right relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)}
                                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openMenu === user._id && (
                                <ActionMenu
                                  user={user}
                                  canSuspend={
                                    user.role !== "admin" &&
                                    user._id !== currentUser?._id
                                  }
                                  canManageHostListings={
                                    user.hostStatus === "approved" &&
                                    user.role !== "admin" &&
                                    user._id !== currentUser?._id
                                  }
                                  onSuspend={(u) => { setDrawerUser(null); setSuspendTarget(u); }}
                                  onDelete={(u) => { setDrawerUser(null); setDeleteTarget(u); }}
                                  onSuspendHostListings={(u) => {
                                    setDrawerUser(null);
                                    setHostListingSuspendTarget(u);
                                  }}
                                  onReinstateHostListings={(u) => {
                                    setDrawerUser(null);
                                    setHostListingReinstateTarget(u);
                                  }}
                                  onClose={() => setOpenMenu(null)}
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="bg-surface-container-low/30 px-5 py-3.5 flex items-center justify-between border-t border-surface-container">
                    <p className="text-xs text-on-surface-variant font-medium">
                      Showing <span className="font-bold text-primary">
                        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalUsers)}
                      </span> of {totalUsers} users
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-lg text-on-surface-variant disabled:opacity-30 hover:bg-surface-container transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                        .reduce<(number | "…")[]>((acc, n, i, arr) => {
                          if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                          acc.push(n);
                          return acc;
                        }, [])
                        .map((item, idx) =>
                          item === "…" ? (
                            <span key={`e-${idx}`} className="text-xs text-outline-variant px-1">…</span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => setPage(item as number)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${page === item
                                ? "bg-primary text-white"
                                : "text-primary hover:bg-surface-container"
                                }`}
                            >
                              {item}
                            </button>
                          )
                        )}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || totalPages === 0}
                        className="p-1.5 rounded-lg text-primary disabled:opacity-30 hover:bg-surface-container transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Click-outside to close action menu — rendered BEFORE dialogs so dialogs appear on top */}
      {openMenu && <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />}

      {/* Drawer — hidden when a confirm dialog is open */}
      {drawerUser && !suspendTarget && !deleteTarget && !hostListingSuspendTarget && !hostListingReinstateTarget && (
        <UserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} />
      )}

      {/* Suspend / reinstate — z-[100] always above drawer z-[60] */}
      {suspendTarget && suspendTarget.active === false && (
        <ConfirmDialog
          title="Reinstate Account"
          message={`Reinstate access for ${suspendTarget.name}? They'll be able to log in again and will be notified by email if SMTP is configured.`}
          confirmLabel="Reinstate"
          confirmClass="bg-primary"
          loading={reinstateMutation.isPending}
          onConfirm={() => reinstateMutation.mutate(suspendTarget._id)}
          onClose={() => setSuspendTarget(null)}
        />
      )}
      {suspendTarget && suspendTarget.active !== false && (
        <SuspendUserDialog
          user={suspendTarget}
          loading={suspendMutation.isPending}
          onConfirm={(reason) =>
            suspendMutation.mutate({
              id: suspendTarget._id,
              reason: reason || undefined,
            })
          }
          onClose={() => setSuspendTarget(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Account"
          message={`Permanently delete ${deleteTarget.name}'s account? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="bg-red-600"
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {hostListingSuspendTarget && (
        <SuspendHostListingsDialog
          user={hostListingSuspendTarget}
          loading={suspendHostListingsMutation.isPending}
          onClose={() => setHostListingSuspendTarget(null)}
          onConfirm={(reason) =>
            suspendHostListingsMutation.mutate({
              id: hostListingSuspendTarget._id,
              reason: reason || undefined,
            })
          }
        />
      )}

      {hostListingReinstateTarget && (
        <ConfirmDialog
          title="Reinstate host listings"
          message={`Allow ${hostListingReinstateTarget.name} to create and edit experiences again? They will be notified by email if SMTP is configured.`}
          confirmLabel="Reinstate"
          confirmClass="bg-emerald-600"
          loading={reinstateHostListingsMutation.isPending}
          onConfirm={() => reinstateHostListingsMutation.mutate(hostListingReinstateTarget._id)}
          onClose={() => setHostListingReinstateTarget(null)}
        />
      )}

      {/* Badge */}
      <div className="fixed bottom-6 right-6 z-30 pointer-events-none">
        <div className="bg-tertiary-container text-on-tertiary-fixed px-3 py-1.5 rounded-full shadow-lg border border-tertiary-fixed/20 flex items-center gap-1.5">
          <Leaf className="h-3 w-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Endebeto Authentic Admin</span>
        </div>
      </div>
    </AdminLayout>
  );
}
