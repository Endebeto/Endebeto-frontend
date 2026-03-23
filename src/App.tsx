import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/experiences" element={<Experiences />} />
          <Route path="/experiences/:id" element={<ExperienceDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/experiences" element={<AdminExperiences />} />
          <Route path="/admin/host-applications" element={<AdminHostApplications />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/payouts" element={<AdminPayouts />} />
          <Route path="/host-dashboard" element={<HostDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/become-host" element={<BecomeHost />} />
          <Route path="/host/apply" element={<HostApply />} />
          <Route path="/host/application-status" element={<HostApplicationStatus />} />
          <Route path="/host/wallet" element={<HostWallet />} />
          <Route path="/host/experiences" element={<HostExperiences />} />
          <Route path="/host/experiences/create" element={<HostCreateExperience />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
