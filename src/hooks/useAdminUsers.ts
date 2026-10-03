import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PAGE_SIZE,
  type StatusFilter,
} from "@/components/admin-users/adminUsersUtils";
import { useAuth } from "@/context/AuthContext";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { adminQueryKeys } from "@/lib/adminQueryKeys";
import { adminService, type AdminUser } from "@/services/admin.service";

export function useAdminUsers() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch =
    searchParams.get("search") || searchParams.get("q") || "";
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const urlQuery = searchParams.get("search") || searchParams.get("q") || "";
    setSearch((prev) => {
      if (prev !== urlQuery) {
        setPage(1);
        return urlQuery;
      }
      return prev;
    });
  }, [searchParams]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerUser, setDrawerUser] = useState<AdminUser | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [hostListingSuspendTarget, setHostListingSuspendTarget] =
    useState<AdminUser | null>(null);
  const [hostListingReinstateTarget, setHostListingReinstateTarget] =
    useState<AdminUser | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.users({ page, search, statusFilter }),
    queryFn: () =>
      adminService
        .getUsers({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          status: statusFilter,
        })
        .then((r) => r.data),
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
      const { emailConfigured, userEmailed, emailQueued } =
        res.data.data.notifications;
      const willNotify = Boolean(userEmailed || emailQueued);
      if (emailConfigured && willNotify) {
        toast.success("Account suspended. Email notification is being sent.");
      } else if (emailConfigured) {
        toast.success(
          "Account suspended. Email notification could not be delivered.",
        );
      } else {
        toast.success(
          "Account suspended. Email notifications skipped — SMTP not configured.",
        );
      }
      qc.invalidateQueries({ queryKey: adminQueryKeys.usersPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.statsPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.activityFeedPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.auditLogsPrefix });
      setSuspendTarget(null);
    },
    onError: (err: unknown) => {
      toast.error(getFriendlyErrorMessage(err, "Failed to suspend user"));
    },
  });

  const reinstateMutation = useMutation({
    mutationFn: (id: string) => adminService.reinstateUser(id),
    onSuccess: (res) => {
      const { emailConfigured, userEmailed, emailQueued } =
        res.data.data.notifications;
      const willNotify = Boolean(userEmailed || emailQueued);
      if (emailConfigured && willNotify) {
        toast.success("Account reinstated. Email notification is being sent.");
      } else if (emailConfigured) {
        toast.success(
          "Account reinstated. Email notification could not be delivered.",
        );
      } else {
        toast.success(
          "Account reinstated. Email notifications skipped — SMTP not configured.",
        );
      }
      qc.invalidateQueries({ queryKey: adminQueryKeys.usersPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.statsPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.activityFeedPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.auditLogsPrefix });
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
      qc.invalidateQueries({ queryKey: adminQueryKeys.usersPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.statsPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.activityFeedPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.auditLogsPrefix });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const suspendHostListingsMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminService.suspendHostListings(id, reason),
    onSuccess: (res) => {
      const { emailConfigured, userEmailed, emailQueued } =
        res.data.data.notifications;
      const willNotify = Boolean(userEmailed || emailQueued);
      if (emailConfigured && willNotify) {
        toast.success(
          "Host listing access suspended. Email notification is being sent.",
        );
      } else if (emailConfigured) {
        toast.success(
          "Host listing access suspended. Email may not have been delivered.",
        );
      } else {
        toast.success(
          "Host listing access suspended. Email notifications skipped — SMTP not configured.",
        );
      }
      qc.invalidateQueries({ queryKey: adminQueryKeys.usersPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.activityFeedPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.auditLogsPrefix });
      setHostListingSuspendTarget(null);
    },
    onError: (err: unknown) => {
      toast.error(
        getFriendlyErrorMessage(err, "Failed to suspend host listings"),
      );
    },
  });

  const reinstateHostListingsMutation = useMutation({
    mutationFn: (id: string) => adminService.reinstateHostListings(id),
    onSuccess: (res) => {
      const { emailConfigured, userEmailed, emailQueued } =
        res.data.data.notifications;
      if (emailConfigured && (userEmailed || emailQueued)) {
        toast.success(
          "Host listings reinstated. Email notification is being sent.",
        );
      } else {
        toast.success("Host listings reinstated.");
      }
      qc.invalidateQueries({ queryKey: adminQueryKeys.usersPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.activityFeedPrefix });
      qc.invalidateQueries({ queryKey: adminQueryKeys.auditLogsPrefix });
      setHostListingReinstateTarget(null);
    },
    onError: (err: unknown) => {
      toast.error(
        getFriendlyErrorMessage(err, "Failed to reinstate host listings"),
      );
    },
  });

  const onSearch = useCallback(
    (v: string) => {
      setSearch(v);
      setPage(1);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = v.trim();
          if (trimmed) {
            next.set("search", trimmed);
          } else {
            next.delete("search");
            next.delete("q");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return {
    currentUser,
    search,
    setSearch,
    onSearch,
    onSearchImmediate: onSearch,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    openMenu,
    setOpenMenu,
    drawerUser,
    setDrawerUser,
    suspendTarget,
    setSuspendTarget,
    deleteTarget,
    setDeleteTarget,
    hostListingSuspendTarget,
    setHostListingSuspendTarget,
    hostListingReinstateTarget,
    setHostListingReinstateTarget,
    users,
    isLoading,
    isError,
    totalUsers,
    totalPages,
    suspendMutation,
    reinstateMutation,
    deleteMutation,
    suspendHostListingsMutation,
    reinstateHostListingsMutation,
  };
}

export type UseAdminUsersReturn = ReturnType<typeof useAdminUsers>;
