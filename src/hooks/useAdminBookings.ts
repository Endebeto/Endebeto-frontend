import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { adminQueryKeys } from "@/lib/adminQueryKeys";
import {
  adminService,
  type AdminPlatformBooking,
  type AdminBookingsSummary,
} from "@/services/admin.service";

export type AdminBookingStatusFilter =
  | "all"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "paymentExpired";

export const BOOKING_PAGE_SIZE = 10;

export function useAdminBookings() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] =
    useState<AdminBookingStatusFilter>("all");
  const [selectedBooking, setSelectedBooking] =
    useState<AdminPlatformBooking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AdminPlatformBooking | null>(
    null,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: adminQueryKeys.allBookings({
      page,
      status: statusFilter,
      search: debouncedSearch,
    }),
    queryFn: () =>
      adminService
        .getAllBookings({
          page,
          limit: BOOKING_PAGE_SIZE,
          status: statusFilter === "all" ? undefined : statusFilter,
          q: debouncedSearch.trim() || undefined,
        })
        .then((r) => r.data),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const bookings: AdminPlatformBooking[] = data?.data ?? [];
  const totalBookings = data?.total ?? 0;
  const totalPages =
    data?.pages ?? Math.max(1, Math.ceil(totalBookings / BOOKING_PAGE_SIZE));
  const summary: AdminBookingsSummary = data?.summary ?? {
    totalBookings: data?.total ?? bookings.length,
    totalRevenue: bookings
      .filter((b) => b.paid)
      .reduce((sum, b) => sum + (b.price || 0), 0),
    filteredRevenue: 0,
    upcoming: bookings.filter((b) => b.status === "upcoming").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    paymentExpired: bookings.filter(
      (b) =>
        b.status === "paymentExpired" || (b.status as string) === "expired",
    ).length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const cancelMutation = useMutation({
    mutationFn: (id: string) => adminService.cancelBooking(id),
    onSuccess: () => {
      toast.success("Booking cancelled successfully.");
      qc.invalidateQueries({ queryKey: adminQueryKeys.allBookingsPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.statsPrefix });
      setCancelTarget(null);
      if (selectedBooking) {
        setSelectedBooking((prev) =>
          prev ? { ...prev, status: "cancelled" } : null,
        );
      }
    },
    onError: (err) => {
      toast.error(getFriendlyErrorMessage(err, "Could not cancel booking"));
    },
  });

  const onSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onSearchImmediate = useCallback((value: string) => {
    setSearch(value);
    setDebouncedSearch(value);
    setPage(1);
  }, []);

  const onStatusChange = useCallback((status: AdminBookingStatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  return {
    search,
    onSearch,
    onSearchImmediate,
    page,
    setPage,
    statusFilter,
    onStatusChange,
    selectedBooking,
    setSelectedBooking,
    cancelTarget,
    setCancelTarget,
    bookings,
    totalBookings,
    totalPages,
    summary,
    isLoading,
    isError,
    refetch,
    cancelMutation,
  };
}
