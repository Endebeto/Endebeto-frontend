import { Leaf } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { AdminUserDrawer } from "@/components/admin-users/AdminUserDrawer";
import { AdminUsersConfirmDialog } from "@/components/admin-users/AdminUsersConfirmDialog";
import { AdminUsersPageHeader } from "@/components/admin-users/AdminUsersPageHeader";
import { AdminUsersTableCard } from "@/components/admin-users/AdminUsersTableCard";
import { SuspendHostListingsDialog } from "@/components/admin-users/SuspendHostListingsDialog";
import { SuspendUserDialog } from "@/components/admin-users/SuspendUserDialog";
import { useAdminUsers } from "@/hooks/useAdminUsers";

export default function AdminUsers() {
  const admin = useAdminUsers();

  return (
    <AdminLayout
      searchPlaceholder="Search users by name or email..."
      searchValue={admin.search}
      onSearch={admin.onSearch}
    >
      <div className="flex-1 overflow-y-auto">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <AdminUsersPageHeader
              statusFilter={admin.statusFilter}
              onStatusChange={(k) => {
                admin.setStatusFilter(k);
                admin.setPage(1);
              }}
            />

            <AdminUsersTableCard admin={admin} />
          </div>
        </main>
      </div>

      {admin.openMenu && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default border-0 bg-transparent"
          aria-label="Close menu"
          onClick={() => admin.setOpenMenu(null)}
        />
      )}

      {admin.drawerUser &&
        !admin.suspendTarget &&
        !admin.deleteTarget &&
        !admin.hostListingSuspendTarget &&
        !admin.hostListingReinstateTarget && (
          <AdminUserDrawer
            user={admin.drawerUser}
            onClose={() => admin.setDrawerUser(null)}
          />
        )}

      {admin.suspendTarget && admin.suspendTarget.active === false && (
        <AdminUsersConfirmDialog
          title="Reinstate Account"
          message={`Reinstate access for ${admin.suspendTarget.name}? They'll be able to log in again and will be notified by email if SMTP is configured.`}
          confirmLabel="Reinstate"
          confirmClass="bg-primary"
          loading={admin.reinstateMutation.isPending}
          onConfirm={() => admin.reinstateMutation.mutate(admin.suspendTarget!._id)}
          onClose={() => admin.setSuspendTarget(null)}
        />
      )}
      {admin.suspendTarget && admin.suspendTarget.active !== false && (
        <SuspendUserDialog
          user={admin.suspendTarget}
          loading={admin.suspendMutation.isPending}
          onConfirm={(reason) =>
            admin.suspendMutation.mutate({
              id: admin.suspendTarget!._id,
              reason: reason || undefined,
            })
          }
          onClose={() => admin.setSuspendTarget(null)}
        />
      )}

      {admin.deleteTarget && (
        <AdminUsersConfirmDialog
          title="Delete Account"
          message={`Permanently delete ${admin.deleteTarget.name}'s account? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="bg-red-600"
          loading={admin.deleteMutation.isPending}
          onConfirm={() => admin.deleteMutation.mutate(admin.deleteTarget!._id)}
          onClose={() => admin.setDeleteTarget(null)}
        />
      )}

      {admin.hostListingSuspendTarget && (
        <SuspendHostListingsDialog
          user={admin.hostListingSuspendTarget}
          loading={admin.suspendHostListingsMutation.isPending}
          onClose={() => admin.setHostListingSuspendTarget(null)}
          onConfirm={(reason) =>
            admin.suspendHostListingsMutation.mutate({
              id: admin.hostListingSuspendTarget!._id,
              reason: reason || undefined,
            })
          }
        />
      )}

      {admin.hostListingReinstateTarget && (
        <AdminUsersConfirmDialog
          title="Reinstate host listings"
          message={`Allow ${admin.hostListingReinstateTarget.name} to create and edit experiences again? They will be notified by email if SMTP is configured.`}
          confirmLabel="Reinstate"
          confirmClass="bg-emerald-600"
          loading={admin.reinstateHostListingsMutation.isPending}
          onConfirm={() =>
            admin.reinstateHostListingsMutation.mutate(
              admin.hostListingReinstateTarget!._id,
            )
          }
          onClose={() => admin.setHostListingReinstateTarget(null)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-30 pointer-events-none">
        <div className="bg-tertiary-container text-on-tertiary-fixed px-3 py-1.5 rounded-full shadow-lg border border-tertiary-fixed/20 flex items-center gap-1.5">
          <Leaf className="h-3 w-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest">
            Endebeto Authentic Admin
          </span>
        </div>
      </div>
    </AdminLayout>
  );
}
