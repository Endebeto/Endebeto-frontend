import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreVertical,
  ShieldOff,
  Users,
} from "lucide-react";
import { AdminUsersActionMenu } from "@/components/admin-users/AdminUsersActionMenu";
import { AdminUsersProviderIcon } from "@/components/admin-users/AdminUsersProviderIcon";
import {
  effectiveRole,
  formatUserDate,
  HOST_BADGE,
  loginMethodLabel,
  PAGE_SIZE,
  providerIconKey,
  ROLE_BADGE,
  type StatusFilter,
} from "@/components/admin-users/adminUsersUtils";
import { UserAvatar } from "@/components/UserAvatar";
import type { UseAdminUsersReturn } from "@/hooks/useAdminUsers";

export function AdminUsersTableCard({
  admin,
}: {
  admin: UseAdminUsersReturn;
}) {
  const {
    currentUser,
    search,
    setSearch,
    page,
    setPage,
    statusFilter,
    openMenu,
    setOpenMenu,
    setDrawerUser,
    setSuspendTarget,
    setDeleteTarget,
    setHostListingSuspendTarget,
    setHostListingReinstateTarget,
    users,
    isLoading,
    isError,
    totalUsers,
    totalPages,
  } = admin;

  return (
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
        <AdminUsersEmptyState
          statusFilter={statusFilter}
          search={search}
          setSearch={setSearch}
          setPage={setPage}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  {["Name", "Email", "Role", "Host Status", "Verified", "Provider", "Joined", ""].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3.5 text-[9px] font-bold uppercase tracking-widest text-primary ${i === 7 ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                    onClick={() => {
                      if (!openMenu) setDrawerUser(user);
                    }}
                  >
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
                            <span className="text-[9px] text-red-500 font-bold uppercase">
                              Suspended
                            </span>
                          )}
                          {user.hostStatus === "approved" && user.hostListingSuspended && (
                            <span className="text-[9px] text-amber-700 font-bold uppercase ml-1">
                              Listings on hold
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant">{user.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${ROLE_BADGE[effectiveRole(user)] ?? "bg-surface-container text-on-surface-variant"}`}
                      >
                        {effectiveRole(user)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.hostStatus && user.hostStatus !== "none" ? (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${HOST_BADGE[user.hostStatus] ?? ""}`}
                        >
                          {user.hostStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-outline-variant">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <CheckCircle
                        className={`inline h-[18px] w-[18px] ${user.isVerified ? "text-primary fill-primary" : "text-outline-variant"}`}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <AdminUsersProviderIcon p={providerIconKey(user)} />
                        <span className="text-xs text-on-surface-variant">
                          {loginMethodLabel(user)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant font-medium whitespace-nowrap">
                      {formatUserDate(user.createdAt, user._id)}
                    </td>
                    <td
                      className="px-5 py-4 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(openMenu === user._id ? null : user._id)
                        }
                        className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === user._id && (
                        <AdminUsersActionMenu
                          user={user}
                          canSuspend={
                            user.role !== "admin" && user._id !== currentUser?._id
                          }
                          canManageHostListings={
                            user.hostStatus === "approved" &&
                            user.role !== "admin" &&
                            user._id !== currentUser?._id
                          }
                          onSuspend={(u) => {
                            setDrawerUser(null);
                            setSuspendTarget(u);
                          }}
                          onDelete={(u) => {
                            setDrawerUser(null);
                            setDeleteTarget(u);
                          }}
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

          <div className="bg-surface-container-low/30 px-5 py-3.5 flex items-center justify-between border-t border-surface-container">
            <p className="text-xs text-on-surface-variant font-medium">
              Showing{" "}
              <span className="font-bold text-primary">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalUsers)}
              </span>{" "}
              of {totalUsers} users
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
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
                    <span key={`e-${idx}`} className="text-xs text-outline-variant px-1">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item as number)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                        page === item
                          ? "bg-primary text-white"
                          : "text-primary hover:bg-surface-container"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              <button
                type="button"
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
  );
}

function AdminUsersEmptyState({
  statusFilter,
  search,
  setSearch,
  setPage,
}: {
  statusFilter: StatusFilter;
  search: string;
  setSearch: (s: string) => void;
  setPage: (p: number | ((n: number) => number)) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
        {statusFilter === "suspended" ? (
          <ShieldOff className="h-7 w-7 text-outline-variant" />
        ) : (
          <Users className="h-7 w-7 text-outline-variant" />
        )}
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
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setPage(1);
          }}
          className="mt-5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90"
        >
          Clear search
        </button>
      )}
    </div>
  );
}
