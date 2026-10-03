import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CATALOG_PAGE_SIZE,
  type TabKey,
} from "@/components/admin-experiences/experienceAdminUtils";
import { adminQueryKeys } from "@/lib/adminQueryKeys";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { normalizeApiList } from "@/lib/normalizeApiList";
import { adminService, type AdminExperience } from "@/services/admin.service";

export function useAdminExperiences() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch =
    searchParams.get("search") || searchParams.get("q") || "";
  const [tab, setTab] = useState<TabKey>("live");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const searchEffectSkipMount = useRef(!initialSearch);
  const [selected, setSelected] = useState<AdminExperience | null>(null);
  const [suspendModalExp, setSuspendModalExp] =
    useState<AdminExperience | null>(null);

  useEffect(() => {
    const urlQuery = searchParams.get("search") || searchParams.get("q") || "";
    setSearch((prev) => {
      if (prev !== urlQuery) {
        setSearchInput(urlQuery);
        setPage(1);
        return urlQuery;
      }
      return prev;
    });
  }, [searchParams]);

  useEffect(() => {
    if (searchEffectSkipMount.current) {
      searchEffectSkipMount.current = false;
      return;
    }
    const t = setTimeout(() => {
      const trimmed = searchInput.trim();
      setSearch(trimmed);
      setPage(1);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
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
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, setSearchParams]);

  const {
    data: catalogData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: adminQueryKeys.experiencesCatalog({
      tab,
      page,
      search: search.trim(),
    }),
    queryFn: () =>
      adminService
        .getAdminCatalog(tab, {
          page,
          limit: CATALOG_PAGE_SIZE,
          ...(search.trim() ? { search: search.trim() } : {}),
        })
        .then((r) => {
          const normalized = normalizeApiList<AdminExperience>(r.data);
          return {
            items: normalized.items,
            total: normalized.total,
            pages: r.data.pages ?? 1,
            page: r.data.page ?? page,
          };
        }),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.suspendExperience(id, reason),
    onSuccess: (res) => {
      const notifications = res.data.data.notifications;
      if (notifications?.emailConfigured) {
        const g = notifications.guestsEmailed ?? 0;
        const guestsPart = g
          ? ` Including up to ${g} guest booking${g === 1 ? "" : "s"}.`
          : "";
        toast.success(
          `Listing suspended. Email notifications are being sent.${guestsPart}`,
        );
      } else {
        toast.success(
          "Listing suspended. Email notifications skipped — SMTP not configured.",
        );
      }
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.experiencesCatalogPrefix,
      });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.statsPrefix });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.experienceDetailPrefix,
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.experienceBookingsPrefix,
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.activityFeedPrefix,
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.auditLogsPrefix,
      });
      setSuspendModalExp(null);
      setSelected(null);
    },
    onError: (err: unknown) => {
      toast.error(getFriendlyErrorMessage(err, "Could not suspend."));
    },
  });

  const reinstateMutation = useMutation({
    mutationFn: (id: string) => adminService.reinstateExperience(id),
    onSuccess: (res) => {
      const notifications = res.data.data.notifications;
      if (notifications?.emailConfigured) {
        const g = notifications.guestsEmailed ?? 0;
        const guestsPart = g
          ? ` Up to ${g} guest${g === 1 ? "" : "s"} will be emailed.`
          : "";
        toast.success(`Listing reinstated.${guestsPart}`);
      } else {
        toast.success(
          "Listing reinstated. Email notifications skipped — SMTP not configured.",
        );
      }
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.experiencesCatalogPrefix,
      });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.statsPrefix });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.experienceDetailPrefix,
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.experienceBookingsPrefix,
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.activityFeedPrefix,
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.auditLogsPrefix,
      });
      setSelected(null);
    },
    onError: (err: unknown) => {
      toast.error(getFriendlyErrorMessage(err, "Could not reinstate."));
    },
  });

  const experiences = catalogData?.items ?? [];
  const catalogTotal = catalogData?.total ?? 0;
  const catalogPages = catalogData?.pages ?? 1;
  const catalogPage = catalogData?.page ?? page;

  const handleSearch = (v: string) => {
    setSearchInput(v);
    setSelected(null);
  };

  const handleSearchImmediate = (v: string) => {
    const trimmed = v.trim();
    setSearchInput(v);
    setSearch(trimmed);
    setPage(1);
    setSelected(null);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
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
  };

  return {
    tab,
    setTab,
    page,
    setPage,
    searchInput,
    search,
    handleSearch,
    handleSearchImmediate,
    selected,
    setSelected,
    suspendModalExp,
    setSuspendModalExp,
    experiences,
    catalogTotal,
    catalogPages,
    catalogPage,
    isLoading,
    isError,
    suspendMutation,
    reinstateMutation,
  };
}
