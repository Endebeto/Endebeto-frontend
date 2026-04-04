import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, CheckCircle, MoreVertical,
  ChevronLeft, ChevronRight, Leaf, Mail,
  X, Ban, Trash2, Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { adminService, type AdminUser } from "@/services/admin.service";

/* ─── types ─────────────────────────────────────────────── */
type Role       = "admin" | "host" | "user";
type HostStatus = "approved" | "pending" | "rejected" | null;
type Provider   = "email" | "google" | "facebook";

/* ─── badge helpers ─────────────────────────────────────── */
const ROLE_BADGE: Record<Role, string> = {
  admin: "bg-primary text-white",
  host:  "bg-secondary-container text-on-secondary-container",
  user:  "bg-surface-container text-on-surface-variant",
};
const HOST_BADGE: Record<string, string> = {
  approved: "bg-tertiary-fixed text-on-tertiary-fixed",
  pending:  "bg-surface-variant text-outline",
  rejected: "bg-red-100 text-red-700",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

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
  if (p === "google")   return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
  if (p === "facebook") return (
    <svg className="h-3.5 w-3.5" fill="#1877F2" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#2d3133] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <h3 className="font-headline font-extrabold text-lg text-primary mb-1">{title}</h3>
        <p className="text-sm text-on-surface-variant mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
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
    </div>
  );
}

/* ─── action menu ───────────────────────────────────────── */
function ActionMenu({
  user, onSuspend, onDelete, onClose,
}: {
  user: AdminUser;
  onSuspend: (u: AdminUser) => void;
  onDelete:  (u: AdminUser) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-4 top-full mt-1 z-50 w-44 bg-white dark:bg-[#2d3133] rounded-xl shadow-xl border border-outline-variant/20 py-1 overflow-hidden">
      <button
        onClick={() => { onSuspend(user); onClose(); }}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
      >
        <Ban className="h-3.5 w-3.5" /> {user.active === false ? "Restore Account" : "Suspend User"}
      </button>
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

/* ─── user detail drawer ─────────────────────────────────── */
function UserDrawer({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <aside className="w-96 h-full bg-white dark:bg-[#2d3133] shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
          <h3 className="font-headline font-extrabold text-base text-primary">User Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col items-center py-8 px-6 border-b border-outline-variant/10">
          {user.photo ? (
            <img src={user.photo} alt={user.name} className="w-20 h-20 rounded-2xl object-cover shadow-md mb-4" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-secondary-container flex items-center justify-center font-headline font-black text-3xl text-on-secondary-container shadow-md mb-4">
              {initials(user.name)}
            </div>
          )}
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
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: "Login method", value: loginMethodLabel(user) },
            { label: "Verified",     value: user.isVerified ? "Yes" : "No" },
            { label: "Member Since", value: formatUserDate(user.createdAt, user._id) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-outline-variant/10 last:border-none">
              <span className="text-xs text-on-surface-variant font-medium">{label}</span>
              <span className="text-xs font-bold text-on-surface">{value}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────── */
const PAGE_SIZE = 10;

export default function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [openMenu, setOpenMenu]       = useState<string | null>(null);
  const [drawerUser, setDrawerUser]   = useState<AdminUser | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<AdminUser | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () =>
      adminService.getUsers({ page, limit: PAGE_SIZE, search: search || undefined })
        .then(r => r.data),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const users: AdminUser[] = data?.data?.data ?? [];
  const totalUsers = data?.results ?? 0;
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  const suspendMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminService.updateUser(id, { active }),
    onSuccess: () => {
      const msg = suspendTarget?.active === false ? "Account restored" : "Account suspended";
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setSuspendTarget(null);
    },
    onError: () => toast.error("Failed to update user"),
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
                    <Users className="h-7 w-7 text-outline-variant" />
                  </div>
                  <p className="font-headline font-bold text-base text-primary mb-1">No users found</p>
                  <p className="text-xs text-on-surface-variant max-w-xs">
                    No users match your current search. Try adjusting your terms.
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
                            className={`hover:bg-surface-container-low transition-colors group cursor-pointer ${user.active === false ? "opacity-50" : ""}`}
                            onClick={() => setDrawerUser(user)}
                          >
                            {/* Name */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                {user.photo ? (
                                  <img src={user.photo} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container shrink-0">
                                    {initials(user.name)}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-bold text-primary leading-none">{user.name}</p>
                                  {user.active === false && (
                                    <span className="text-[9px] text-red-500 font-bold uppercase">Suspended</span>
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
                                  onSuspend={(u) => setSuspendTarget(u)}
                                  onDelete={(u)  => setDeleteTarget(u)}
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
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                                page === item
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

      {/* Drawer */}
      {drawerUser && <UserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} />}

      {/* Suspend confirm */}
      {suspendTarget && (
        <ConfirmDialog
          title={suspendTarget.active === false ? "Restore Account" : "Suspend Account"}
          message={suspendTarget.active === false
            ? `Restore access for ${suspendTarget.name}?`
            : `Suspend ${suspendTarget.name}? They will lose access to the platform.`}
          confirmLabel={suspendTarget.active === false ? "Restore" : "Suspend"}
          confirmClass={suspendTarget.active === false ? "bg-primary" : "bg-amber-600"}
          loading={suspendMutation.isPending}
          onConfirm={() => suspendMutation.mutate({ id: suspendTarget._id, active: suspendTarget.active === false })}
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

      {/* Click-outside to close action menu */}
      {openMenu && <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />}

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
