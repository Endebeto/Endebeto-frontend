import { Suspense, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import type { AdminHeaderState, AdminOutletContextType } from "@/hooks/useSyncAdminHeader";
import { RouteMainFallback } from "@/components/RouteMainFallback";

export default function AdminRouteLayout() {
  const [header, setHeader] = useState<AdminHeaderState | null>(null);

  const outletCtx = useMemo<AdminOutletContextType>(
    () => ({ setHeader }),
    [setHeader],
  );

  return (
    <AdminLayout
      searchPlaceholder={header?.searchPlaceholder ?? "Search..."}
      searchValue={header?.searchValue ?? ""}
      onSearch={header?.onSearch}
    >
      <Suspense fallback={<RouteMainFallback />}>
        <Outlet context={outletCtx} />
      </Suspense>
    </AdminLayout>
  );
}
