import { AdminBookingsHeader } from "@/components/admin-bookings/AdminBookingsHeader";
import { AdminBookingsTable } from "@/components/admin-bookings/AdminBookingsTable";
import { AdminBookingDrawer } from "@/components/admin-bookings/AdminBookingDrawer";
import { AdminUsersConfirmDialog } from "@/components/admin-users/AdminUsersConfirmDialog";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import { useSyncAdminHeader } from "@/hooks/useSyncAdminHeader";

export default function AdminBookings() {
  const admin = useAdminBookings();

  useSyncAdminHeader({
    searchPlaceholder: "Search txRef, guest, host, experience...",
    searchValue: admin.search,
    onSearch: admin.onSearchImmediate,
  });

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <AdminBookingsHeader
              summary={admin.summary}
              isLoading={admin.isLoading}
              activeStatus={admin.statusFilter}
              onStatusChange={admin.onStatusChange}
            />

            <AdminBookingsTable
              bookings={admin.bookings}
              isLoading={admin.isLoading}
              isError={admin.isError}
              page={admin.page}
              totalPages={admin.totalPages}
              totalBookings={admin.totalBookings}
              statusFilter={admin.statusFilter}
              search={admin.search}
              onStatusChange={admin.onStatusChange}
              onSearch={admin.onSearch}
              onSearchImmediate={admin.onSearchImmediate}
              setPage={admin.setPage}
              onSelectBooking={admin.setSelectedBooking}
              refetch={admin.refetch}
            />
          </div>
        </main>
      </div>

      {/* Booking Detail Slide-Over Drawer */}
      {admin.selectedBooking && (
        <AdminBookingDrawer
          booking={admin.selectedBooking}
          onClose={() => admin.setSelectedBooking(null)}
          onRequestCancel={(b) => admin.setCancelTarget(b)}
        />
      )}

      {/* Cancel Booking Confirmation Dialog */}
      {admin.cancelTarget && (
        <AdminUsersConfirmDialog
          title="Cancel Reservation"
          message={`Are you sure you want to cancel booking ${admin.cancelTarget.txRef || admin.cancelTarget._id} for "${admin.cancelTarget.experience?.title || "this experience"}"? This will release the reserved capacity.`}
          confirmLabel="Cancel Booking"
          confirmClass="bg-red-600 hover:bg-red-700"
          loading={admin.cancelMutation.isPending}
          onConfirm={() => admin.cancelMutation.mutate(admin.cancelTarget!._id)}
          onClose={() => admin.setCancelTarget(null)}
        />
      )}
    </>
  );
}
