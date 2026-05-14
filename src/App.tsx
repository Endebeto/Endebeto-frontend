import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AdminRouteLayout from "@/components/AdminRouteLayout";
import HostRouteLayout from "@/components/HostRouteLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const Index = lazy(() => import("./pages/Index"));
const Experiences = lazy(() => import("./pages/Experiences"));
const ExperienceDetail = lazy(() => import("./pages/ExperienceDetail"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminHostApplications = lazy(() => import("./pages/AdminHostApplications"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminPayouts = lazy(() => import("./pages/AdminPayouts"));
const AdminExperiences = lazy(() => import("./pages/AdminExperiences"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const HostDashboard = lazy(() => import("./pages/HostDashboard"));
const HostWallet = lazy(() => import("./pages/HostWallet"));
const HostCreateExperience = lazy(() => import("./pages/HostCreateExperience"));
const HostEditExperience = lazy(() => import("./pages/HostEditExperience"));
const HostExperiences = lazy(() => import("./pages/HostExperiences"));
const HostBookings = lazy(() => import("./pages/HostBookings"));
const Profile = lazy(() => import("./pages/Profile"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const BecomeHost = lazy(() => import("./pages/BecomeHost"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SafetyPage = lazy(() => import("./pages/SafetyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const HostApply = lazy(() => import("./pages/HostApply"));
const HostApplicationStatus = lazy(() => import("./pages/HostApplicationStatus"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const OAuthSuccess = lazy(() => import("./pages/OAuthSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

/**
 * §3.6: Listens for the `auth:expired` event dispatched by the Axios
 * interceptor and navigates to /login using React Router (no hard reload).
 * Must be rendered inside BrowserRouter so useNavigate is available.
 */
function AuthExpiredRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: Event) => {
      const message = (e as CustomEvent<{ message?: string }>).detail?.message;
      const state = message ? { authSessionMessage: message } : undefined;
      navigate("/login", { replace: true, state });
    };
    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, [navigate]);
  return null;
}

/** Shown while a lazy route chunk loads (first visit to that page). */
function RouteFallback() {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-background"
      role="status"
      aria-label="Loading page"
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  // Supported values: "admin", "host" (approved host OR admin), or any role string
  allowedRoles?: string[];
}) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading)
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center bg-background"
        role="status"
        aria-label="Checking session"
      >
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user) {
    const isAdmin = user.role === "admin";
    const isApprovedHost = user.hostStatus === "approved";

    const hasAccess = allowedRoles.some((r) => {
      if (r === "admin") return isAdmin;
      if (r === "host") return isApprovedHost || isAdmin; // admins can access host routes too
      return user.role === r;
    });

    if (!hasAccess) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Index />} />
    <Route path="/experiences" element={<Experiences />} />
    <Route path="/experiences/:id" element={<ExperienceDetail />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
    <Route path="/verify-email/:token" element={<VerifyEmail />} />
    <Route path="/oauth-success" element={<OAuthSuccess />} />
    <Route path="/become-host" element={<BecomeHost />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/safety" element={<SafetyPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />

    {/* Authenticated */}
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
    <Route path="/host/apply" element={<ProtectedRoute><HostApply /></ProtectedRoute>} />
    <Route path="/host/application-status" element={<ProtectedRoute><HostApplicationStatus /></ProtectedRoute>} />

    {/* Host dashboard shell: layout stays mounted; lazy leaf chunks suspend inside Suspense */}
    <Route element={<ProtectedRoute allowedRoles={["host"]}><HostRouteLayout /></ProtectedRoute>}>
      <Route path="/host-dashboard" element={<HostDashboard />} />
      <Route path="/host/wallet" element={<HostWallet />} />
      <Route path="/host/experiences" element={<HostExperiences />} />
      <Route path="/host/experiences/create" element={<HostCreateExperience />} />
      <Route path="/host/experiences/:id/edit" element={<HostEditExperience />} />
      <Route path="/host/bookings" element={<HostBookings />} />
    </Route>

    {/* Admin: nested under /admin so outlet + Suspense wrap lazy pages */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminRouteLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="experiences" element={<AdminExperiences />} />
      <Route path="host-applications" element={<AdminHostApplications />} />
      <Route path="payouts" element={<AdminPayouts />} />
      <Route path="reviews" element={<AdminReviews />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <AuthExpiredRedirect />
          <Suspense fallback={<RouteFallback />}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
