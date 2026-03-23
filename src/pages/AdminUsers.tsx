import { useState } from "react";
import {
  Users, Download, UserPlus, CheckCircle, MoreVertical,
  ChevronLeft, ChevronRight, Shield, Leaf, Mail, Globe,
  X, Edit3, Ban, Trash2,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

/* ─── types ─────────────────────────────────────────────── */
type Role       = "admin" | "host" | "user";
type HostStatus = "approved" | "pending" | "rejected" | null;
type Provider   = "email" | "google" | "facebook";

interface User {
  id: string; uid: string; name: string; email: string;
  role: Role; hostStatus: HostStatus; verified: boolean;
  provider: Provider; created: string;
}

/* ─── mock data ─────────────────────────────────────────── */
const mockUsers: User[] = [
  { id: "1", uid: "EB-2024-001", name: "Abebe Bikila",     email: "abebe.b@gmail.com",    role: "admin",  hostStatus: null,       verified: true,  provider: "email",    created: "Oct 12, 2023" },
  { id: "2", uid: "EB-2024-045", name: "Selamawit Tadesse",email: "selam.t@outlook.com",  role: "host",   hostStatus: "approved", verified: true,  provider: "google",   created: "Jan 04, 2024" },
  { id: "3", uid: "EB-2024-098", name: "Tesfaye Alemu",    email: "t.alemu@yahoo.com",    role: "user",   hostStatus: "pending",  verified: false, provider: "facebook", created: "Feb 15, 2024" },
  { id: "4", uid: "EB-2024-112", name: "Tigist Haile",     email: "tigist.h@proton.me",   role: "host",   hostStatus: "approved", verified: true,  provider: "email",    created: "Mar 02, 2024" },
  { id: "5", uid: "EB-2024-130", name: "Bereket Mesfin",   email: "bereket.m@gmail.com",  role: "user",   hostStatus: "rejected", verified: true,  provider: "google",   created: "Mar 19, 2024" },
  { id: "6", uid: "EB-2024-147", name: "Hiwot Girma",      email: "hiwot.g@gmail.com",    role: "user",   hostStatus: null,       verified: false, provider: "email",    created: "Apr 05, 2024" },
  { id: "7", uid: "EB-2024-163", name: "Dawit Kebede",     email: "dawit.k@yahoo.com",    role: "host",   hostStatus: "approved", verified: true,  provider: "facebook", created: "Apr 22, 2024" },
  { id: "8", uid: "EB-2024-179", name: "Almaz Bekele",     email: "almaz.bekele@live.com", role: "user",  hostStatus: null,       verified: true,  provider: "email",    created: "May 10, 2024" },
];

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

function ProviderIcon({ p }: { p: Provider }) {
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

/* ─── action menu ───────────────────────────────────────── */
function ActionMenu({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="absolute right-4 top-full mt-1 z-50 w-44 bg-white dark:bg-[#2d3133] rounded-xl shadow-xl border border-outline-variant/20 py-1 overflow-hidden">
      <button className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors">
        <Edit3 className="h-3.5 w-3.5 text-on-surface-variant" /> Edit Role
      </button>
      <button className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors">
        <Ban className="h-3.5 w-3.5" /> Suspend User
      </button>
      <div className="my-1 border-t border-outline-variant/10" />
      <button className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 className="h-3.5 w-3.5" /> Delete Account
      </button>
    </div>
  );
}

/* ─── user detail drawer ─────────────────────────────────── */
function UserDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <aside className="w-96 h-full bg-white dark:bg-[#2d3133] shadow-2xl flex flex-col overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
          <h3 className="font-headline font-extrabold text-base text-primary">User Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* avatar + name */}
        <div className="flex flex-col items-center py-8 px-6 border-b border-outline-variant/10">
          <div className="w-20 h-20 rounded-2xl bg-secondary-container flex items-center justify-center font-headline font-black text-3xl text-on-secondary-container shadow-md mb-4">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <p className="font-headline font-extrabold text-lg text-primary">{user.name}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">{user.email}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${ROLE_BADGE[user.role]}`}>
              {user.role}
            </span>
            {user.hostStatus && (
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${HOST_BADGE[user.hostStatus]}`}>
                {user.hostStatus}
              </span>
            )}
          </div>
        </div>
        {/* detail rows */}
        <div className="px-6 py-5 space-y-4">
          {[
            { label: "User ID",   value: `#${user.uid}` },
            { label: "Provider",  value: user.provider.charAt(0).toUpperCase() + user.provider.slice(1) },
            { label: "Verified",  value: user.verified ? "Yes" : "No" },
            { label: "Member Since", value: user.created },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-outline-variant/10 last:border-none">
              <span className="text-xs text-on-surface-variant font-medium">{label}</span>
              <span className="text-xs font-bold text-on-surface">{value}</span>
            </div>
          ))}
        </div>
        {/* actions */}
        <div className="px-6 pb-8 mt-auto space-y-2">
          <button className="w-full py-2.5 bg-primary text-white font-headline font-bold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-md">
            Edit User
          </button>
          <button className="w-full py-2.5 bg-surface-container text-on-surface-variant font-headline font-bold text-sm rounded-xl hover:bg-surface-container-high transition-colors">
            Suspend Account
          </button>
          <button className="w-full py-2.5 bg-red-50 text-red-600 font-headline font-bold text-sm rounded-xl hover:bg-red-100 transition-colors">
            Delete Account
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────── */
const PAGE_SIZE = 8;

