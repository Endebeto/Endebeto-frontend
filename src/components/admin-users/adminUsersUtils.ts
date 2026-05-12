import type { AdminUser } from "@/services/admin.service";

export type StatusFilter = "all" | "active" | "suspended";

export type AdminUserRole = "admin" | "host" | "user";

export const PAGE_SIZE = 10;

export const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All Users" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
];

export const ROLE_BADGE: Record<AdminUserRole, string> = {
  admin: "bg-primary text-white",
  host: "bg-secondary-container text-on-secondary-container",
  user: "bg-surface-container text-on-surface-variant",
};

export const HOST_BADGE: Record<string, string> = {
  approved: "bg-tertiary-fixed text-on-tertiary-fixed",
  pending: "bg-surface-variant text-outline",
  rejected: "bg-red-100 text-red-700",
};

export function authProviderRaw(u: AdminUser): string {
  return (u.authProvider ?? u.provider ?? "local").toLowerCase();
}

export function loginMethodLabel(u: AdminUser): string {
  if (u.googleId) return "Google";
  if (u.facebookId) return "Facebook (legacy)";
  const p = authProviderRaw(u);
  if (p === "google") return "Google";
  if (p === "facebook") return "Facebook (legacy)";
  return "Email & password";
}

export function providerIconKey(u: AdminUser): string {
  if (u.googleId) return "google";
  if (u.facebookId) return "legacy-oauth";
  const p = authProviderRaw(u);
  if (p === "facebook") return "legacy-oauth";
  return p;
}

export function formatUserDate(iso?: string | null, userId?: string): string {
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

export function effectiveRole(u: AdminUser): AdminUserRole {
  if (u.hostStatus === "approved") return "host";
  if (u.role === "admin") return "admin";
  return "user";
}
