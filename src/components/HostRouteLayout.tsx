import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import HostLayout from "@/components/HostLayout";
import { RouteMainFallback } from "@/components/RouteMainFallback";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function HostRouteLayout() {
  return (
    <HostLayout>
      <ErrorBoundary scope="Host Portal">
        <Suspense fallback={<RouteMainFallback />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </HostLayout>
  );
}