export default function AdminUsers() {
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [openMenu, setOpenMenu]       = useState<string | null>(null);
  const [drawerUser, setDrawerUser]   = useState<User | null>(null);

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-surface-container-low text-primary px-4 py-2 rounded-xl font-headline font-semibold text-xs hover:bg-surface-container transition-colors">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-headline font-bold text-xs hover:opacity-90 transition-opacity shadow-md shadow-primary/20">
                  <UserPlus className="h-3.5 w-3.5" /> Create New User
                </button>
              </div>
            </div>

            {/* Stats bento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Users className="h-5 w-5 text-primary" />,  iconBg: "bg-primary/8",          label: "Total Active Users",  value: "2,842", sub: "+12%",      subColor: "text-primary" },
                { icon: <Globe className="h-5 w-5 text-secondary" />, iconBg: "bg-secondary-container/30", label: "Verified Hosts",     value: "156",   sub: "42 Pending",subColor: "text-secondary" },
                { icon: <Shield className="h-5 w-5 text-tertiary" />, iconBg: "bg-tertiary-fixed/30",  label: "Verified Accounts",   value: "94%",   sub: null,        subColor: "" },
                { icon: <Ban className="h-5 w-5 text-red-500" />,     iconBg: "bg-red-50",             label: "Flagged / Banned",    value: "18",    sub: null,        subColor: "" },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-[#2d3133] p-5 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className={`p-2 rounded-xl ${s.iconBg}`}>{s.icon}</div>
                    {s.sub && <span className={`text-xs font-bold ${s.subColor}`}>{s.sub}</span>}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-headline font-black text-primary">{s.value}</p>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#2d3133] rounded-3xl shadow-sm overflow-hidden">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
                    <Users className="h-7 w-7 text-outline-variant" />
                  </div>
                  <p className="font-headline font-bold text-base text-primary mb-1">No users found</p>
                  <p className="text-xs text-on-surface-variant max-w-xs">
                    No users match your current search. Try adjusting your terms.
                  </p>
                  <button onClick={() => setSearch("")} className="mt-5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90">
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-low/50">
                          {["Name", "Email", "Role", "Host Status", "Verified", "Provider", "Created", ""].map((h, i) => (
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
                        {paginated.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                            onClick={() => setDrawerUser(user)}
                          >
                            {/* Name */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container shrink-0">
                                  {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-primary leading-none">{user.name}</p>
                                  <p className="text-[10px] text-on-surface-variant mt-0.5">#{user.uid}</p>
                                </div>
                              </div>
                            </td>
                            {/* Email */}
                            <td className="px-5 py-4 text-xs text-on-surface-variant">{user.email}</td>
                            {/* Role */}
                            <td className="px-5 py-4">
                              <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${ROLE_BADGE[user.role]}`}>
                                {user.role}
                              </span>
                            </td>
                            {/* Host Status */}
                            <td className="px-5 py-4">
                              {user.hostStatus ? (
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${HOST_BADGE[user.hostStatus]}`}>
                                  {user.hostStatus}
                                </span>
                              ) : (
                                <span className="text-xs text-outline-variant">N/A</span>
                              )}
                            </td>
                            {/* Verified */}
                            <td className="px-5 py-4 text-center">
                              <CheckCircle
                                className={`h-4.5 w-[18px] h-[18px] inline ${user.verified ? "text-primary fill-primary" : "text-outline-variant"}`}
                              />
                            </td>
                            {/* Provider */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5">
                                <ProviderIcon p={user.provider} />
                                <span className="text-xs text-on-surface-variant capitalize">{user.provider}</span>
                              </div>
                            </td>
                            {/* Created */}
                            <td className="px-5 py-4 text-xs text-on-surface-variant font-medium whitespace-nowrap">
                              {user.created}
                            </td>
                            {/* Actions ⋮ */}
                            <td
                              className="px-5 py-4 text-right relative"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openMenu === user.id && (
                                <ActionMenu user={user} onClose={() => setOpenMenu(null)} />
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
                      Showing <span className="font-bold text-primary">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of {filtered.length} users
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
                        .map((item, i) =>
                          item === "…" ? (
                            <span key={`ellipsis-${i}`} className="text-xs text-outline-variant px-1">…</span>
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
                        disabled={page === totalPages}
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

      {/* ── User Detail Drawer ── */}
      {drawerUser && (
        <UserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} />
      )}

      {/* ── Click-outside to close action menu ── */}
      {openMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
      )}

      {/* ── Heritage badge ── */}
      <div className="fixed bottom-6 right-6 z-30 pointer-events-none">
        <div className="bg-tertiary-container text-on-tertiary-fixed px-3 py-1.5 rounded-full shadow-lg border border-tertiary-fixed/20 flex items-center gap-1.5">
          <Leaf className="h-3 w-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Endebeto Authentic Admin</span>
        </div>
      </div>
    </AdminLayout>
  );
}
