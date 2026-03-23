import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import Experiences from "./pages/Experiences";
import ExperienceDetail from "./pages/ExperienceDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHostApplications from "./pages/AdminHostApplications";
import AdminUsers from "./pages/AdminUsers";
import AdminPayouts from "./pages/AdminPayouts";
import AdminExperiences from "./pages/AdminExperiences";
import HostDashboard from "./pages/HostDashboard";
import HostWallet from "./pages/HostWallet";
import HostCreateExperience from "./pages/HostCreateExperience";
import HostExperiences from "./pages/HostExperiences";
import Profile from "./pages/Profile";
import BecomeHost from "./pages/BecomeHost";
import HostApply from "./pages/HostApply";
import HostApplicationStatus from "./pages/HostApplicationStatus";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import OAuthSuccess from "./pages/OAuthSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
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
    <Route path="/host/apply" element={<ProtectedRoute><HostApply /></ProtectedRoute>} />
    <Route path="/host/application-status" element={<ProtectedRoute><HostApplicationStatus /></ProtectedRoute>} />

    {/* Host */}
    <Route path="/host-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><HostDashboard /></ProtectedRoute>} />
    <Route path="/host/wallet" element={<ProtectedRoute allowedRoles={["admin"]}><HostWallet /></ProtectedRoute>} />
    <Route path="/host/experiences" element={<ProtectedRoute allowedRoles={["admin"]}><HostExperiences /></ProtectedRoute>} />
    <Route path="/host/experiences/create" element={<ProtectedRoute allowedRoles={["admin"]}><HostCreateExperience /></ProtectedRoute>} />

    {/* Admin */}
    <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/experiences" element={<ProtectedRoute allowedRoles={["admin"]}><AdminExperiences /></ProtectedRoute>} />
    <Route path="/admin/host-applications" element={<ProtectedRoute allowedRoles={["admin"]}><AdminHostApplications /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
    <Route path="/admin/payouts" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPayouts /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
