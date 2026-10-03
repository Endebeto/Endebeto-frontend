import { Suspense, useCallback, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import type {
  AdminHeaderState,
  AdminOutletContextType,
} from "@/hooks/useSyncAdminHeader";
import { RouteMainFallback } from "@/components/RouteMainFallback";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AdminRouteLayout() {
  const [header, setHeader] = useState<AdminHeaderState | null>(null);

  const setHeaderSafe = useCallback(
    (
      next:
        | AdminHeaderState
        | null
        | ((prev: AdminHeaderState | null) => AdminHeaderState | null),
    ) => {
      setHeader((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        if (!prev && !resolved) return prev;
        if (
          prev &&
          resolved &&
          prev.searchPlaceholder === resolved.searchPlaceholder &&
          prev.searchValue === resolved.searchValue &&
          prev.onSearch === resolved.onSearch &&
          prev.onSearchImmediate === resolved.onSearchImmediate
        ) {
          return prev;
        }
        return resolved;
      });
    },
    [],
  );

  const outletCtx = useMemo<AdminOutletContextType>(
    () => ({ setHeader: setHeaderSafe }),
    [setHeaderSafe],
  );

  return (
    <AdminLayout
      searchPlaceholder={header?.searchPlaceholder ?? "Search..."}
      searchValue={header?.searchValue ?? ""}
      onSearch={header?.onSearch}
      onSearchImmediate={header?.onSearchImmediate}
    >
      <ErrorBoundary scope="Admin Portal">
        <Suspense fallback={<RouteMainFallback />}>
          <Outlet context={outletCtx} />
        </Suspense>
      </ErrorBoundary>
    </AdminLayout>
  );
}
