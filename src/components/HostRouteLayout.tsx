import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import HostLayout from "@/components/HostLayout";
import { RouteMainFallback } from "@/components/RouteMainFallback";

export default function HostRouteLayout() {
  return (
    <HostLayout>
      <Suspense fallback={<RouteMainFallback />}>
        <Outlet />
      </Suspense>
    </HostLayout>
  );
}
