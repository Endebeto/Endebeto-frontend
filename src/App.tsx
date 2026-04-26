import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
const HostApply = lazy(() => import("./pages/HostApply"));
const HostApplicationStatus = lazy(() => import("./pages/HostApplicationStatus"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const OAuthSuccess = lazy(() => import("./pages/OAuthSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
  if (loading) return null;
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

    {/* Authenticated */}
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
    <Route path="/host/apply" element={<ProtectedRoute><HostApply /></ProtectedRoute>} />
    <Route path="/host/application-status" element={<ProtectedRoute><HostApplicationStatus /></ProtectedRoute>} />

    {/* Host (approved hosts + admins) */}
    <Route path="/host-dashboard" element={<ProtectedRoute allowedRoles={["host"]}><HostDashboard /></ProtectedRoute>} />
    <Route path="/host/wallet" element={<ProtectedRoute allowedRoles={["host"]}><HostWallet /></ProtectedRoute>} />
    <Route path="/host/experiences" element={<ProtectedRoute allowedRoles={["host"]}><HostExperiences /></ProtectedRoute>} />
    <Route path="/host/experiences/create" element={<ProtectedRoute allowedRoles={["host"]}><HostCreateExperience /></ProtectedRoute>} />
    <Route path="/host/experiences/:id/edit" element={<ProtectedRoute allowedRoles={["host"]}><HostEditExperience /></ProtectedRoute>} />
    <Route path="/host/bookings" element={<ProtectedRoute allowedRoles={["host"]}><HostBookings /></ProtectedRoute>} />

    {/* Admin */}
    <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/experiences" element={<ProtectedRoute allowedRoles={["admin"]}><AdminExperiences /></ProtectedRoute>} />
    <Route path="/admin/host-applications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminHostApplications /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
    <Route path="/admin/payouts" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPayouts /></ProtectedRoute>} />
    <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReviews /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
